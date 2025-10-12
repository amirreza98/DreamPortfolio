import { useCallback, useEffect, useState } from "react";
import useLimitedScroll from "./useLimitedScroll";

const SECTIONS = ["home", "game", "projects", "stack", "contact"];

export default function useSectionNav(initial = "home") {
  const [active, setActive] = useState(initial);


  const scrollTo = useCallback((id: string) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    // هَش URL را هم آپدیت کن (ساده)
    window.history.replaceState(null, "", `#${id}`);
  }, []);

  // روی load/hashchange با هَش همگام بمان
  useEffect(() => {
    const syncByHash = () => {
      const raw = window.location.hash.replace("#", "");
      const id = (raw.split("?")[0] || initial);
      if (SECTIONS.includes(id)) {
        setActive(id);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    syncByHash();
    window.addEventListener("hashchange", syncByHash);
    return () => window.removeEventListener("hashchange", syncByHash);
  }, [initial]);



  // برای سازگاری با NavbarUI
  return { active, scrollTo};
}
