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
        <div className="h-screen w-screen z-0 overflow-y-scroll snap-y scroll-smooth snap-mandatory scrollbar-thin scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A]/80">
          {/* <Navbar  /> */}
            <section id="stack" className="h-screen w-screen scroll-mt-20">
              <StackExperience />
            </section>
          <div id="page">
            <section id="home" className="scroll-mt-20 snap-start">
              <Home />
            </section>
            <section id="game" className="scroll-mt-20">
              <Game />
            </section>
            <section id="projects" className="-scroll-mt-20">
              <Projects />
            </section>
            {/* <section id="stack" className="scroll-mt-20">
              <StackExperience />
            </section> */}
            <section id="contact" className="scroll-mt-20">
              <Contact />
            </section>
          </div>

        </div>
    </BrowserRouter>
  );
}

export default App;
