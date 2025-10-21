import { useEffect, useState } from "react";
import emailjs from "emailjs-com";
import MailCard from "./components/Mail/MailCard";

function Contact() {
  const [playAnim, setPlayAnim] = useState(false);
  const [animParam, setAnimParam] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const parseAnimFromHash = () => {
    const h = window.location.hash;
    const q = h.includes("?") ? h.split("?")[1] : "";
    const params = new URLSearchParams(q);
    return params.get("anim");
  };

  useEffect(() => {
    const sync = () => setAnimParam(parseAnimFromHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    if (animParam === "drain") {
      setPlayAnim(true);
      setTimeout(() => {
        window.history.replaceState(null, "", "#contact");
      }, 300);
    }
  }, [animParam]);

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    emailjs
      .sendForm(
        "service_cgzh82l",  // از EmailJS
        "template_nwfxlyr", // از EmailJS
        e.currentTarget,
        "UWea63uAQQEn7dKjx"   // از EmailJS
      )
      .then(
        () => {
          setStatus("sent");
          e.currentTarget.reset();
        },
        (error) => {
          console.error("FAILED...", error.text);
          setStatus("error");
        }
      );
  };

  return (
    <section className="w-screen h-screen flex items-center justify-center text-white px-6">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center">
          <div
            className={`w-full max-w-md transition-opacity duration-700 ${
              playAnim ? "delay-3000 opacity-100" : "opacity-0"
            }`}
          >
            <h2 className="text-3xl font-bold mb-4">Contact</h2>
            <p className="text-gray-300 mb-6">
              Tell me about your project — I'll get back to you soon.
            </p>

            <form
              className="space-y-4 bg-white/5 backdrop-blur rounded-2xl p-5 border border-white/10"
              onSubmit={sendEmail}
            >
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input
                  name="user_name"
                  className="w-full rounded-xl px-3 py-2 bg-white/10 border border-white/20 outline-none focus:border-amber-400"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  name="user_email"
                  className="w-full rounded-xl px-3 py-2 bg-white/10 border border-white/20 outline-none focus:border-amber-400"
                  placeholder="you@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Message</label>
                <textarea
                  name="message"
                  rows={4}
                  className="w-full rounded-xl px-3 py-2 bg-white/10 border border-white/20 outline-none focus:border-amber-400"
                  placeholder="Your message..."
                  required
                />
              </div>
              <button
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-colors"
                type="submit"
                disabled={status === "sending"}
              >
                {status === "sending"
                  ? "Sending..."
                  : status === "sent"
                  ? "Sent ✅"
                  : "Send"}
              </button>
            </form>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <MailCard play={playAnim} />
        </div>
      </div>
    </section>
  );
}

export default Contact;
