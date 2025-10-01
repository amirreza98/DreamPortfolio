import MinimalGame from "./components/MinimalGame/MinimalGame";
import AnimatedBiograthy from "./components/AnimatedBiograthy/AnimatedBiograthy";

function Game() {
  return (
    <section className="w-screen snap-start flex flex-row items-center h-screen bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white">
      <div>
        <MinimalGame /> 
      </div>
      <div>
        <AnimatedBiograthy />
      </div>  
    </section>
  );
}
export default Game;
