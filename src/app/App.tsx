import { useEffect, useState } from "react";
import "./App.css";
import Navbar from "../components/Navbar";
import Home from "../sections/Home/Home";
import Game from "../sections/Game/Game";
import Projects from "../sections/Projects/Projects";
import StackExperience from "../sections/StackExperiences/StackExperiences";
import Contact from "../sections/Contact/Contact";

function App() {
  const [section, setSection] = useState<string>("home");

  useEffect(() => {
    console.log("Current section:", section);
  }, [section]);
  
  return (
    <div className="App">
      <Navbar section={section} setSection={setSection} />
      {section === "home" && <Home />}
      {section === "game" && <Game />}
      {section === "projects" && <Projects />}
      {section === "stackExperiences" && <StackExperience />}
      {section === "contact" && <Contact />}
    </div>
  );
}

export default App;
