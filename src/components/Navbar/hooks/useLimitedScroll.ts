// hooks/useLimitedScroll.ts
import { useEffect, useRef } from "react";

/**
 * Kill native scroll (wheel/touch/keys) on the given scroll container
 * and show a tiny visual nudge (translateY) on #page.
 */
export default function useLimitedScroll(nudgePx = 50, containerId = "scrollRoot") {
  const busyRef = useRef(false);
  const touchYRef = useRef<number | null>(null);

  useEffect(() => {
    const container = document.getElementById(containerId);
    const page = document.getElementById("page");
    if (!container || !page) return;

    // 1) prevent native scrolling on the scroll container
    // (نه روی body؛ چون اسکرول روی container اتفاق می‌افته)
    container.style.overscrollBehavior = "contain";

    // 2) prepare transform on #page for the visual nudge
    const style = page.style;
    const prevTransform = style.transform;
    const prevWillChange = style.willChange;
    const prevTransition = style.transition;
    style.willChange = "transform";

    const nudge = (dir: 1 | -1) => {
      if (busyRef.current) return;
      busyRef.current = true;

      // frame 1: small translate
      style.transition = "transform 0ms";
      style.transform = `translateY(${dir * nudgePx}px)`;

      // frame 2: snap back immediately
      requestAnimationFrame(() => {
        style.transform = "translateY(0)";
        requestAnimationFrame(() => { busyRef.current = false; });
      });
    };

    // Handlers
    const onWheel = (e: WheelEvent) => {
      // فقط وقتی رو همین container هستیم رو بگیر
      if (!container.contains(e.target as Node)) return;
      e.preventDefault(); // kill real scroll
      nudge(e.deltaY > 0 ? 1 : -1);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!container.contains(e.target as Node)) return;
      touchYRef.current = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!container.contains(e.target as Node)) return;
      e.preventDefault(); // kill real scroll/fling
      const y0 = touchYRef.current;
      const y = e.touches[0]?.clientY ?? y0;
      if (y0 == null || y == null) return;
      const dy = y - y0;
      if (Math.abs(dy) < 2) return;
      nudge(dy < 0 ? 1 : -1);
      touchYRef.current = y; // successive nudges
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // اگر فوکوس داخل container نیست، دخالت نکن
      if (!container.contains(document.activeElement)) return;
      const keys = new Set(["ArrowDown","ArrowUp","PageDown","PageUp","Space","Home","End"]);
      if (!keys.has(e.code)) return;
      e.preventDefault();
      let dir: 1 | -1 = 1;
      if (e.code === "ArrowUp" || e.code === "PageUp" || e.code === "Home") dir = -1;
      if (e.code === "Space" && e.shiftKey) dir = -1;
      nudge(dir);
    };

    // Listeners — روی window ثبت کن اما با contains فیلتر کن
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      style.transform = prevTransform;
      style.willChange = prevWillChange;
      style.transition = prevTransition;
      container.style.overscrollBehavior = "";
    };
  }, [nudgePx, containerId]);
}
