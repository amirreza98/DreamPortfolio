import { BrowserRouter } from "react-router-dom";
import "./App.css";
import Navbar from "../components/Navbar";
import Home from "../sections/Home/Home";
import Game from "../sections/Game/Game";
import Projects from "../sections/Projects/Projects";
import StackExperience from "../sections/StackExperiences/StackExperiences";
import Contact from "../sections/Contact/Contact";


function App() {

  return (
      <BrowserRouter>
        <div className="h-screen w-screen z-0 overflow-y-scroll snap-y scroll-smooth snap-mandatory">
          <Navbar  />
          <div id="page">
            {/* horizontal section group */}
            <div className="flex flex-row snap-start w-auto h-screen snap-x overflow-x-scroll snap-mandatory scroll-smooth">
              <section id="home" className="h-screen w-screen flex-shrink-0 snap-start">
                <Home />
              </section>
              <section id="game" className="h-screen w-screen flex-shrink-0 snap-start">
                <Game />
              </section>
            </div>
            {/* vertical section group */}
            <section id="projects" className="-scroll-mt-20">
              <Projects />
            </section>
            <section id="stack" className="h-screen w-screen scroll-mt-20">
              <StackExperience />
            </section>
            <section id="contact" className="scroll-mt-20">
              <Contact />
            </section>
          </div>
        </div>
    </BrowserRouter>
  );
}

export default App;
