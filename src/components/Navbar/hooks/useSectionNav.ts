// useSectionNav.ts
import { useEffect, useRef, useState, useCallback } from "react";
import { subscribeKick } from "../../../utils/rubberBus";

type SectionId = "home" | "projects" | "stack" | "contact" | "game";
type NavPhase  = "idle" | "crash" | "jolt";

const SECTIONS: SectionId[] = ["home", "game", "projects", "stack", "contact"];

export default function useSectionNav(initial: SectionId = "home") {
  const [active, setActive] = useState<SectionId>(initial);
  const [offsetY, setOffsetY] = useState(0);
  const [phase, setPhase] = useState<NavPhase>("idle");

  const lastValue = useRef(0);

  // تایمر برای ریست کردن offsetY به صفر
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 🔹 تابع برای اسکرول نرم به سکشن جدید
  const scrollTo = useCallback((id: SectionId) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
  }, []);

  //   // روی load/hashchange با هَش همگام بمان
  // useEffect(() => {
  //   const syncByHash = () => {
  //     const raw = window.location.hash.replace("#", "");
  //     const id = (raw.split("?")[0] || initial);
  //     if (SECTIONS.includes(id as SectionId)) {
  //       setActive(id);
  //       const el = document.getElementById(id);
  //       if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  //     }
  //   };
  //   syncByHash();
  //   window.addEventListener("hashchange", syncByHash);
  //   return () => window.removeEventListener("hashchange", syncByHash);
  // }, [initial]);

  // 🔹 گوش دادن به ایونت‌های RubberScroll
  useEffect(() => {
    const unsub = subscribeKick((_sectionId, value) => {
      // اینجا هر بار که یه scroll/kick اتفاق میفته اجرا میشه
      // value همون "next" از RubberScroll هست

      const rubber = (y: number, limit = 300, a = 0.6) => {
        const s = Math.sign(y), x = Math.abs(y);
        return s * ((limit * a * x) / (limit * a + x));
      };

      // اگر بخوای فقط در سکشن home نوبار حرکت کنه:
      if (active === "home") {
        // مقدار رو یه‌کم نرم‌تر کن (اختیاری)
        const mapped = -rubber(value, 1000, 0.6);

        if (Math.abs(mapped - lastValue.current) >= 10) {
          lastValue.current = mapped;
          setOffsetY(mapped);
          console.log(mapped);

          // بعد از RETURN_MS میلی‌ثانیه، مقدار رو صفر کن
          if (idleTimer.current) clearTimeout(idleTimer.current);
          idleTimer.current = setTimeout(() => {
            setOffsetY(0);
          }, 200);
        }

      }

      // اگر مقدار از یه حد بیشتر شد → کرش
      if (Math.abs(offsetY) >= 350) {
        setPhase("crash");
        setTimeout(() => {
          // وقتی انیمیشن تموم شد، برو سکشن بعدی
          scrollTo("projects");
          setPhase("idle");
          setOffsetY(0);
        }, 700); // باید با مدت انیمیشن تو NavbarUI هماهنگ باشه
      } else {
        setPhase("jolt");
      }
    });

    return () => unsub();
  }, [active, scrollTo]);

  // ریست وقتی سکشن عوض شد
  useEffect(() => {
    setOffsetY(0);
    setPhase("idle");
  }, [active]);

  return { active, scrollTo, offsetY, phase };
}
