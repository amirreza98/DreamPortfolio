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

export default function useGitHubRepos(username: string) {
  const [repos, setRepos] = useState<Repo[]>([]);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const res = await fetch(`https://api.github.com/users/${username}/repos`);
        const data = await res.json();

        const enriched = await Promise.all(
          data.map(async (repo: any) => {
            try {
              const previewRes = await fetch(
                `https://api.github.com/repos/${username}/${repo.name}/contents/preview`
              );
              if (!previewRes.ok) return { ...repo, preview: [] };

              const files = await previewRes.json();
              const preview = files
                .filter((f: any) => f.name.match(/\.(png|jpg|jpeg|gif)$/i))
                .map((f: any) => f.download_url);

              return { ...repo, preview };
            } catch {
              return { ...repo, preview: [] };
            }
          })
        );
        
        setRepos(
          enriched.filter(r => r.preview && r.preview.length > 0)
        );
      } catch (err) {
        console.error(err);
      }
    }

    fetchRepos();
  }, [username]);

  return repos;
}
