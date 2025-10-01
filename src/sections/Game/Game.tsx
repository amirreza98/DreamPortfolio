import MinimalGame from "./components/MinimalGame/MinimalGame";
import AnimatedBiograthy from "./components/AnimatedBiograthy/AnimatedBiography";

function Game() {
  return (
    <section className="w-screen snap-start flex flex-row items-center h-screen bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white">
      <div className="w-1/2 h-1/2 bg-white/30 flex justify-center items-center border-2 border-gray-500 m-10 rounded-lg p-4">
        <MinimalGame /> 
      </div>
      <div className="w-1/2 h-1/2 bg-white/30 flex justify-center items-center border-2 border-gray-500 m-10 rounded-lg p-4 overflow-hidden">
        <AnimatedBiograthy />
      </div>  
    </section>
  );
}
export default Game;
