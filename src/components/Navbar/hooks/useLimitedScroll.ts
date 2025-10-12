// hooks/useStayHere.ts
import { useEffect, useRef } from "react";

export default function useLimitedScroll(limit = 20) {
  const elRef = useRef<HTMLElement | null>(null);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const anchorRef = useRef(0);
  const interactingRef = useRef(false);
  const endTimer = useRef<number | null>(null);
  const prevSnapInline = useRef<string>("");

  useEffect(() => {
    const el = document.getElementById("page");
    if (!el) return;
    elRef.current = el;
    sectionsRef.current = Array.from(el.querySelectorAll("section")) as HTMLElement[];

    // برای جلوگیری از اسکرول والد/صفحه
    el.style.overscrollBehavior = "contain";

    const nearestAnchor = () => {
      const t = el.scrollTop;
      let best = 0, dist = Infinity;
      for (const s of sectionsRef.current) {
        const d = Math.abs(s.offsetTop - t);
        if (d < dist) { dist = d; best = s.offsetTop; }
      }
      return best;
    };

    const disableSnap = () => {
      prevSnapInline.current = el.style.scrollSnapType; // ذخیرهٔ inline قبلی
      el.style.scrollSnapType = "none";                 // خاموش کردن قطعی
    };
    const enableSnap = () => {
      el.style.scrollSnapType = prevSnapInline.current || ""; // برگرداندن
    };

    const beginInteraction = () => {
      if (interactingRef.current) return;
      interactingRef.current = true;
      anchorRef.current = nearestAnchor();
      disableSnap();
    };

    const clamp = () => {
      const a = anchorRef.current;
      if (el.scrollTop > a + limit) el.scrollTop = a + limit;
      if (el.scrollTop < a - limit) el.scrollTop = a - limit;
    };

    const scheduleEnd = () => {
      if (endTimer.current) window.clearTimeout(endTimer.current);
      endTimer.current = window.setTimeout(() => {
        // پایان تعامل: برگرد روی انکر و Snap را روشن کن
        el.scrollTo({ top: anchorRef.current }); // فوری
        // فریم بعدی Snap را برگردان تا گیر نیفته
        requestAnimationFrame(() => {
          enableSnap();
          interactingRef.current = false;
        });
      }, 90); // وقتی کاربر ورودی نداد ⇒ scroll end
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();   // فلینگ خاموش
      beginInteraction();
      // حرکت کاربر انجام میشه، ما فقط محدود می‌کنیم
      clamp();
      scheduleEnd();
    };

    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
      beginInteraction();
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();   // فلینگ خاموش
      // اجازه بده اسکرول طبیعی رخ بده اما بلافاصله clamp کن
      clamp();
      scheduleEnd();
    };

    const onScroll = () => {
      if (!interactingRef.current) return;
      clamp();
      scheduleEnd();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("scroll", onScroll);
      if (endTimer.current) window.clearTimeout(endTimer.current);
      el.style.scrollSnapType = "";
      el.style.overscrollBehavior = "";
    };
  }, [limit]);
}
