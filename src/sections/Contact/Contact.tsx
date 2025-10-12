import { useEffect, useState} from "react";
import MailCard from "./components/Mail/MailCard";

function Contact() {
  const [playAnim, setPlayAnim] = useState(false);
  const [animParam, setAnimParam] = useState<string | null>(null);

  // یک پارسر ساده برای گرفتن anim از hash
  const parseAnimFromHash = () => {
    const h = window.location.hash; // مثل "#contact?anim=drain"
    const q = h.includes("?") ? h.split("?")[1] : "";
    const params = new URLSearchParams(q);
    return params.get("anim"); // "drain" یا null
  };

  // روی mount و هر بار تغییر hash، animParam را آپدیت کن
  useEffect(() => {
    const sync = () => {
      const val = parseAnimFromHash();
      setAnimParam(val);
    };
    // مقدار اولیه
    sync();
    // وقتی hash عوض شد
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // هر وقت animParam شد "drain"، انیمیشن را پخش کن و URL را تمیز کن
  useEffect(() => {
    if (animParam === "drain") {
      setPlayAnim(true);
      console.log("[effect] animParam =", playAnim);
      setTimeout(() => {
        window.history.replaceState(null, "", "#contact");
      }, 300);
    }
  }, [animParam]);

  return (
    <section
      className="w-screen h-screen snap-start flex items-center justify-center text-white px-6"
    >
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* ستون چپ: فرم */}
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

            {/* فرم ساده — هرچی Mail قبلی داشتی می‌تونی جایگزین کنی */}
            <form
              className="space-y-4 bg-white/5 backdrop-blur rounded-2xl p-5 border border-white/10"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input
                  className="w-full rounded-xl px-3 py-2 bg-white/10 border border-white/20 outline-none focus:border-amber-400"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  className="w-full rounded-xl px-3 py-2 bg-white/10 border border-white/20 outline-none focus:border-amber-400"
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Message</label>
                <textarea
                  rows={4}
                  className="w-full rounded-xl px-3 py-2 bg-white/10 border border-white/20 outline-none focus:border-amber-400"
                  placeholder="How can I help?"
                />
              </div>
              <button
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-colors"
                type="submit"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* ستون راست: پاکت */}
        <div className="flex items-center justify-center">
          <MailCard
            play={playAnim} // اگر از درین آمده باشیم، سناریو اجرا می‌شود
          />
        </div>
      </div>
    </section>
  );
}

export default Contact;
