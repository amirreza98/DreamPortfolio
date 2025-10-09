 
import useGitHubRepos from "./FetchAllRepos";
import SwipeStack from "./SwipeIMGs";
import { useState } from "react";

 function Items() {
      const [hovered, setHovered] = useState<number | null>(null);
      const repos = useGitHubRepos("amirreza98");

   return (
            <div className="flex flex-col min-h-max justify-center items-center">
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
                  className={`flex-1 w-40 ml-12 z-10 group transition-transform duration-300 items-center justify-center ${appearance}`}
                >
                  {/* repo icon circle */}
                  <div className="w-28 z-40 h-full flex overflow-visible justify-center items-center">
                    <div className="w-14 h-14 bg-gray-50/80 z-50 rounded-full flex items-center justify-center cursor-pointer hover:bg-white hover:drop-shadow-black">
                      {repo.name[0]} {/* placeholder for icon */}
                    </div>
                  </div>

                  {/* expanding line to the right */}
                  <span
                    className="pointer-events-none absolute left-16 inset-1/2 h-px w-0
                              bg-gray-400/70 transition-all duration-300 origin-left
                              group-hover:w-64"
                  />
                  {/* repo showcase card */}
                  <div
                    className="absolute flex flex-col justify-center items-center left-22 top-1/2 -translate-y-1/2
                                ml-10 w-64 rounded-xl bg-gray-800/10 backdrop-blur p-3 shadow-lg
                                opacity-0 translate-x-3 scale-95 transition-all duration-300
                                group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100
                                pointer-events-none group-hover:pointer-events-auto group-hover:z-50"
                  >
                    <div className=" text-white/90 text-sm font-semibold" style={{ textShadow: "1px 1px 1px rgba(0.8,0.8,0.8,0.8)" }}>{repo.name}</div>

                    {repo.preview?.length ? (
                      <div className="m-2 w-40">
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
   )
 }
 
 export default Items
 