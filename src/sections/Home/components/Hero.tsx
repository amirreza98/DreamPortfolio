import heroImage from "../../../assets/IMG.png";

function Hero() {
  return (
    <div className="w-full h-full">
      <img 
        src={heroImage} 
        alt="Hero Image" 
        className="flex w-full h-full scale-170 -translate-y-30 hover:scale-190 hover:-translate-y-40 duration-500 object-cover rounded-lg "
      />
    </div>
  );
}

export default Hero;