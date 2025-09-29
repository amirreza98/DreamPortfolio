import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 h-screen w-26 bg-gray-800 text-white flex flex-col items-center py-6 gap-6">
      <Link to="/">Home</Link>
      <Link to="/game">Game</Link>
      <Link to="/projects">Projects</Link>
      <Link to="/stacks">Stacks</Link>
      <Link to="/contact">Contact</Link>
    </nav>
  );
};

export default Navbar;
