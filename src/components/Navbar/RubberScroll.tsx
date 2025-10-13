// components/RubberScroll.tsx
import { useEffect, useRef } from "react";

export default function RubberScroll({
  children,
  max = 200, // بیشینه‌ی جابجایی بصری (px)
}: {
  children: React.ReactNode;
  max?: number;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  // حالت‌های دینامیک
  const yRef = useRef(0);              // موقعیت خام (ممکنه > max هم بشه)
  const vRef = useRef(0);              // سرعت
  const lastTRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const touchYRef = useRef<number | null>(null);

  // پارامترهای فنر (critical damping ≈ برگشت طبیعی بدون نوسان)
  const M = 1;
  const K = 90;                        // سفتی
  const ZETA = 1.0;                    // نسبت دمپینگ (۱ → بحرانی)
  const C = 2 * Math.sqrt(K * M) * ZETA;

  // شرط توقف (جلوگیری از «گیر کردن» نزدیک صفر)
  const STOP_EPS_Y = 0.8;              // px
  const STOP_EPS_V = 6;                // px/s

  // Rubber-band mapping فقط برای رندر (نه فیزیک داخلی)
  function rubber(y: number, limit = max) {
    const a = 0.55;                    // ضریب مقاومت
    const s = Math.sign(y);
    const x = Math.abs(y);
    return s * ((limit * a * x) / (limit * a + x));
  }

  const setTransform = (y: number) => {
    const el = innerRef.current!;
    el.style.transform = `translateY(${rubber(y, max)}px)`;
  };

  const stopTick = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastTRef.current = null;
  };

  const tick = (t: number) => {
    let y = yRef.current;
    let v = vRef.current;

    // کپ صحیح برای پایداری (نه 10!)
    let dt = 0;
    if (lastTRef.current != null) dt = Math.min((t - lastTRef.current) / 1000, 0.05);
    lastTRef.current = t;

    // a = (-K*y - C*v) / M
    const a = (-K * y - C * v) / M;
    v += a * dt;
    y += v * dt;

    if (Math.abs(y) < STOP_EPS_Y && Math.abs(v) < STOP_EPS_V) {
      y = 0;
      v = 0;
      setTransform(0);
      yRef.current = 0;
      vRef.current = 0;
      stopTick();
      return;
    }

    yRef.current = y;
    vRef.current = v;
    setTransform(y);

    rafRef.current = requestAnimationFrame(tick);
  };

  const ensureTick = () => {
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick);
  };

  // یک «هُل» وارد کن (single-bounce)
  const kick = (delta: number) => {
    // نزدیک لبه‌ها ورودی را تضعیف کن تا حس کشسانی طبیعی شود
    const crowd = Math.min(1, Math.abs(yRef.current) / max);
    const dampInput = 1 / (1 + 1.5 * crowd); // 1 → ~0.4
    // اجازه می‌دهیم y خام تا 3x max برود؛ در رندر با rubber فشرده می‌شود
    const RAW_LIMIT = max * 3;
    const next = Math.max(-RAW_LIMIT, Math.min(RAW_LIMIT, yRef.current + delta * dampInput));

    yRef.current = next;
    vRef.current = 0; // فقط یک برگشت
    ensureTick();
  };

  useEffect(() => {
    const wrap = wrapRef.current!;
    const inner = innerRef.current!;
    wrap.style.overscrollBehavior = "contain";

    const onWheel = (e: WheelEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const dir = e.deltaY > 0 ? -1 : 1;   // پایین → محتوا بالا (منفی)
      kick(dir * 70);
    };

    const onTouchStart = (e: TouchEvent) => {
      e.stopPropagation();
      touchYRef.current = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e: TouchEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const y0 = touchYRef.current;
      const y = e.touches[0]?.clientY ?? y0;
      if (y0 == null || y == null) return;
      const dy = y - y0;
      if (Math.abs(dy) < 2) return;       // حذف نویز
      const dir = dy < 0 ? -1 : 1;        // کشیدن به بالا → محتوا بالا
      kick(dir * 70);
      touchYRef.current = y;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!wrap.contains(document.activeElement)) return;
      const keys = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Space"]);
      if (!keys.has(e.code)) return;
      e.stopPropagation();
      e.preventDefault();
      let dir = 1;
      if (e.code === "ArrowUp" || e.code === "PageUp") dir = -1;
      if (e.code === "Space" && e.shiftKey) dir = -1;
      kick(dir * 90);
    };

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
      yRef.current = 0;
      vRef.current = 0;
      lastTRef.current = null;
      rafRef.current = null;
    };
  }, [max]);

  return (
    <div ref={wrapRef} tabIndex={0} className="h-full w-full outline-none">
      <div ref={innerRef} className="h-full w-full will-change-transform">
        {children}
      </div>
    </div>
  );
}
