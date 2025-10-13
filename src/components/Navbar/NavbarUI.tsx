// NavbarUI.tsx
import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { House, Gamepad2, FolderGit2, BookUser, Mail } from "lucide-react";
import { subscribeKick } from "../../utils/rubberBus";

type NavbarUIProps = {
  active: "home" | "projects" | "stack" | "contact" | "game";
  scrollTo: (id: string) => void;
};

const SECTION_ORDER = ["home", "projects", "stack", "contact", "game"] as const;

const SECTION_STYLES: Record<string, { activeBtn: string; inactiveBtn: string; ring: string }> = {
  home:     { activeBtn: "bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg scale-110",      inactiveBtn: "text-gray-400 hover:text-white hover:scale-105", ring: "shadow-[0_0_15px_3px_rgba(0,200,255,0.4)]" },
  projects: { activeBtn: "bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-lg scale-110",   inactiveBtn: "text-gray-400 hover:text-white hover:scale-105", ring: "shadow-[0_0_15px_3px_rgba(255,0,120,0.35)]" },
  stack:    { activeBtn: "bg-gradient-to-br from-emerald-400 to-lime-500 text-white shadow-lg scale-110",   inactiveBtn: "text-gray-400 hover:text-white hover:scale-105", ring: "shadow-[0_0_15px_3px_rgba(0,255,120,0.35)]" },
  contact:  { activeBtn: "bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white shadow-lg scale-110",   inactiveBtn: "text-gray-400 hover:text-white hover:scale-105", ring: "shadow-[0_0_15px_3px_rgba(255,70,120,0.35)]" },
  game:     { activeBtn: "bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg scale-110",   inactiveBtn: "text-gray-400 hover:text-white hover:scale-105", ring: "shadow-[0_0_15px_3px_rgba(255,180,0,0.35)]" },
};

export default function NavbarUI({ active, scrollTo }: NavbarUIProps) {
  const icons = useMemo(() => ({
    home: House, game: Gamepad2, projects: FolderGit2, stack: BookUser, contact: Mail,
  }), []);

  // 1) آفست عمودی نوبار (برعکس حرکتِ Rubber روی home)
  const [offsetY, setOffsetY] = useState(0);
  const last = useRef(0);

  // 2) حالت "خورد زمین/شکست"
  const [crashed, setCrashed] = useState(false);
  const crashArmed = useRef(true); // برای جلوگیری از تریگرهای پشت‌سر‌هم
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // برگرداندن خودکار به صفر بعد از کمی بی‌حرکتی
  const scheduleReturn = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setOffsetY(0), 140); // 140ms بعد از آخرین سیگنال
  };

  useEffect(() => {
    const unsub = subscribeKick((sectionId, amount) => {
      // فقط وقتی هوم فعال است، نوبار خلاف جهت حرکت کند
      if (active === "home" && sectionId === "home" && !crashed) {
        const k = 0.25;                                  // شدت
        const next = Math.max(-40, Math.min(40, -amount * k));
        if (Math.abs(next - last.current) >= 1) {
          last.current = next;
          setOffsetY(next);
        }
        scheduleReturn(); // برگرد به صفر بعد از مکث کوتاه
      }

      // اگر مقدار پرتاب (RAW یا DISPLAY که publish کردی) از حد گذشت → کرش
      const CRASH_THRESH = 1000; // همینی که گفتی
      if (!crashed && crashArmed.current && Math.abs(amount) >= CRASH_THRESH) {
        crashArmed.current = false;
        setCrashed(true);
      }
    });
    return unsub;
  }, [active, crashed]);

  // وقتی سکشن عوض می‌شود: آفست صفر و کرش ریست
  useEffect(() => {
    setOffsetY(0);
    setCrashed(false);
    crashArmed.current = true;
  }, [active]);

  // محاسبه‌ی سکشن بعدی
  const nextId = useMemo(() => {
    const idx = SECTION_ORDER.indexOf(active as any);
    const next = SECTION_ORDER[(idx + 1) % SECTION_ORDER.length];
    return next;
  }, [active]);

  const styleSet = SECTION_STYLES[active] ?? SECTION_STYLES.home;

  return (
    <motion.div
      initial={false}
      animate={crashed ? "crash" : "idle"}
      variants={{
        idle:  { y: offsetY, rotate: 0, opacity: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 400, damping: 28 } },
        crash: { y: 520, rotate: 25, opacity: 0, filter: "blur(2px)",   transition: { duration: 0.6, ease: "backIn", when: "beforeChildren", staggerChildren: 0.04 } },
      }}
      onAnimationComplete={(state) => {
        if (state === "crash") {
          // بعد از خوردن زمین → برو سکشن بعدی و ریست
          scrollTo(nextId);
          setTimeout(() => {
            setCrashed(false);
            crashArmed.current = true;
            setOffsetY(0);
          }, 50);
        }
      }}
      className="flex flex-col items-center justify-center gap-6 p-4 
                 backdrop-blur-xl border border-white/10 
                 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-200 will-change-transform"
    >
      {Object.entries(icons).map(([id, Icon], i) => (
        <motion.button
          key={id}
          onClick={() => scrollTo(id)}
          className={`relative p-3 rounded-2xl transition-all duration-300 group
            ${active === id ? styleSet.activeBtn : styleSet.inactiveBtn}`}
          variants={{
            idle:  { y: 0, rotate: 0, scale: 1, filter: "blur(0px)" },
            crash: { 
              y: 320 + i * 12,               // هر کدوم یکم متفاوت
              rotate: i % 2 ? 70 : -55,      // چرخش متناوب
              scale: 0.92, 
              filter: "blur(2px)",
            },
          }}
        >
          <Icon size={24} />
          <span className={`absolute inset-0 rounded-2xl transition
            ${active === id ? styleSet.ring : "opacity-0 group-hover:opacity-60"}`} />
        </motion.button>
      ))}
    </motion.div>
  );
}
