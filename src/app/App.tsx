import { BrowserRouter } from "react-router-dom";
import "./App.css";
import Navbar from "../components/Navbar/Navbar";
import Home from "../sections/Home/Home";
import Game from "../sections/Game/Game";
import Projects from "../sections/Projects/Projects";
import StackExperience from "../sections/StackExperiences/StackExperiences";
import Contact from "../sections/Contact/Contact";
import BackgroundFX from "../components/BackgroundFX";
import HomeFakeScroll from "../components/Navbar/FakeScroll";


function App() {

  return (
      <BrowserRouter>
        <BackgroundFX />
        <div className="flex flex-row h-screen w-screen overflow-x-clip overflow-y-scroll snap-y scroll-smooth snap-mandatory">

          {/* Navbar */}
          <div className="sticky top-0 shrink-0 w-16 -mr-16 overflow-x-visible z-50">
             <Navbar />
          </div>

          {/* Main content */}
          <div id="page" className="h-screen w-screen">
              <section id="home" className="h-screen w-screen snap-start">
                <HomeFakeScroll max={200}>
                  <Home />
                </HomeFakeScroll>
              </section>
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
          <div id="game" className="h-screen w-screen snap-start">
            <Game />
          </div>
        </div>
    </BrowserRouter>
  );
}

export default App;
