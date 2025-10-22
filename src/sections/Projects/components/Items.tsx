import useRepoPreviewsOneCall from "./FetchAllRepos";
import useRepoPreviewsOneCallLocali from "./FetchLocali";
import SwipeStack from "./SwipeIMGs";
import { useState } from "react";

function Items() {
  const [hovered, setHovered] = useState<number | null>(null);
  const { items, error } = useRepoPreviewsOneCallLocali("amirreza98");

  if (error) {
    return (
      <div className="text-red-400 text-sm font-mono px-4 py-2">
        {error}
      </div>
    );
  }

  // لودینگ خیلی سبک
  if (!items.length) {
    return (
      <div className="flex flex-col gap-3 w-full items-center">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 w-80 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-max justify-center items-center">
      {items.map((repo, i) => {
        // dock scaling: hovered = big, neighbors = medium
        let appearance = "scale-100";
        if (hovered === i) appearance = "scale-125 translate-x-10 duration-300";
        else if (
          hovered !== null &&
          (i - 1 === hovered || i + 1 === hovered)
        ) {
          appearance = "scale-110 translate-x-4 duration-300";
        }

        return (
          <div
            key={repo.name}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className={`relative flex-1 w-40 ml-12 z-10 group transition-transform duration-300 items-center justify-center ${appearance}`}
          >
            {/* repo icon circle */}
            <div className="w-28 z-40 h-full flex overflow-visible justify-center items-center">
              <div className="w-14 h-14 bg-gray-50/80 z-50 rounded-full flex items-center justify-center cursor-pointer hover:bg-white hover:drop-shadow">
                {repo.name?.[0] ?? "•"}
              </div>
            </div>

            {/* expanding line to the right */}
            <span
              className="pointer-events-none absolute left-16 top-1/2 -translate-y-1/2
                         h-px w-0 bg-gray-400/70 transition-all duration-300 origin-left
                         group-hover:w-64"
            />

            {/* repo showcase card */}
            <div
              className="absolute flex flex-col justify-center items-center left-20 top-1/2 -translate-y-1/2
                         ml-10 w-64 rounded-xl bg-gray-800/10 backdrop-blur p-3 shadow-lg
                         opacity-0 translate-x-3 scale-95 transition-all duration-300
                         group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100
                         pointer-events-none group-hover:pointer-events-auto group-hover:z-50"
            >
              <div
                className="text-white/90 text-sm font-semibold"
                style={{ textShadow: "1px 1px 1px rgba(0,0,0,0.5)" }}
              >
                {repo.name}
              </div>

              {repo.preview?.length ? (
                <div className="m-2 w-44">
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
  );
}

export default Items;
