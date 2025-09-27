import MinimalGame from "./components/MinimalGame/MinimalGame";
import AnimatedBiograthy from "./components/AnimatedBiograthy/AnimatedBiograthy";

function Game() {
  return (
    <section>
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
