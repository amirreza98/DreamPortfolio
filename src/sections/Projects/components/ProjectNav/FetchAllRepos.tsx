import { useEffect, useState } from "react";

type Repo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  imgs?: string[];
};

export default function useGitHubRepos(username: string) {
  const [repos, setRepos] = useState<Repo[]>([]);

  useEffect(() => {
    async function fetchRepos() {
      try {
        // 1️⃣ Fetch repos
        const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
        const data = await res.json();

        // 2️⃣ For each repo, try to fetch the contents of /preview
        const enriched = await Promise.all(
          data.map(async (repo: any) => {
            try {
              const previewRes = await fetch(
                `https://api.github.com/repos/${username}/${repo.name}/preview`
              );
              if (!previewRes.ok) return { ...repo, imgs: [] };

              const files = await previewRes.json();
              const imgs = files
                .filter((f: any) => f.name.match(/\.(png|jpg|jpeg|gif)$/i))
                .map((f: any) =>
                  f.download_url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/")
                );

              return { ...repo, imgs };
            } catch {
              return { ...repo, imgs: [] };
            }
          })
        );

        setRepos(enriched);
      } catch (err) {
        console.error(err);
      }
    }

    fetchRepos();
  }, [username]);

  return repos;
}
