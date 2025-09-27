import React from "react";

type NavbarProps = {
  section: string;
  setSection: (section: string) => void;
};

const Navbar: React.FC<NavbarProps> = ({ section, setSection }) => {
  const navItems = ["home", "game", "projects", "stackExprence", "contact"];

  return (
    <nav className="navbar">
      <ul>
        {navItems.map((item) => (
          <li
            key={item}
            onClick={() => setSection(item)}
            className={section === item ? "active" : ""}
            style={{
              cursor: "pointer",
              fontWeight: section === item ? "bold" : "normal",
            }}
          >
            {item.toUpperCase()}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
