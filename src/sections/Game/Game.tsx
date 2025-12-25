import MinimalGame from "./components/MinimalGame/MinimalGame";
import AnimatedBiograthy from "./components/AnimatedBiograthy/AnimatedBiography";
import CoolText from "../../components/CoolText";
import { useState } from "react";

function Game() {
  const text = "Click Back Home";
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });


  return (
    <section className="w-screen flex flex-row max-sm:flex-col overflow-clip items-center max-sm:items-start h-screen text-white">
    
      {/* return back butten */}
      <div
        className=" absolute top-0 bg-white/5 left-0 z-50 -mr-40 max-sm:mr-0  max-sm:w-30  h-screen w-48 p-4 overflow-visible"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
        }}
        onClick={() => { window.location.href = "#home"; }}
        onTouchEnd={() => { window.location.href = "#home"; }}
      >
        {hover && (
          <div
            className="absolute pointer-events-none text-xs rounded-full px-4 py-1 backdrop-blur-sm border border-gray-500"
            style={{ left: pos.x, top: pos.y, transform: "translate(1%, 1%)" }}
          >
            <CoolText text={text} />
          </div>
        )}
      </div>

      {/* game */}
      <div className="relative w-2/3 h-2/3 max-sm:top-1/2 max-sm:w-11/12 bg-white/30 flex justify-center items-center border-2 border-gray-500 m-5 rounded-lg">
        <MinimalGame /> 
      </div>
      <div className="relative w-1/3 h-2/3 max-sm:-top-1/2 max-sm:w-11/12 bg-white/30 flex flex-col border-2 border-gray-500 m-5 rounded-lg p-4 overflow-hidden">
        <AnimatedBiograthy />
      </div>  
    </section>
  );
}
export default Game;
