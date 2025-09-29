import React from "react";

type Props = {
  active: string;                // current section
  onSelect: (section: string) => void; // function to change section
};

const Navbar: React.FC<Props> = ({ active, onSelect }) => {
  return (
    <nav className="fixed top-0 left-0 h-screen w-28 bg-gray-800 text-white flex flex-col items-center py-6 gap-6">
      <button
        onClick={() => onSelect("home")}
        className={active === "home" ? "font-bold text-blue-400" : ""}
      >
        Home
      </button>
      <button
        onClick={() => onSelect("game")}
        className={active === "game" ? "font-bold text-blue-400" : ""}
      >
        Game
      </button>
      <button
        onClick={() => onSelect("projects")}
        className={active === "projects" ? "font-bold text-blue-400" : ""}
      >
        Projects
      </button>
      <button
        onClick={() => onSelect("stack")}
        className={active === "stack" ? "font-bold text-blue-400" : ""}
      >
        Stacks
      </button>
      <button
        onClick={() => onSelect("contact")}
        className={active === "contact" ? "font-bold text-blue-400" : ""}
      >
        Contact
      </button>
    </nav>
  );
};

export default Navbar;
