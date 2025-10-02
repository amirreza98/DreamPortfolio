import { useState } from "react";
import useGitHubRepos from "./ProjectNav/fetchAllRepos";

export default function ProjectsNav() {
  const [hovered, setHovered] = useState<number | null>(null);
  const repos = useGitHubRepos("amirreza98");

  return (
    <div className="w-40 flex items-center justify-center hover:scale-105 hover:translate-x-4 transition-transform duration-300">
      <div className="flex h-11/12 w-20 bg-gray-700 p-5 justify-center rounded-3xl ">
        <div className="flex flex-col  rounded-2xl shadow-lg">
          {repos.map((repo, i) => {
            // dock scaling: hovered = big, neighbors = medium
            let appearance = "scale-100";
            if (hovered === repo.id) appearance = "scale-125 translate-x-10 duration-300";
            else if (
              hovered !== null &&
              (repos[i - 1]?.id === hovered || repos[i + 1]?.id === hovered)
            )
              appearance = "scale-110 translate-x-4 duration-300";

            return (
              <div
                key={repo.id}
                onMouseEnter={() => setHovered(repo.id)}
                onMouseLeave={() => setHovered(null)}
                className={`transition-transform duration-300 ${appearance}`}
              >
                <div className="w-18 h-18 flex justify-center">
                  <div className="w-14 h-14 bg-gray-50/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400">
                    {repo.name[0]} {/* placeholder for icon */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
