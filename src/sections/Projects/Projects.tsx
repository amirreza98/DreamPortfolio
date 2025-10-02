
import ProjectsNav from "./components/ProjectsNav.tsx";  

function Projects() {
  return (
    <section className="w-screen h-screen snap-start flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white">
      <div>
        <ProjectsNav />
      </div>
    </section>
  );
}
export default Projects;