import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { House, Gamepad2, FolderGit2, BookUser, Mail } from "lucide-react";

/** Ordered list of section IDs (for iteration, includes checks, etc.) */
const SECTION_LIST = ["home", "game", "projects", "stack", "contact"] as const;
type SectionId = (typeof SECTION_LIST)[number];

/** Map each section to its icon component */
const SECTION_ICONS: Record<SectionId, React.ElementType> = {
  home: House,
  game: Gamepad2,
  projects: FolderGit2,
  stack: BookUser,
  contact: Mail,
};

export default function Navbar() {
  const [active, setActive] = useState<SectionId>("home");
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Smooth scroll to section (no offset)
  function smoothScrollTo(id: SectionId) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  }

  useEffect(() => {
    const page = document.getElementById("page");
    const targetForScroll: HTMLElement | Window = page ?? window;
    const getScrollTop = () => (page ? page.scrollTop : window.scrollY || 0);
    const handleScroll = () => setScrolled(getScrollTop() > 20);

    targetForScroll.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // IntersectionObserver to detect active section
    const sections = SECTION_LIST.map((id) => document.getElementById(id)).filter(
      Boolean
    ) as HTMLElement[];

    const io = new IntersectionObserver(
      (entries) => {
        // pick the entry with the highest intersection ratio
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (best && best.isIntersecting) {
          const id = best.target.id as SectionId;
          if (SECTION_LIST.includes(id)) setActive(id);
        }
      },
      {
        root: page ?? null,
        threshold: [0.25, 0.5, 0.75],
        rootMargin: "0px",
      }
    );

    sections.forEach((sec) => io.observe(sec));

    // Sync via hash (e.g., #contact?anim=drain)
    const syncByHash = () => {
      const raw = window.location.hash.replace("#", "");
      const id = (raw.split("?")[0] || "home") as SectionId;
      if (SECTION_LIST.includes(id)) {
        setActive(id);
        // ensure we scroll to it
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
      className={`fixed left-0 h-full z-20 flex flex-col items-center py-5 
      ${scrolled ? "bg-black/40 backdrop-blur" : "bg-transparent"}`}
    >
      {/* Logo */}
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
        <p className="text-white text-[18px] font-bold cursor-pointer flex px-3">
          Amir Reza&nbsp;<span className="sm:block hidden">Azemati</span>
        </p>
      </Link>

      {/* Desktop menu: icons only */}
      <ul className="pt-8 list-none hidden sm:flex flex-col gap-6">
        {SECTION_LIST.map((id) => {
          const Icon = SECTION_ICONS[id];
          const isActive = active === id;
          return (
            <li key={id} className="flex justify-center">
              <a
                href={`#${id}`}
                aria-label={id}
                title={id}
                className={`p-2 rounded-xl transition 
                  ${isActive ? "text-yellow-400" : "text-gray-300 hover:text-white"}
                  ${isActive ? "bg-white/10" : "bg-transparent"}
                `}
                onClick={(e) => {
                  e.preventDefault();
                  setActive(id);
                  window.location.hash = `#${id}`;
                  smoothScrollTo(id);
                }}
              >
                <Icon size={22} strokeWidth={2} />
              </a>
            </li>
          );
        })}
      </ul>

      {/* Mobile: icon grid in a dropdown */}
      <div className="sm:hidden flex flex-1 justify-end items-start mt-4">
        <button
          className="ml-3 px-3 py-2 rounded-lg bg-white/10 text-white"
          onClick={() => setToggle((t) => !t)}
          aria-label="Toggle menu"
        >
          {toggle ? "Close" : "Menu"}
        </button>

        <div
          className={`${
            !toggle ? "hidden" : "flex"
          } p-4 absolute top-20 left-2 mx-4 my-2 min-w-[220px] z-30 rounded-xl bg-black/70 backdrop-blur`}
        >
          <ul className="list-none grid grid-cols-5 gap-3">
            {SECTION_LIST.map((id) => {
              const Icon = SECTION_ICONS[id];
              const isActive = active === id;
              return (
                <li key={id} className="flex justify-center">
                  <a
                    href={`#${id}`}
                    aria-label={id}
                    title={id}
                    className={`p-2 rounded-lg transition 
                      ${isActive ? "text-yellow-400" : "text-amber-300 hover:text-white"}
                      ${isActive ? "bg-white/10" : "bg-transparent"}
                    `}
                    onClick={(e) => {
                      e.preventDefault();
                      setToggle(false);
                      setActive(id);
                      window.location.hash = `#${id}`;
                      setTimeout(() => smoothScrollTo(id), 0);
                    }}
                  >
                    <Icon size={22} strokeWidth={2} />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
