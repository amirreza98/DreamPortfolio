// useSectionNav.ts
import { useEffect, useRef, useState, useCallback } from "react";
import { subscribeKick } from "../../../utils/rubberBus";

type SectionId = "home" | "projects" | "stack" | "contact" | "game";
const SECTIONS: SectionId[] = ["home", "projects", "stack", "contact"];

export default function useSectionNav(initial: SectionId = "home") {
  const [active, setActive] = useState<SectionId>(initial);
  const [offsetY, setOffsetY] = useState(0);

  const lastValue = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitioningRef = useRef(false);

  // ----- Dynamic threshold (200 on phone/tablet, 300 on laptop/desktop)
  const computeThreshold = () => {
    // coarse pointer catches موبایل/تبلت؛ عرض کم هم fallback
    const mq = typeof window !== "undefined"
      ? window.matchMedia("(pointer: coarse)")
      : null;
    const isCoarse = !!mq?.matches;
    const isNarrow = typeof window !== "undefined" ? window.innerWidth < 768 : false;
    return (isCoarse || isNarrow) ? 220 : 350;
  };

  const [threshold, setThreshold] = useState<number>(computeThreshold);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const onChange = () => setThreshold(computeThreshold());
    // تغییرات دیوایس/سایز را گوش بده
    window.addEventListener("resize", onChange);
    // addEventListener برای مرورگرهای جدید، addListener برای قدیمی
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);

    return () => {
      window.removeEventListener("resize", onChange);
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);
  // ------------------------------------------

  const RETURN_MS = 200;
  const UNLOCK_MS = 700;

  const scrollTo = useCallback((id: SectionId) => {
    const el = document.getElementById(id);
    if (!el) return;

    transitioningRef.current = true;
    setActive(id);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);

    setTimeout(() => (transitioningRef.current = false), UNLOCK_MS);
  }, []);

  useEffect(() => {
    const syncByHash = () => {
      const raw = window.location.hash.replace("#", "");
      const id = (raw.split("?")[0] || initial) as SectionId;
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

  const getNeighbor = useCallback(
    (dir: -1 | 1): SectionId | null => {
      const idx = SECTIONS.indexOf(active);
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= SECTIONS.length) return null;
      return SECTIONS[nextIdx];
    },
    [active]
  );

  useEffect(() => {
    const rubber = (y: number, limit = 1000, a = 0.6) => {
      const s = Math.sign(y), x = Math.abs(y);
      return s * ((limit * a * x) / (limit * a + x));
    };

    const unsub = subscribeKick((_sectionId, value) => {
      const mapped = -rubber(value); // مثبت = به پایین

      if (Math.abs(mapped - lastValue.current) < 10) return;
      lastValue.current = mapped;
      setOffsetY(mapped);

      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setOffsetY(0), RETURN_MS);

      if (transitioningRef.current) return;

      if (mapped > threshold) {
        const next = getNeighbor(+1);
        if (next) {
          setOffsetY(0);
          scrollTo(next);
        }
      } else if (mapped < -threshold) {
        const prev = getNeighbor(-1);
        if (prev) {
          setOffsetY(0);
          scrollTo(prev);
        }
      }
    });

    return () => unsub();
  }, [getNeighbor, scrollTo, threshold]);

  useEffect(() => {
    setOffsetY(0);
  }, [active]);

  return { active, scrollTo, offsetY };
}
