import { useEffect, useState } from "react";

type Repo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  preview?: string[];
};

const GITHUB_API = "https://api.github.com";
const TOKEN = import.meta.env.VITE_GH_TOKEN; // put your PAT in .env.local (frontend is risky; prefer a tiny backend proxy)

export default function useGitHubRepos(username: string) {
  const [repos, setRepos] = useState<Repo[]>([]);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const headers: Record<string, string> = {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        };
        if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

        // 1) Get up to 100 repos (1 call)
        const res = await fetch(`${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated`, { headers });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          const remaining = res.headers.get("X-RateLimit-Remaining");
          const reset = res.headers.get("X-RateLimit-Reset");
          console.error("Repo list error:", errJson, { remaining, reset });
          return;
        }
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("GitHub API returned unexpected data:", data);
          return;
        }

        // 2) Limit how many repos you probe for previews to avoid burning quota
        const candidates = data.slice(0, 10); // tweak (e.g., 8–12)

        // 3) Fetch previews SEQUENTIALLY (reduces burst/abuse triggers)
        const enriched: Repo[] = [];
        for (const repo of candidates) {
          try {
            const previewRes = await fetch(
              `${GITHUB_API}/repos/${username}/${repo.name}/contents/preview`,
              { headers }
            );

            if (!previewRes.ok) {
              enriched.push({ ...repo, preview: [] });
              continue;
            }

            const files = await previewRes.json();
            const preview = Array.isArray(files)
              ? files
                  .filter((f: any) => /\.(png|jpe?g|gif)$/i.test(f.name))
                  .map((f: any) => f.download_url)
              : [];

            enriched.push({ ...repo, preview });
          } catch {
            enriched.push({ ...repo, preview: [] });
          }
        }

        setRepos(enriched.filter(r => r.preview && r.preview.length > 0));
      } catch (err) {
        console.error("Failed to fetch repos:", err);
      }
    }

    fetchRepos();
  }, [username]);

  return repos;
}
