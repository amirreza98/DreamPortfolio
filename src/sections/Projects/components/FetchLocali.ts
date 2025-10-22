// FetchAllRepos.ts
import { useEffect, useState } from "react";

type RepoPreview = { name: string; preview: string[] };

const TOKEN = import.meta.env.VITE_GH_TOKEN;

const TARGETS = [
  "SolarSense",
  "CISpace",
  "twindigital",
  "realtor",
  "old-portfolio",
  "openmemory",
  "memorygame",
] as const;

// اگر اسم پوشه با ریپو فرق دارد، اینجا مپ کن
const LOCAL_PREVIEW_ALIAS: Record<string, string> = {
  // repoName: folderName
  SolarSense: "SolarSensePreview",
};

function buildLocalPreviewMap(): Record<string, string[]> {
  // هر تصویر داخل src/assets/**/* را بگیر
  const modules = import.meta.glob(
    "/src/assets/**/*.{png,jpg,jpeg,webp,gif}",
    { eager: true, as: "url" }
  ) as Record<string, string>;

  const map: Record<string, string[]> = {};

  // helper برای اضافه‌کردن URL به یک کلید
  const add = (key: string, url: string) => {
    (map[key] ??= []).push(url);
  };

  for (const [path, url] of Object.entries(modules)) {
    // 1) حالت استاندارد: /src/assets/previews/<RepoName>/<file>
    const m1 = path.match(/\/assets\/previews\/([^/]+)\/[^/]+\.(png|jpe?g|webp|gif)$/i);
    if (m1) {
      const repoName = m1[1];
      add(repoName, url);
      continue;
    }

    // 2) حالت فولدرهای *Preview: /src/assets/<Something>Preview/<file>
    const m2 = path.match(/\/assets\/([^/]+)Preview\/[^/]+\.(png|jpe?g|webp|gif)$/i);
    if (m2) {
      const base = m2[1]; // e.g. "SolarSense"
      add(base, url);
      continue;
    }

    // 3) حالت alias سفارشی: اگر فولدر با alias تعریف شده
    for (const [repoName, folderName] of Object.entries(LOCAL_PREVIEW_ALIAS)) {
      const rx = new RegExp(`/assets/${folderName}/[^/]+\\.(png|jpe?g|webp|gif)$`, "i");
      if (rx.test(path)) {
        add(repoName, url);
        break;
      }
    }
  }

  // سورت برای ثبات
  for (const k of Object.keys(map)) {
    map[k] = map[k].sort((a, b) => a.localeCompare(b));
  }
  return map;
}

export default function useRepoPreviewsOneCallLocali(owner: string) {
  const [items, setItems] = useState<RepoPreview[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const localMap = buildLocalPreviewMap();

    // اگر برای همه‌ی تارگت‌ها لوکال داریم → دیگه API لازم نیست
    const allLocal = TARGETS.every((name) => localMap[name]?.length);
    if (allLocal) {
      setItems(TARGETS.map((name) => ({ name, preview: localMap[name] })));
      return;
    }

    (async () => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "application/json",
        };
        if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

        const needsRemote = TARGETS.filter((name) => !(localMap[name]?.length));
        let remoteData: Record<string, any> = {};

        if (needsRemote.length) {
          const blocks = needsRemote
            .map((repo, i) => {
              const alias = `r${i}`;
              return `
                ${alias}: repository(owner: "${owner}", name: "${repo}") {
                  name
                  defaultBranchRef { name }
                  previewTree: object(expression: "HEAD:preview") {
                    ... on Tree { entries { name type } }
                  }
                }
              `;
            })
            .join("\n");

          const query = `query { ${blocks} }`;
          const res = await fetch("https://api.github.com/graphql", {
            method: "POST",
            headers,
            body: JSON.stringify({ query }),
          });
          const json = await res.json();
          if (!res.ok || json.errors) throw new Error(JSON.stringify(json.errors ?? json, null, 2));
          remoteData = json.data;
        }

        const finalItems: RepoPreview[] = [];
        TARGETS.forEach((name) => {
          // 1) لوکال اولویت دارد
          if (localMap[name]?.length) {
            finalItems.push({ name, preview: localMap[name] });
            return;
          }
          // 2) ریموت (درصورت وجود)
          const idx = needsRemote.indexOf(name);
          if (idx >= 0) {
            const node = remoteData[`r${idx}`];
            if (node) {
              const branch = node.defaultBranchRef?.name ?? "HEAD";
              const entries: Array<{ name: string; type: string }> =
                node.previewTree?.entries ?? [];
              const files = entries
                .filter((e) => e.type === "blob" && /\.(png|jpe?g|gif|webp)$/i.test(e.name))
                .map((e) => e.name)
                .sort((a, b) => a.localeCompare(b));
              const base = `https://raw.githubusercontent.com/${owner}/${node.name}/${branch}/preview`;
              const urls = files.map((f) => `${base}/${encodeURIComponent(f)}`);
              finalItems.push({ name, preview: urls });
              return;
            }
          }
          // 3) خالی
          finalItems.push({ name, preview: [] });
        });

        setItems(finalItems);
      } catch (e: any) {
        setError(e?.message ?? "GraphQL request failed");
      }
    })();
  }, [owner]);

  return { items, error };
}