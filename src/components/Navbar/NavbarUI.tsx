import { House, Gamepad2, FolderGit2, BookUser, Mail } from "lucide-react";

type NavbarUIProps = {
  active: string;
  setActive: (id: string) => void;
};

export default function NavbarUI({ active, setActive }: NavbarUIProps) {
  const icons = {
    home: House,
    game: Gamepad2,
    projects: FolderGit2,
    stack: BookUser,
    contact: Mail,
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-4 
                    backdrop-blur-xl border border-white/10 
                    rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
      {Object.entries(icons).map(([id, Icon]) => (
        <button
          key={id}
          onClick={() => setActive(id)}
          className={`relative p-3 rounded-2xl transition-all duration-300 group
            ${active === id 
              ? "bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg scale-110" 
              : "text-gray-400 hover:text-white hover:scale-105"}`}
        >
          <Icon size={24} />
          {/* subtle glow ring */}
          <span className={`absolute inset-0 rounded-2xl transition 
            ${active === id ? "shadow-[0_0_15px_3px_rgba(0,200,255,0.4)]" : "opacity-0 group-hover:opacity-60"}`}>
          </span>
        </button>
      ))}
    </div>
  );

}
