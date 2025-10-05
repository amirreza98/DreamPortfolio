import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SECTIONS = ["home", "game", "projects", "stack", "contact"] as const;
type SectionId = (typeof SECTIONS)[number];

export default function Navbar() {
  const [active, setActive] = useState<SectionId>("home");
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // اسکرول نرم بدون آفست (از scrollIntoView استفاده می‌کنیم)
  function smoothScrollTo(id: SectionId) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    const page = document.getElementById("page");
    const targetForScroll = page ?? window;
    const getScrollTop = () => (page ? page.scrollTop : window.scrollY || 0);
    const handleScroll = () => setScrolled(getScrollTop() > 20);

    targetForScroll.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // تشخیص سکشن فعال با IntersectionObserver (بدون rootMargin/offset)
    const sections = SECTIONS.map((id) => document.getElementById(id)).filter(
      Boolean
    ) as HTMLElement[];

    const io = new IntersectionObserver(
      (entries) => {
        // بیشترین بخش دیده‌شده را active کن
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (best && best.isIntersecting) {
          const id = best.target.id as SectionId;
          if (SECTIONS.includes(id)) setActive(id);
        }
      },
      {
        root: page ?? null,
        threshold: [0.25, 0.5, 0.75], // حساسیت نمایش
        // بدون هیچ آفستی:
        rootMargin: "0px 0px 0px 0px",
      }
    );

    sections.forEach((sec) => io.observe(sec));

    // sync با hash (مثل #contact?anim=drain)
    const syncByHash = () => {
      const raw = window.location.hash.replace("#", "");
      const id = (raw.split("?")[0] || "home") as SectionId;
      if (SECTIONS.includes(id)) {
        setActive(id);
        // اسکرول نرم به خود سکشن (بدون آفست)
        setTimeout(() => smoothScrollTo(id), 0);
      }
    };
    window.addEventListener("hashchange", syncByHash);
    syncByHash();

    return () => {
      targetForScroll.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", syncByHash);
      io.disconnect();
    };
  }, []);

  return (
    <nav
      className={`h-full flex flex-col items-center py-5 fixed top-0 z-20 ${
        scrolled ? "bg-yellow-300" : "bg-transparent"
      }`}
    >
      <div>
        {/* لوگو */}
        <Link
          to="/"
          className="flex items-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            setActive("home");
            window.location.hash = "#home";
            smoothScrollTo("home");
          }}
        >
          <p className="text-white text-[18px] font-bold cursor-pointer flex">
            Amir Reza&nbsp;<span className="sm:block hidden">Azemati</span>
          </p>
        </Link>

        {/* منوی دسکتاپ */}
        <ul className="pt-10 list-none hidden sm:flex flex-col gap-10">
          {SECTIONS.map((id) => (
            <li
              key={id}
              className={`${
                active === id ? "text-white" : "text-blue-400"
              } hover:text-white text-[18px] font-medium cursor-pointer`}
            >
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActive(id);
                  window.location.hash = `#${id}`;
                  smoothScrollTo(id);
                }}
              >
                {id}
              </a>
            </li>
          ))}
        </ul>

        {/* منوی موبایل */}
        <div className="sm:hidden flex flex-1 justify-end items-center mt-4">
          <button
            className="px-3 py-2 rounded-lg bg-white/10 text-white"
            onClick={() => setToggle((t) => !t)}
            aria-label="Toggle menu"
          >
            {toggle ? "Close" : "Menu"}
          </button>

          <div
            className={`${
              !toggle ? "hidden" : "flex"
            } p-6 black-gradient absolute top-20 right-0 mx-4 my-2 min-w-[160px] z-10 rounded-xl bg-black/70 backdrop-blur`}
          >
            <ul className="list-none flex justify-end items-start flex-1 flex-col gap-4">
              {SECTIONS.map((id) => (
                <li
                  key={id}
                  className={`font-medium cursor-pointer text-[16px] ${
                    active === id ? "text-white" : "text-amber-300"
                  }`}
                >
                  <a
                    href={`#${id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setToggle(false);
                      setActive(id);
                      window.location.hash = `#${id}`;
                      setTimeout(() => smoothScrollTo(id), 0);
                    }}
                  >
                    {id}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
