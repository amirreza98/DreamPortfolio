import CoolText from "../../components/CoolText";
import Hero from "./components/Hero";
import Introduction from "./components/Introduction";
import { useState } from "react";

function Home() {
  const text = "Click to fun Game while know me a little bit";
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <div className="w-screen flex flex-row items-center h-screen text-white">
      <div className="ml-32 z-40 max-sm:ml-24 overflow-visible hover:cursor-none transition-all">
        <Introduction />
      </div>

      <div
        className="relative z-10 max-sm:-ml-20 m-10 h-11/12 max-sm:w-4/5 max-sm w-1/3 rounded-lg p-4"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
        }}
        onClick={() => { window.location.href = "#game"; }}
      >
        <div className="w-full h-full flex justify-center items-center -z-50">
          <Hero />
        </div>
        {hover && (
          <div
            className="absolute text-xs rounded-full px-4 py-1 backdrop-blur-sm border border-gray-500 "
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
