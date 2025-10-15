// components/RubberScroll.tsx
import { useEffect, useLayoutEffect, useRef } from "react";
import { publishKick } from "../../utils/rubberBus";

let RS_COUNTER = 0;

export default function RubberScroll({
  children,
  max = 200,
  sectionId, // اختیاری: اگر دادی، از همین استفاده می‌شود
}: {
  children: React.ReactNode;
  max?: number;
  sectionId?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const sectionIdRef = useRef<string>("");

  // --- physics refs (بدون تغییر)
  const yRef = useRef(0);
  const vRef = useRef(0);
  const lastTRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const touchYRef = useRef<number | null>(null);
  const maxYRef = useRef(0);

  const M = 1, K = 90, ZETA = 1.0, C = 2 * Math.sqrt(K * M) * ZETA;
  const STOP_EPS_Y = 0.8, STOP_EPS_V = 6;

  function rubber(y: number, limit = max) {
    const a = 0.55, s = Math.sign(y), x = Math.abs(y);
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
    let y = yRef.current, v = vRef.current;
    let dt = 0;
    if (lastTRef.current != null) dt = Math.min((t - lastTRef.current) / 1000, 0.05);
    lastTRef.current = t;

    const a = (-K * y - C * v) / M;
    v += a * dt;
    y += v * dt;

    if (Math.abs(y) > maxYRef.current) maxYRef.current = Math.abs(y);

    if (Math.abs(y) < STOP_EPS_Y && Math.abs(v) < STOP_EPS_V) {
      maxYRef.current = 0;
      y = 0; v = 0;
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

  const kick = (delta: number) => {
    const crowd = Math.min(1, Math.abs(yRef.current) / max);
    const dampInput = 1 / (1 + 1.4 * crowd);
    const RAW_LIMIT = max * 4;
    const next = Math.max(-RAW_LIMIT, Math.min(RAW_LIMIT, yRef.current + delta * dampInput));

    // → scoped publish
    publishKick(sectionIdRef.current, next); 
    yRef.current = next;
    vRef.current = 0;
    ensureTick();
  };

  // 🔎 کشف خودکار sectionId از نزدیک‌ترین والدِ دارای id
  useLayoutEffect(() => {
    if (sectionId) {
      sectionIdRef.current = sectionId;
      return;
    }
    const host = wrapRef.current?.closest<HTMLElement>("[id]");
    sectionIdRef.current = host?.id || `rubber-${++RS_COUNTER}`;
  }, [sectionId]);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const inner = innerRef.current!;
    wrap.style.overscrollBehavior = "contain";

    const onWheel = (e: WheelEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const dir = e.deltaY > 0 ? -1 : 1;
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
      if (Math.abs(dy) < 2) return;
      const dir = dy < 0 ? -1 : 1;
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
