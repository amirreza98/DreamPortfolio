import { useState } from "react";
import useGitHubRepos from "./FetchAllRepos";
import SwipeStack from "./SwipeIMGs";

export default function ProjectsNav() {
  const [hovered, setHovered] = useState<number | null>(null);
  const repos = useGitHubRepos("amirreza98");

  return (
    <div className="w-52 flex items-center justify-center bg-amber-950 hover:scale-105 hover:translate-x-4 transition-transform duration-300">
      <div className="flex h-11/12 w-20 bg-gray-700 p-5 mr-12 justify-center rounded-3xl ">
        <div className="flex flex-col justify-between rounded-2xl shadow-lg">
          {repos.map((repo, i) => {
            // dock scaling: hovered = big, neighbors = medium
            let appearance = "scale-100";
            if (hovered === repo.id) appearance = "scale-130 translate-x-10 duration-300";


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
                className={`relative group transition-transform duration-300 ${appearance}`}
              >
                {/* repo icon circle */}
                <div className="w-28 h-18 flex relative overflow-visible justify-center">
                  <div className="w-14 h-14 bg-gray-50/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400">
                    {repo.name[0]} {/* placeholder for icon */}
                  </div>
                </div>

                {/* expanding line to the right */}
                <span
                  className="pointer-events-none absolute left-16 top-2/5 h-px w-0
                            bg-gray-400/70 transition-all duration-300 origin-left
                            group-hover:w-64"
                />
                {/* repo showcase card */}
                <div
                  className="pointer-events-auto absolute left-[calc(4rem+1rem)] top-1/2 -translate-y-1/2
                            ml-10 w-64 rounded-xl bg-gray-800/80 backdrop-blur p-3 shadow-lg
                            opacity-0 translate-x-3 scale-95 transition-all duration-300
                            group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100"
                >
                  <div className="text-sm font-semibold text-white truncate">{repo.name}</div>

                  {repo.preview?.length ? (
                    <div className="mt-2">
                      <SwipeStack images={repo.preview} name={repo.name} />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No preview available</p>
                  )}

                </div>
                
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
