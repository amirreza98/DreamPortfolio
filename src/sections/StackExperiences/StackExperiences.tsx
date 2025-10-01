import PinballGame from "./components/PinballGame/PinballGame";

function StackExperiences() {
  return (
    <section className="w-screen h-screen snap-start flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white snap-start">
      <div>
        <PinballGame />
      </div>
    </section>
  );
}
export default StackExperiences;
