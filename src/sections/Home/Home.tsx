import Hero from "./components/Hero";
import Introduction from "./components/Introduction";

function Home() {
  return (
    <section>
      <h2>🏠 Home</h2>
      <div>
        <Introduction />
      </div>
      <div> 
      <Hero />
      </div>
    </section>
  );
}
export default Home;
