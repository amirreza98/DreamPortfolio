import { useEffect, useState } from "react";

type Repo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
};

export default function useGitHubRepos(username: string) {
  const [repos, setRepos] = useState<Repo[]>([]);

  useEffect(() => {
    fetch(`https://api.github.com/users/${username}/repos`)
      .then((res) => res.json())
      .then((data) => setRepos(data))
      .catch((err) => console.error(err));
  }, [username]);

  return repos; // ✅ just gives you the repos as a variable
}
