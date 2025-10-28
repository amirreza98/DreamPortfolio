import useRepoPreviewsOneCall from "./FetchAllRepos";
import { LOCAL_META } from "./localMeta";
import SimpleAutoScroller from "./SwipeIMGs";
import { useEffect, useState } from "react";
import { Github, Link2 } from "lucide-react";
// import useRepoPreviewsOneCallLocali from "./FetchLocali";

function Items() {
  const [hovered, setHovered] = useState<number | null>(null);
  const { items, error } = useRepoPreviewsOneCall("amirreza98");

  // لمس/کلیک خارج از کارت → بستن همه
  useEffect(() => {
    const closeAll = () => setHovered(null);
    document.addEventListener("pointerdown", closeAll, { passive: true });
    return () => document.removeEventListener("pointerdown", closeAll);
  }, []);

  if (error) {
    return (
      <div className="text-red-400 text-sm font-mono px-4 py-2">
        {error}
      </div>
    );
  }

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
        blurb: meta.blurb ?? repo.description ?? "",
        tags: meta.tags ?? [],
        pin: meta.pin ?? 999,
        hidden: meta.hidden ?? false,
        Link: meta.Link ?? null,
      };
    })
    .filter((r: any) => !r.hidden)
    .sort(
      (a: any, b: any) =>
        a.pin - b.pin || a.displayName.localeCompare(b.displayName)
    );

  return (
    <div
      className="flex flex-col min-h-max justify-center items-center"
      // جلوگیری از بسته‌شدن وقتی داخل لیست تاچ می‌کنیم
      onPointerDown={(e) => e.stopPropagation()}
    >
      {merged.map((repo: any, i: number) => {
        let appearance = "scale-100";
        if (hovered === i) appearance = "scale-125 translate-x-10 duration-300";
        else if (hovered !== null && (i - 1 === hovered || i + 1 === hovered)) {
          appearance = "scale-110 translate-x-4 duration-300";
        }

        const isOpen = hovered === i;

        return (
          <div
            key={repo.name}
            // دسکتاپ: هاور
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            // موبایل: تاچ برای باز/بسته‌کردن
            onTouchStart={() => setHovered((prev) => (prev === i ? null : i))}
            // دسترسی بهتر با کیبورد
            tabIndex={0}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
            className={`relative flex-1 w-40 max-sm:w-28 ml-12 max-sm:ml-0 z-10 transition-transform items-center justify-center ${appearance}`}
          >
            {/* آیکن */}
            <div className="w-28 z-40 h-full flex overflow-visible justify-center items-center">
              <button
                type="button"
                className="w-14 h-14 bg-gray-50/80 z-50 rounded-full flex items-center justify-center hover:drop-shadow focus:drop-shadow outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setHovered((prev) => (prev === i ? null : i));
                }}
              >
                {repo.displayName?.[0] ?? "•"}
              </button>
            </div>

            {/* خط اتصال */}
            <span
              className={`pointer-events-none absolute left-16 top-1/2 -translate-y-1/2 h-px bg-gray-400/70 transition-all duration-700 -z-40 origin-left
                ${isOpen ? "w-14 max-sm:w-8" : "w-0"}`}
            />

            {/* کارت و اسلایدر (نمایش وقتی باز است) */}
            <div
              className={`absolute flex max-sm:flex-col flex-row justify-center items-center left-20 top-16 -translate-y-1/2
                          ml-10 w-fit h-fit transition-all duration-500
                          ${isOpen
                            ? "opacity-100 translate-x-0 scale-100 pointer-events-auto z-50"
                            : "opacity-0 translate-x-3 scale-95 pointer-events-none"}
                          max-sm:left-14 max-sm:bg-transparent`}
              // جلوگیری از بسته‌شدن با لمس داخل کارت
              onPointerDown={(e) => e.stopPropagation()}
            > 
              {/* کارت نمایش */}
              <div className="flex flex-col h-max max-sm:items-center  bg-white/10 rounded-xl backdrop-blur p-3 shadow-lg shadow-black/30 max-sm:w-40 max-sm:mb-2">
                {/* Name */}
                <div
                  className="text-white/90 text-base font-semibold"
                  style={{ textShadow: "1px 1px 1px rgba(0,0,0,0.5)" }}
                >
                  {repo.displayName}
                </div>
                {/* links */}
                <div className="flex flex-row space-x-2 items-center">
                  <p className="text-[0.5rem] text-white/90">Repo:</p>
                  <a
                    href={`https://github.com/amirreza98/${repo.name}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 w-4 h-6 text-blue-600 hover:text-blue-400 transition-colors"
                  >
                    <Github size={20} />
                  </a>

                  <p className="text-[0.5rem] text-white/90 ml-3">Website:</p>
                  {repo.Link ? (
                    <a
                      href={repo.Link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 w-4 h-6 text-green-600 hover:text-green-400 transition-colors"
                    >
                      <Link2 size={20} />
                    </a>
                  ) : (
                    <span className="relative flex items-center justify-center after:content-['Private'] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:bg-black/80 after:text-white after:text-[0.5rem] after:p-1 after:rounded-md after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300">
                      🔒
                    </span>
                  )}
                </div>

                {/* خلاصه */}
                {repo.blurb && (
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                    {repo.blurb}
                  </p>
                )}

                {/* تگ‌ها */}
                {!!repo.tags?.length && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {repo.tags.map((t: string) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {/* خط اتصال */}
              <span
                className={`pointer-events-none h-px bg-gray-400/70 transition-all duration-700 origin-left
                            max-sm:rotate-90 max-sm:origin-top max-sm:my-2
                  ${isOpen ? "w-18 max-sm:w-6" : "w-0"}`}
              />
              {/* اسلایدر عکس‌ها */}
              <div className="flex min-w-[320px] max-sm:min-w-40 max-sm:h-32 h-56 bg-white/20 items-center justify-center rounded-xl backdrop-blur p-3 shadow-lg shadow-black/30 self-center">
                <SimpleAutoScroller images={repo.preview}/>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Items;
