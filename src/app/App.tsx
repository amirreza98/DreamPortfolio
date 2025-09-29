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
        <Navbar />
        <main className="ml-26 p-6">
          <Home/>
          <Game/>
          <StackExperience/>
          <Projects/>
          <Contact/>
        </main>
    </BrowserRouter>
  );
}

export default App;
