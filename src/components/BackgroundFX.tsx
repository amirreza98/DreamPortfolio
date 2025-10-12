import { useEffect, useRef } from "react";

/** Fixed reactive background: spotlight + blobs + subtle grid */
export default function BackgroundFX() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0.5, y: 0.5 });       // 0..1 normalized
  const target = useRef({ x: 0.5, y: 0.5 });    // smooth to this
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const ww = window.innerWidth;
      const wh = window.innerHeight;
      target.current.x = Math.max(0, Math.min(1, e.clientX / ww));
      target.current.y = Math.max(0, Math.min(1, e.clientY / wh));
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const tick = () => {
      // lerp برای نرمی حرکت
      pos.current.x += (target.current.x - pos.current.x) * 0.12;
      pos.current.y += (target.current.y - pos.current.y) * 0.12;

      const el = rootRef.current;
      if (el) {
        const mx = `${pos.current.x * 100}%`;
        const my = `${pos.current.y * 100}%`;

        // slight parallax offsets
        const tx1 = `${(pos.current.x - 0.5) * 30}px`;
        const ty1 = `${(pos.current.y - 0.5) * 30}px`;
        const tx2 = `${(pos.current.x - 0.5) * 60}px`;
        const ty2 = `${(pos.current.y - 0.5) * 60}px`;

        el.style.setProperty("--mx", mx);
        el.style.setProperty("--my", my);
        el.style.setProperty("--tx1", tx1);
        el.style.setProperty("--ty1", ty1);
        el.style.setProperty("--tx2", tx2);
        el.style.setProperty("--ty2", ty2);
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="
        fixed inset-0 -z-10 pointer-events-none overflow-hidden
        [--mx:50%] [--my:50%] [--tx1:0px] [--ty1:0px] [--tx2:0px] [--ty2:0px]
        bg-neutral-950
      "
    >
      {/* لایه ۱: گرادیان آرام + پارالاکس کم */}
      <div
        className="
          absolute inset-[-10%] blur-3xl opacity-70
          will-change-transform
        "
        style={{
          transform: `translate3d(var(--tx1),var(--ty1),0)`,
          background:
            "radial-gradient(1200px 800px at 20% 30%, rgba(0,180,216,0.25) 0%, transparent 60%)," +
            "radial-gradient(900px 700px at 80% 70%, rgba(147,51,234,0.22) 0%, transparent 55%)," +
            "radial-gradient(1000px 900px at 50% 10%, rgba(34,197,94,0.18) 0%, transparent 60%)",
        }}
      />

      {/* لایه ۲: اسپات‌لایت دنبال‌کنندهٔ موس */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          background: `
            radial-gradient( circle at var(--mx) var(--my),
              rgba(255,255,255,0.18) 0%,
              rgba(255,255,255,0.10) 18%,
              rgba(255,255,255,0.05) 32%,
              rgba(255,255,255,0.00) 55%
            )
          `,
        }}
      />

      {/* لایه ۳: خطوط گرید ظریف + پارالاکس بیشتر */}
      <div
        className="absolute inset-0 opacity-30 will-change-transform"
        style={{
          transform: `translate3d(var(--tx2),var(--ty2),0)`,
          background: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(600px 600px at var(--mx) var(--my), black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(600px 600px at var(--mx) var(--my), black 0%, transparent 70%)",
        }}
      />

      {/* لایه ۴: گرِین خیلی ملایم برای عمق */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,\
            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"140\" height=\"140\" viewBox=\"0 0 140 140\">\
            <filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"2\"/></filter>\
            <rect width=\"100%\" height=\"100%\" filter=\"url(%23n)\" opacity=\"0.06\"/>\
            </svg>')",
          backgroundSize: "auto",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
