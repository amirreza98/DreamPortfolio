import BouncyLettersBG from "../../../components/BouncyLettersBG"


function Introduction() {
  return (
    <>
      <h1 className="text-8xl max-sm:text-6xl font-bold mb-10 ">
        Welcome to My <br/> Portfolio</h1>
      <div className="relative w-full h-60 sm:h-72 md:h-80 overflow-hidden -ml-20 max-sm:-ml-4 max-sm:-mt-18">
        <BouncyLettersBG text={`Hi, I'm AmirReza, a passionate developer specializing in building exceptional digital experiences.`}/>
      </div>
      <p className="text-xs mt-2 text-gray-400">
        Explore my projects below!
      </p>
    </>
  )
}

export default Introduction