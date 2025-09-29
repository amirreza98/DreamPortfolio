import Hero from "./components/Hero";
import Introduction from "./components/Introduction";

function Home() {
  return (
    <div className="flex flex-row items-center h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white">
      <div className="ml-32 ">
        <Introduction />
      </div>
      <div className="m-10 z-10 h-11/12 w-1/3 hover:scale-110 duration-500  rounded-lg border-2 border-gray-500 p-4"> 
      <Hero />
      </div>
    </div>
  );
}
export default Home;
