import useRepoPreviewsOneCall from "./FetchAllRepos";
import { LOCAL_META } from "./localMeta";
import useRepoPreviewsOneCallLocali from "./FetchLocali";
import SwipeStack from "./SwipeIMGs";
import { useState } from "react";
import { Github, Link2 } from 'lucide-react';

function Items() {
  const [hovered, setHovered] = useState<number | null>(null);
  const { items, error } = useRepoPreviewsOneCallLocali("amirreza98");

  if (error) return <div className="text-red-400 text-sm font-mono px-4 py-2">{error}</div>;
  if (!items.length) {
    return (
      <div className="flex flex-col gap-3 w-full items-center">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 w-80 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  // ➊ مِرج متادیتا + عنوان/خلاصه/ترتیب
  const merged = items
    .map((repo: any) => {
      const meta = LOCAL_META[repo.name] ?? {};
      return {
        ...repo,
        displayName: meta.title ?? repo.name,
        blurb: meta.blurb ?? repo.description ?? "", // fallback به توضیح گیت‌هاب
        tags: meta.tags ?? [],
        pin: meta.pin ?? 999,        // ریپوهایی که پین ندارن آخر بیان
        hidden: meta.hidden ?? false,
        Link: meta.Link ?? null,
      };
    })
    .filter((r: any) => !r.hidden)
    .sort((a: any, b: any) => a.pin - b.pin || a.displayName.localeCompare(b.displayName));

  return (
    <div className="flex flex-col min-h-max justify-center items-center">
      {merged.map((repo: any, i: number) => {
        let appearance = "scale-100";
        if (hovered === i) appearance = "scale-125 translate-x-10 duration-300";
        else if (hovered !== null && (i - 1 === hovered || i + 1 === hovered)) {
          appearance = "scale-110 translate-x-4 duration-300";
        }

        return (
          <div
            key={repo.name}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className={`relative flex-1 w-40 ml-12 z-10 group transition-transform duration-300 items-center justify-center ${appearance}`}
          >
            {/* آیکن */}
            <div className="w-28 z-40 h-full flex overflow-visible justify-center items-center">
              <div className="w-14 h-14 bg-gray-50/80 z-50 rounded-full flex items-center justify-center cursor-pointer hover:drop-shadow">
                {repo.displayName?.[0] ?? "•"}
              </div>
            </div>

            {/* خط */}
            <span className="pointer-events-none absolute left-16 top-1/2 -translate-y-1/2 h-px w-0 bg-gray-400/70 transition-all duration-700 origin-left group-hover:w-18" />

            {/* کارت نمایش */}
            <div
              className="absolute flex flex-col justify-center items-start left-20 top-1/2 -translate-y-1/2
                         ml-10 w-64 rounded-xl bg-white/10 backdrop-blur p-3 shadow-lg
                         opacity-0 translate-x-3 scale-95 transition-all duration-300
                         group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100
                         pointer-events-none group-hover:pointer-events-auto group-hover:z-50"
            >
              <div className="text-white/90 text-base font-semibold" style={{ textShadow: "1px 1px 1px rgba(0,0,0,0.5)" }}>
                {repo.displayName}
              </div>
              <div className="flex flex-row space-x-2 items-center">
                <p className="text-[0.5rem] text-white/90">Repo:</p>
                <a
                  href={`https://github.com/amirreza98/${repo.name}`}
                  target="_blank"
                  className="mt-1 w-4 h-6 text-blue-600 hover:text-blue-400 transition-colors"
                >
                  <Github size={20} />
                </a>
                <p className="text-[0.5rem] text-white/90 ml-3">Website:</p>
                {repo.Link ? (
                  <a
                    href={repo.Link}
                    target="_blank"
                    className="mt-1 w-4 h-6 text-green-600 hover:text-green-400 transition-colors"
                  >
                    <Link2 size={20} />
                </a>
                ) : (
                  <span className="relative group flex items-center justify-center after:content-['Private'] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:bg-black/80 after:text-white after:text-[0.5rem] after:p-1 after:rounded-md after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300">
                    🔒
                  </span>
                )}
              </div>
              {/* خلاصه‌ی 1 خطی */}
              {repo.blurb && (
                <p className="text-xs text-gray-300 mt-1 line-clamp-2">{repo.blurb}</p>
              )}

              {/* برچسب‌های کوتاه (اختیاری) */}
              {!!repo.tags?.length && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {repo.tags.map((t: string) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* اسلایدر عکس‌ها */}
                <div className="m-2 w-44 self-center">
                  <SwipeStack images={repo.preview} name={repo.displayName} />
                </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default Items;
