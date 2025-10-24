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

  // جلوی تریگرهای پیاپی هنگام انیمیشن اسکرول رو می‌گیرد
  const transitioningRef = useRef(false);

  const THRESHOLD = 350;     // آستانه‌ی پرش به سکشن بعد/قبل
  const RETURN_MS = 200;     // تاخیر برای صفرکردن offsetY
  const UNLOCK_MS = 700;     // زمان تقریبی اسکرول نرم تا آزادسازی

  const scrollTo = useCallback((id: SectionId) => {
    const el = document.getElementById(id);
    if (!el) return;

    transitioningRef.current = true;
    setActive(id);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);

    // بعد از تمام‌شدن انیمیشن اسکرول، دوباره اجازه‌ی تریگر بده
    setTimeout(() => (transitioningRef.current = false), UNLOCK_MS);
  }, []);

  // همگام‌سازی اولیه/تغییر هَش
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

  // کمک‌تابع: همسایه‌ی قبلی/بعدی را برگردان
  const getNeighbor = useCallback(
    (dir: -1 | 1): SectionId | null => {
      const idx = SECTIONS.indexOf(active);
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= SECTIONS.length) return null;
      return SECTIONS[nextIdx];
    },
    [active]
  );

  // گوش‌دادن به RubberScroll و پرش خودکار به قبلی/بعدی
  useEffect(() => {
    const rubber = (y: number, limit = 1000, a = 0.6) => {
      const s = Math.sign(y), x = Math.abs(y);
      return s * ((limit * a * x) / (limit * a + x));
    };

    
    const unsub = subscribeKick((_sectionId, value) => {
      const mapped = -rubber(value); // همون نگاشت تو؛ مثبت=به پایین
      
      // نرم‌سازی ساده
      if (Math.abs(mapped - lastValue.current) < 10) return;
      lastValue.current = mapped;
      setOffsetY(mapped);

      // ریست offsetY با تاخیر کوتاه
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setOffsetY(0), RETURN_MS);

      if (transitioningRef.current) return; // وسط اسکرول دوباره تریگر نکن
      console.log("Mapped Y:", mapped);
      // اگر از آستانه بگذره، قبلی/بعدی رو محاسبه و اسکرول کن
      if (mapped > THRESHOLD) {
        const next = getNeighbor(+1);
        if (next) {
          setOffsetY(0);
          scrollTo(next);
        }
      } else if (mapped < -THRESHOLD) {
        const prev = getNeighbor(-1);
        if (prev) {
          setOffsetY(0);
          scrollTo(prev);
        }
      }
    });

    return () => unsub();
  }, [getNeighbor, scrollTo]);

  // هر وقت سکشن عوض شد، offsetY صفر
  useEffect(() => {
    setOffsetY(0);
  }, [active]);

  return { active, scrollTo, offsetY };
}
