import { useRef } from "react";
import Items from "./Items";

export default function ProjectsNav() {
  const innerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="w-1/3 h-5/6 flex items-center relative left-2 max-sm:w-56 max-sm:left-0 hover:scale-110 max-sm:hover:scale-100 max-sm:hover:-translate-x-2 hover:translate-x-4 transition-transform"
      onMouseLeave={() => {
        const el = innerRef.current;
        if (!el) return;
        el.style.transformOrigin = "center";
        el.style.transform = "scaleY(1)";
        el.style.width="0rem";
        el.style.border = "6px solid rgb(93, 105, 118)";
        el.style.overflow="hidden";
        el.style.height="40%";
        el.style.transition="width 0.3s ease, overflow 0.3s ease, height 0.3s ease border 0.3s ease";
      }}
      onMouseEnter={() => {
        const el = innerRef.current;
        if (!el) return;
        el.style.borderColor="2px white";
        el.style.border = "1px solid rgb(197, 199, 196)";
        el.style.width="4rem";
        el.style.overflow="visible";
        el.style.height="100%";
        el.style.transition="width 0.3s ease, overflow 0.7s ease, height 0.3s ease border 0.3s ease";
        
      }}
    >
      <div
        ref={innerRef}
        className="flex w-2 relative left-14 overflow-hidden h-1/3 border-6 border-[rgb(93,105,118)] hover:bg-white/10 backdrop-blur-3xl shadow-lg shadow-white/70 mr-12 justify-center rounded-3xl will-change-transform"
        onMouseMove={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          const r = el.getBoundingClientRect();
          const y = e.clientY - r.top;

          const distTop = y;
          const distBottom = r.height - y;
          const isTop = distTop < distBottom;
          const nearestYEdge = Math.min(distTop, distBottom);

          // closer to edge => more squeeze (cap at 10%)
          const intensity = 1 - nearestYEdge / (r.height / 2);
          const clamp = Math.max(0, Math.min(intensity, 1));
          const scale = 1 - clamp * 0.13;

          // origin should be the nearest edge
          el.style.transformOrigin = isTop ? "center bottom" : "center top";
          el.style.transform = `scaleY(${scale})`;
        }}
      >
        <Items />
      </div>
    </div>
  );
}
