import { House, Gamepad2, FolderGit2, BookUser, Mail } from "lucide-react";

export default function NavbarUI({ active, setActive }) {
  const icons = {
    home: House,
    game: Gamepad2,
    projects: FolderGit2,
    stack: BookUser,
    contact: Mail,
  };

  return (
    <div className="flex flex-col gap-6 p-4 bg-gray-900 text-white">
      {Object.entries(icons).map(([id, Icon]) => (
        <button
          key={id}
          onClick={() => setActive(id)}
          className={`p-2 rounded-lg transition ${
            active === id ? "bg-white text-black" : "opacity-60 hover:opacity-100"
          }`}
        >
          <Icon size={24} />
        </button>
      ))}
    </div>
  );
}
