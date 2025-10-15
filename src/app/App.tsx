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
      <div id="page" className="flex flex-row h-screen w-screen overflow-x-clip overflow-y-scroll snap-y scroll-smooth snap-mandatory">
        {/* Navbar */}
        <div className="sticky top-0 shrink-0 w-16 -mr-16 overflow-x-visible z-50">
          <Navbar />
        </div>

        {/* Main content */}
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

          <section id="contact" className="h-screen w-screen snap-start">
            <RubberScroll max={400} sectionId="contact">
              <Contact />
            </RubberScroll>
          </section>
        </div>

        <div id="game" className="h-screen w-screen snap-start">
            <Game />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
