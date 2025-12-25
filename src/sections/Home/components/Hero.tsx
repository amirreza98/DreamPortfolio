import { useEffect, useRef } from "react";
import heroImage from "../../../assets/IMG.png";

/** Binary spotlight with transparent background */
export default function Hero() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

    // --- تنظیمات ظاهری باینری ---
    const CELL = 6;                                // ریزتر = جزئیات بیشتر
    const FONT = "12px ui-monospace, 'Fira Code', monospace";
    const SHADOW_BLUR = 6;                         // گلو
    const DENSITY_BIAS = 0.15;                     // کمک به پرنوری نواحی روشن
    // --- تنظیمات دایره‌ی اسپات‌لایت ---
    const RADIUS = 130;                            // شعاع دایره
    const EDGE_SOFTNESS = 0.75;                    // نرمی لبه (۰..۱)
    let mouse = { x: -9999, y: -9999 };

    // بوم خارج‌ازصفحه برای باینری
    const binCanvas = document.createElement("canvas");
    const binCtx = binCanvas.getContext("2d")!;

    // تصویر مرجع
    const img = new Image();
    img.src = heroImage;
    img.crossOrigin = "anonymous";

    function fit() {
      const r = wrap.getBoundingClientRect();
      canvas.width = r.width;
      canvas.height = r.height;
      binCanvas.width = r.width;
      binCanvas.height = r.height;
      drawBinary();                // یک‌بار بکش
      paintFrame();                // یک‌فریم اسپات‌لایت
    }
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);

    function drawBinary() {
      // شفاف نگه می‌داریم
      binCtx.clearRect(0, 0, binCanvas.width, binCanvas.height);

      // عکس را برای نمونه‌گیری روشنایی فیت می‌کنیم
      binCtx.drawImage(img, 0, 0, binCanvas.width, binCanvas.height);
      const { data } = binCtx.getImageData(0, 0, binCanvas.width, binCanvas.height);

      // اعداد سفید با گلو آبی
      binCtx.font = FONT;
      binCtx.textAlign = "center";
      binCtx.textBaseline = "middle";

      for (let y = CELL / 2; y < binCanvas.height; y += CELL) {
        for (let x = CELL / 2; x < binCanvas.width; x += CELL) {
          const ix = (Math.floor(y) * binCanvas.width + Math.floor(x)) * 4;
          const r = data[ix], g = data[ix + 1], b = data[ix + 2];
          const bright = (r + g + b) / 765; // 0..1

          // کمی بایاس تا نقاط روشن پرتر دیده شن
          const a = Math.min(1, Math.pow(bright + DENSITY_BIAS, 1.3));

          // هاله
          binCtx.shadowBlur = SHADOW_BLUR;
          binCtx.shadowColor = "rgba(170,220,255,0.95)";
          binCtx.fillStyle = `rgba(190,230,255,${a})`;
          binCtx.fillText(bright > 0.5 ? "1" : "0", x, y);

          // شارپ سفید روی هاله
          binCtx.shadowBlur = 0;
          binCtx.fillStyle = `rgba(255,255,255,${a * 0.9})`;
          binCtx.fillText(bright > 0.5 ? "1" : "0", x, y);
        }
      }
    }

    // یک فریم: باینری + سوراخ دایره‌ای
    function paintFrame() {
      // 1) باینری شفاف روی بوم اصلی
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(binCanvas, 0, 0);

      // 2) سوراخ دایره‌ای نرم (reveals real image below)
      if (mouse.x !== -9999) {
        const inner = RADIUS * EDGE_SOFTNESS;
        const g = ctx.createRadialGradient(mouse.x, mouse.y, inner, mouse.x, mouse.y, RADIUS);
        // مرکز کاملاً پاک شود، لبه‌ها نرم شوند
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(1, "rgba(0,0,0,0)");

        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, RADIUS, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalCompositeOperation = "source-over";
      }
    }

    function onMove(e: MouseEvent) {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      paintFrame();
    }
    function onLeave() {
      mouse.x = mouse.y = -9999;
      paintFrame(); // سوراخ را پاک کن
    }

    img.onload = fit;
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    return () => {
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full h-full overflow-hidden rounded-lg">
      {/* لایه‌ی زیر: عکس واقعی (کمی زوم برای حس بهتر داخل دایره) */}
      <img
        src={heroImage}
        alt="Hero Real"
        className="absolute inset-0 w-full h-full object-cover scale-[1.12]"
      />
      {/* لایه‌ی بالا: باینری شفاف + اسپات‌لایت دایره‌ای */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full [image-rendering:pixelated] cursor-none"
      />
    </div>
  );
}
