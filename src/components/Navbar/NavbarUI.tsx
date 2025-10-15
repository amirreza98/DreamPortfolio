// NavbarUI.tsx
import { memo, useMemo, useEffect } from "react";
import { motion, useSpring } from "framer-motion";
import { House, Gamepad2, FolderGit2, BookUser, Mail } from "lucide-react";

type SectionId = "home" | "projects" | "stack" | "contact" | "game";
type NavPhase = "idle" | "jolt" | "crash";

type NavbarUIProps = {
  active: SectionId;
  onSelect: (id: SectionId) => void;
  phase: NavPhase;        // از هوک
  offsetY: number;        // از هوک (px)
};

const SECTION_STYLES: Record<SectionId, {
  activeBtn: string; inactiveBtn: string; ring: string;
}> = {
  home:     { activeBtn: "bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg scale-110",    inactiveBtn: "text-gray-400 hover:text-white hover:scale-105", ring: "shadow-[0_0_15px_3px_rgba(0,200,255,0.4)]" },
  projects: { activeBtn: "bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-lg scale-110", inactiveBtn: "text-gray-400 hover:text-white hover:scale-105", ring: "shadow-[0_0_15px_3px_rgba(255,0,120,0.35)]" },
  stack:    { activeBtn: "bg-gradient-to-br from-emerald-400 to-lime-500 text-white shadow-lg scale-110", inactiveBtn: "text-gray-400 hover:text-white hover:scale-105", ring: "shadow-[0_0_15px_3px_rgba(0,255,120,0.35)]" },
  contact:  { activeBtn: "bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white shadow-lg scale-110", inactiveBtn: "text-gray-400 hover:text-white hover:scale-105", ring: "shadow-[0_0_15px_3px_rgba(255,70,120,0.35)]" },
  game:     { activeBtn: "bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg scale-110", inactiveBtn: "text-gray-400 hover:text-white hover:scale-105", ring: "shadow-[0_0_15px_3px_rgba(255,180,0,0.35)]" },
};

const ICONS: Record<SectionId, any> = {
  home: House, projects: FolderGit2, stack: BookUser, contact: Mail, game: Gamepad2,
};

const CRASH_VARIANTS = {
  idle:  { rotate: 0, opacity: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 400, damping: 28 } },
  jolt:  { rotate: 0, opacity: 1, filter: "blur(0px)" }, // همون idle؛ offsetY از style میاد
  crash: { y: 520, rotate: 25, opacity: 0, filter: "blur(2px)", transition: { duration: 0.6, ease: "backIn", when: "beforeChildren", staggerChildren: 0.04 } },
};

const BTN_VARIANTS = {
  idle:  { y: 0, rotate: 0, scale: 1, filter: "blur(0px)" },
  jolt:  { y: 0, rotate: 0, scale: 1, filter: "blur(0px)" },
  crash: (i: number) => ({
    y: 320 + i * 12,
    rotate: i % 2 ? 70 : -55,
    scale: 0.92,
    filter: "blur(2px)",
  }),
};

function NavbarUI({ active, onSelect, phase, offsetY }: NavbarUIProps) {
  const styleSet = SECTION_STYLES[active];

  const entries = useMemo(() => Object.entries(ICONS) as [SectionId, any][], []);

  
    const y = useSpring(0, {
      stiffness: 500,   // سفتی فنر (کمتر = نرم‌تر)
      damping: 36,      // دمپینگ (بیشتر = نوسان کمتر)
      mass: 0.6,        // جرم (بیشتر = حرکت سنگین‌تر)
    });

    useEffect(() => {
      if (phase !== "crash") y.set(offsetY); // موقع crash بذار variants کار کنن
    }, [offsetY, phase, y]);


  return (
    <motion.div
      animate={phase}
      variants={CRASH_VARIANTS}
      style={{ y }} // حرکت نرم از بیرون کنترل میشه
      className="flex flex-col items-center justify-center gap-6 p-4 
                 backdrop-blur-xl border border-white/10 
                 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-200 will-change-transform"
    >
      {entries.map(([id, Icon], i) => (
        <motion.button
          key={id}
          custom={i}
          animate={phase}
          variants={BTN_VARIANTS}
          onClick={() => onSelect(id)}
          className={`relative p-3 rounded-2xl transition-all duration-300 group
            ${active === id ? styleSet.activeBtn : styleSet.inactiveBtn}`}
        >
          <Icon size={24} />
          <span className={`absolute inset-0 rounded-2xl transition
            ${active === id ? styleSet.ring : "opacity-0 group-hover:opacity-60"}`} />
        </motion.button>
      ))}
    </motion.div>
  );
}

export default memo(NavbarUI);
