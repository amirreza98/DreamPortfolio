import BouncyLettersBG from "../../../components/BouncyLettersBG"


function Introduction() {
  return (
    <>
      <h1 className="text-8xl font-bold mb-10 ">
        Welcome to My <br/> Portfolio</h1>
      <div className="w-full h-44 relative overflow-visible">
        <BouncyLettersBG text={`Hi, I'm AmirReza,\na passionate developer specializing\nin building exceptional digital experiences.`}/>
      </div>
      <p className="text-xs mt-2 text-gray-400">
        Explore my projects below!
      </p>
    </>
  )
}

export default Introduction