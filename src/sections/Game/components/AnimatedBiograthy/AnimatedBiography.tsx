import CoolText from "../../../../components/CoolText";


const AnimatedBiography = () => {
  const text = "Hello, my name is AmirReza Azemati. I am a te, passionate about";

  return (
    <div className="p-4 text-xl font-mono text-white">
      <CoolText text={text} speed={100} />
    </div>
  );
};

export default AnimatedBiography;

