// netlify/functions/gh-previews.js
export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }
    const { owner, repos } = JSON.parse(event.body || "{}");
    if (!owner || !Array.isArray(repos)) {
      return { statusCode: 400, body: "Invalid payload" };
    }

    const token = process.env.GH_TOKEN; // ⬅️ توکن فقط سمت سرور
    if (!token) {
      return { statusCode: 500, body: "GH_TOKEN is missing in env" };
    }

    // یک کوئری GraphQL بَچ‌شده بساز
    const blocks = repos.map((repo, i) => `
      r${i}: repository(owner: "${owner}", name: "${repo}") {
        name
        defaultBranchRef { name }
        previewTree: object(expression: "HEAD:preview") {
          ... on Tree { entries { name type } }
        }
      }
    `).join("\n");

    const query = `query { ${blocks} }`;

    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      },
      body: JSON.stringify({ query })
    });

    const json = await res.json();
    if (!res.ok || json.errors) {
      return {
        statusCode: res.status,
        body: JSON.stringify(json.errors ?? json, null, 2)
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(json.data)
    };
  } catch (e) {
    return { statusCode: 500, body: e?.message ?? "Server error" };
  }
}
