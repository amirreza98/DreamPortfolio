import heroImage from "../../../assets/IMG_8415.png";

function Hero() {
  return (
    <div className="w-full h-full">
      <img 
        src={heroImage} 
        alt="Hero Image" 
        className="flex w-full h-full hover:scale-150 hover:-translate-y-20 duration-500 object-cover rounded-lg "
      />
    </div>
  );
}

export default Hero;