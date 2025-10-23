import { BrowserRouter } from "react-router-dom";
import "./App.css";
import Navbar from "../components/Navbar/Navbar";
import Home from "../sections/Home/Home";
import Game from "../sections/Game/Game";
import Projects from "../sections/Projects/Projects";
import StackExperience from "../sections/StackExperiences/StackExperiences";
import Contact from "../sections/Contact/Contact";
import BackgroundFX from "../components/BackgroundFX";
import RubberScroll from "../components/Navbar/RubberScroll";

function App() {
  return (
    <BrowserRouter>
      <BackgroundFX />
      <div id="page" className="flex flex-row overflow-x-clip overflow-y-scroll snap-y scroll-smooth snap-mandatory">
        {/* Navbar culmn 1*/}
        <div className="sticky top-0 shrink-0 min-w-max overflow-x-visible z-10">
          <Navbar />
        </div>

        {/* Main content culmn 2*/}
        <div className="h-screen w-screen">
          <section id="home" className="h-screen w-screen snap-start">
            <RubberScroll max={400} sectionId="home">
              <Home />
            </RubberScroll>
          </section>

          <section id="projects" className="h-screen w-screen snap-start">
            <RubberScroll max={400} sectionId="projects">
              <Projects />
            </RubberScroll>
          </section>

          <section id="stack" className="h-screen w-screen snap-start">
            <RubberScroll max={400} sectionId="stack">
              <StackExperience />
            </RubberScroll>
          </section>

          <section id="contact" className="h-screen w-screen  snap-start">
            <RubberScroll max={400} sectionId="contact">
              <Contact />
            </RubberScroll>
          </section>
        </div>

        {/* Main content culmn 3*/}
        <div id="game" className="h-screen w-screen snap-start">
          <RubberScroll max={400} sectionId="game">
            <Game />
          </RubberScroll>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
