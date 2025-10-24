import { useEffect, useRef } from "react";

export default function BouncyLettersBG({ text }: { text: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const parent = canvas.parentElement as HTMLElement | null;
    if (!parent) return;

    let w = 0, h = 0, raf = 0, last = 0;
    let running = true;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    const FPS = prefersReduced ? 20 : 45;
    const frameInterval = 1000 / FPS;

    type L = { ch:string; x:number; y:number; vx:number; vy:number; tx:number; ty:number; w:number };
    let letters: L[] = [];

    let FONT_PX = 24, LINE_GAP = 36, PAD = 40, RADIUS = 70, R2 = RADIUS * RADIUS, IMPULSE = 40;

    const setResponsiveParams = () => {
      FONT_PX = Math.max(12, Math.min(36, Math.floor(w * 0.06)));
      LINE_GAP = Math.round(FONT_PX * 1.3);
      PAD = Math.round(FONT_PX * 1.6);
      RADIUS = Math.max(40, Math.min(100, Math.round(Math.min(w, h) * 0.18)));
      R2 = RADIUS * RADIUS;
      IMPULSE = Math.round(30 + FONT_PX * 0.6);
    };

    const wrapLines = (raw: string, maxWidth: number) => {
      ctx.font = `${FONT_PX}px Inter, system-ui, Segoe UI, Roboto, Arial`;
      const words = raw.split(/\s+/);
      const lines: string[] = [];
      let line = "";
      for (const word of words) {
        const test = line ? line + " " + word : word;
        if (ctx.measureText(test).width > maxWidth) {
          if (line) lines.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      return lines;
    };

  const layout = () => {
    ctx.font = `${FONT_PX}px Inter, system-ui, Segoe UI, Roboto, Arial`;
    letters = [];
    const maxTextWidth = Math.max(10, w - PAD * 2);
    const rawLines = text.split("\n");
    const lines = rawLines.flatMap(l => wrapLines(l, maxTextWidth));

    // اینجا کل ارتفاع متن را محاسبه کن
    const totalTextHeight = lines.length * LINE_GAP;
    // نقطه شروع را طوری بگیر که متن وسط بیفتد
    let y = (h - totalTextHeight) / 2 + LINE_GAP * 0.8; // 0.8 برای تنظیم ظاهری

    for (const line of lines) {
      let x = Math.round(PAD * (w < 640 ? 1.1 : 1.6));
      for (const ch of line) {
        const wch = ctx.measureText(ch).width;
        letters.push({ ch, x, y, vx: 0, vy: 0, tx: x, ty: y, w: wch });
        x += wch;
      }
      y += LINE_GAP;
      if (y > h - PAD) break;
    }
  };


    // فقط یک بار تعریف: سایز را از والد بگیر
    const resize = () => {
      const r = parent.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);

      const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width  = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      setResponsiveParams();
      layout();
    };

    const mouse = { x: -9999, y: -9999, px: -9999, py: -9999, sp2: 0, down:false };
    const updatePointer = (clientX:number, clientY:number) => {
      const r = canvas.getBoundingClientRect();
      const x = clientX - r.left, y = clientY - r.top;
      const dx = x - mouse.px, dy = y - mouse.py;
      mouse.sp2 = dx*dx + dy*dy;
      mouse.px = mouse.x = x; mouse.py = mouse.y = y;
    };
    const onPointerMove = (e: PointerEvent) => { updatePointer(e.clientX, e.clientY); };
    const onPointerDown = (e: PointerEvent) => { mouse.down = true; updatePointer(e.clientX, e.clientY); };
    const onPointerUp = () => { mouse.down = false; mouse.x = mouse.y = -9999; };

    let idleT = 0;

    const tick = (ts:number) => {
      if (!running) return;
      if (ts - last < frameInterval) { raf = requestAnimationFrame(tick); return; }
      last = ts;

      ctx.clearRect(0, 0, w, h);
      ctx.font = `${FONT_PX}px Inter, system-ui, Segoe UI, Roboto, Arial`;
      ctx.fillStyle = "#fff";

      idleT += 0.02;
      const idleAmp = (mouse.down || mouse.sp2 > 2) ? 0 : Math.min(2, FONT_PX * 0.06);

      for (const p of letters) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx*dx + dy*dy;
        if (d2 < R2) {
          const t = 1 - d2 / R2;
          const inv = 1 / Math.max(Math.sqrt(d2), 1);
          const nx = dx * inv, ny = dy * inv;
          const hit = IMPULSE + mouse.sp2 * 0.002;
          p.vx += nx * t * hit; p.vy += ny * t * hit;
        }
        p.vx = (p.vx + (p.tx - p.x) * 0.05) * 0.65;
        p.vy = (p.vy + (p.ty - p.y) * 0.05) * 0.65;

        if (idleAmp) p.vy += Math.sin(idleT + p.tx * 0.01) * 0.02 * idleAmp;

        p.x += p.vx; p.y += p.vy;
        ctx.fillText(p.ch, p.x, p.y);
      }
      raf = requestAnimationFrame(tick);
    };

    const onVis = () => { running = !document.hidden; if (running) raf = requestAnimationFrame(tick); };

    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    canvas.addEventListener("pointermove", onPointerMove, { passive:true });
    canvas.addEventListener("pointerdown", onPointerDown, { passive:true });
    window.addEventListener("pointerup", onPointerUp, { passive:true });
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", resize);

    resize();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", resize); // <-- اضافه شد
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [text]);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full block overflow-visible"
    />
  );
}
