import CoolText from "../../components/CoolText";
import Hero from "./components/Hero";
import Introduction from "./components/Introduction";
import { useState } from "react";

function Home() {
  const text = "Click to fun Game while know me a little bit";
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <div className="w-screen flex flex-row items-center h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white">
      <div className="ml-32">
        <Introduction />
      </div>

      <div
        className="relative m-10 z-10 h-11/12 w-1/3 rounded-lg border-2 border-gray-500 p-4 overflow-hidden"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
        }}
        onClick={() => { window.location.href = "#game"; }}
      >
        <Hero />
        {hover && (
          <div
            className="absolute pointer-events-none text-xs rounded-full px-4 py-1 backdrop-blur-sm border border-gray-500"
            style={{ left: pos.x, top: pos.y, transform: "translate(1%, 1%)" }}
          >
            <CoolText text={text} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
