import { useRef } from "react";
import Items from "./Items";

export default function ProjectsNav() {
  const innerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="w-52 h-5/6 flex items-center justify-center hover:scale-110 hover:translate-x-4 transition-transform duration-300"
      onMouseLeave={() => {
        const el = innerRef.current;
        if (!el) return;
        el.style.transformOrigin = "center";
        el.style.transform = "scaleY(1)";
      }}
    >
      <div
        ref={innerRef}
        className="flex w-20 h-full bg-gray-700 mr-12 justify-center rounded-3xl shadow-2xl will-change-transform shadow-black"
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
          const scale = 1 - clamp * 0.1;

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
