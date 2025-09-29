import { useState, useEffect, useCallback } from "react";
import "./App.css";
import Navbar from "../components/Navbar";
import Home from "../sections/Home/Home";
import Game from "../sections/Game/Game";
import Projects from "../sections/Projects/Projects";
import StackExperience from "../sections/StackExperiences/StackExperiences";
import Contact from "../sections/Contact/Contact";
import EdgeNavigator from "../components/EdgeNavigator";
import { useScrollLock } from "../hooks/useScrollLock";

const SECTIONS = ["home", "game", "stack", "projects", "contact"] as const;
type Section = typeof SECTIONS[number];

function App() {
  const [section, setSection] = useState<Section>("home");
  useScrollLock(true); // disables scrolling

  const idx = SECTIONS.indexOf(section);

  const go = useCallback(
    (dir: "next" | "prev") => {
      const j =
        dir === "next"
          ? Math.min(idx + 1, SECTIONS.length - 1)
          : Math.max(idx - 1, 0);
      setSection(SECTIONS[j]);
    },
    [idx]
  );

  // optional keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") go("next");
      if (e.key === "ArrowLeft" || e.key === "PageUp") go("prev");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <div className="h-screen w-screen bg-neutral-950 text-white">
      <Navbar active={section} onSelect={setSection} />
      <main className="relative h-full w-full pt-14 flex items-center justify-center">
        {section === "home" && <Home />}
        {section === "game" && <Game />}
        {section === "stack" && <StackExperience />}
        {section === "projects" && <Projects />}
        {section === "contact" && <Contact />}

        <EdgeNavigator
          canPrev={idx > 0}
          canNext={idx < SECTIONS.length - 1}
          onPrev={() => go("prev")}
          onNext={() => go("next")}
        />
      </main>
    </div>
  );
}

export default App;
