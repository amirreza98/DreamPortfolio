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
        <div className="h-screen w-screen  srelative z-0 overflow-y-scroll snap-y snap-mandatory scroll-smooth">
          <Navbar  />
        <div id="page">
          <section id="home" className="-scroll-mt-60">
            <Home />
          </section>
          <section id="game" className="scroll-mt-20">
            <Game />
          </section>
          <section id="projects" className="scroll-mt-20">
            <Projects />
          </section>
          <section id="stack" className="scroll-mt-20">
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
