import Mail from "./components/Mail/Mail";
function Contact() {
  return (
    <section className="w-screen h-screen snap-start flex flex-col items-center justify-center bg-gradient-to-b from-black to-gray-800 text-white">
      <div>
        <Mail />
      </div>
    </section>
  );
}
export default Contact;
