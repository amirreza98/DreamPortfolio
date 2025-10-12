import { useEffect, useRef } from "react";

export default function BouncyLettersBG({ text }: { text: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  // ثابت‌ها طبق خواسته‌ی تو
  const FONT = "35px Inter, system-ui, Segoe UI, Roboto, Arial";
  const LINE_GAP = 56;        // فاصله‌ی خطوط
  const PAD = 80;              // حاشیه‌ی چپ/بالا
  const FRICTION = 0.6;
  const RADIUS = 80, R2 = RADIUS * RADIUS;
  const IMPULSE = 50;
  const FPS = 45;

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let w = 0, h = 0, raf = 0, last = 0;
    const frameInterval = 1000 / FPS;

    type L = { ch:string; x:number; y:number; vx:number; vy:number; tx:number; ty:number; w:number };
    let letters: L[] = [];

    const resize = () => {
      // فقط اندازه‌ی خود canvas (نه والد)
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      const dpr = 1; // ساده و سبک
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
    };

    const layout = () => {
      ctx.font = FONT;
      letters = [];
      const lines = text.split("\n");
      let y = PAD + LINE_GAP

      for (const line of lines) {
        let x = PAD * 1.8 ; // چپ‌چین
        for (const ch of line) {
          const wch = ctx.measureText(ch).width;
          letters.push({ ch, x, y, vx:0, vy:0, tx:x, ty:y, w:wch });
          x += wch;
        }
        y += LINE_GAP;
      }
    };

    const mouse = { x: -9999, y: -9999, px: -9999, py: -9999, sp2: 0 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const dx = x - mouse.px, dy = y - mouse.py;
      mouse.sp2 = dx*dx + dy*dy;
      mouse.px = mouse.x = x; mouse.py = mouse.y = y;
    };
    const onLeave = () => { mouse.x = mouse.y = -9999; };

    const tick = (ts:number) => {
      if (ts - last < frameInterval) { raf = requestAnimationFrame(tick); return; }
      last = ts;

      ctx.clearRect(0, 0, w, h);
      ctx.font = FONT; ctx.fillStyle = "#fff";

      for (const p of letters) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx*dx + dy*dy;
        if (d2 < R2) {
          const t = 1 - d2 / R2;
          const inv = 1 / Math.max(Math.sqrt(d2), 1);
          const nx = dx * inv, ny = dy * inv;
          const hit = IMPULSE + mouse.sp2 * 0.002;
          p.vx += nx * t * hit; p.vy += ny * t * hit;
        }
        p.vx = (p.vx + (p.tx - p.x) * 0.05) * FRICTION;
        p.vy = (p.vy + (p.ty - p.y) * 0.05) * FRICTION;
        p.x += p.vx; p.y += p.vy;

        ctx.fillText(p.ch, p.x, p.y);
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    canvas.addEventListener("pointermove", onMove, { passive:true });
    canvas.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [text]);

  return (
    <canvas
      ref={ref}
      className="absolute -top-1/2 -left-1/5 w-[140%] h-[200%] block"
    />
  );

}
