// components/HomeFakeScroll.tsx
import { useEffect, useRef } from "react";

export default function HomeFakeScroll({
  children,
  max = 100, // حداکثر جابجایی بصری (px)
}: {
  children: React.ReactNode;
  max?: number;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  // state کوچک برای انیمیشن نرم
  const yRef = useRef(0);
  const targetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const touchYRef = useRef<number | null>(null);

  // حلقه‌ی انیمیشن (بسیار سبک)
  const tick = () => {
    const el = innerRef.current!;
    const y = yRef.current;
    const target = targetRef.current;

    const next = y + (target - y) * 0.2; // نزدیک شدن نرم
    yRef.current = next;
    el.style.transform = `translateY(${next}px)`;
    // کم‌کم target به صفر برگرده
    targetRef.current = target * 0.9;

    if (Math.abs(next) > 0.2 || Math.abs(targetRef.current) > 0.01) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      yRef.current = 0;
      targetRef.current = 0;
      el.style.transform = "translateY(0px)";
      rafRef.current = null;
    }
  };
  const ensureTick = () => {
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const wrap = wrapRef.current!;
    const inner = innerRef.current!;
    // برای جلوگیری از پرش والد در لبه‌ها
    wrap.style.overscrollBehavior = "contain";

    // --- لیسنرهای بومی روی همین رپر (نه window) ---
    const onWheel = (e: WheelEvent) => {
      // خیلی مهم: نذار به والد برسه و رفتار پیش‌فرض رخ بده
      e.stopPropagation();
      e.preventDefault();
      const dir = e.deltaY > 0 ? -1 : 1;
      // به سمت بالا/پایین یکم هدف رو جابه‌جا کن (و کلَمپ)
      targetRef.current = Math.max(-max, Math.min(max, targetRef.current + dir * 10));
      ensureTick();
    };

    const onTouchStart = (e: TouchEvent) => {
      e.stopPropagation();
      touchYRef.current = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e: TouchEvent) => {
      // حیاتی: تاچ والد/کانتینر رو خنثی کن
      e.stopPropagation();
      e.preventDefault();
      const y0 = touchYRef.current;
      const y = e.touches[0]?.clientY ?? y0;
      if (y0 == null || y == null) return;
      const dy = y - y0;
      if (Math.abs(dy) < 2) return; // نویز
      const dir = dy < 0 ? 1 : -1;
      targetRef.current = Math.max(-max, Math.min(max, targetRef.current + dir * 10));
      touchYRef.current = y; // اجازه نیشگون‌های متوالی
      ensureTick();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // فقط وقتی فوکوس داخل همین رپر است
      if (!wrap.contains(document.activeElement)) return;
      const keys = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Space"]);
      if (!keys.has(e.code)) return;
      e.stopPropagation();
      e.preventDefault();
      let dir: 1 | -1 = 1;
      if (e.code === "ArrowUp" || e.code === "PageUp") dir = -1;
      if (e.code === "Space" && e.shiftKey) dir = -1;
      targetRef.current = Math.max(-max, Math.min(max, targetRef.current + dir * 10));
      ensureTick();
    };

    // ثبت با passive:false تا preventDefault مؤثر باشد
    wrap.addEventListener("wheel", onWheel, { passive: false });
    wrap.addEventListener("touchstart", onTouchStart, { passive: true });
    wrap.addEventListener("touchmove", onTouchMove, { passive: false });
    wrap.addEventListener("keydown", onKeyDown, { passive: false });

    return () => {
      wrap.removeEventListener("wheel", onWheel);
      wrap.removeEventListener("touchstart", onTouchStart);
      wrap.removeEventListener("touchmove", onTouchMove);
      wrap.removeEventListener("keydown", onKeyDown);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      inner.style.transform = "translateY(0px)";
    };
  }, [max]);

  return (
    <div
      ref={wrapRef}
      tabIndex={0} // برای دریافت رویدادهای کیبورد داخل این رپر
      className="h-full w-full outline-none"
    >
      <div ref={innerRef} className="h-full w-full will-change-transform">
        {children}
      </div>
    </div>
  );
}
