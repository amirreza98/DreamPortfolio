// NavbarUI.tsx — Minimal (theme-only classes + initial/animate/exit)
import { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants, Transition } from "framer-motion";
import { House, Gamepad2, FolderGit2, BookUser, Mail } from "lucide-react";

type SectionId = "home" | "projects" | "stack" | "contact" | "game";

export type NavbarUIProps = {
  active: SectionId;
  onSelect: (id: SectionId) => void;
  offsetY?: number; // optional
};

// icons
const ICONS: Record<SectionId, React.ElementType> = {
  home: House, projects: FolderGit2, stack: BookUser, contact: Mail, game: Gamepad2,
};

// theme-only classes
const THEME: Record<SectionId, {
  layout: "row" | "column";
  containerClass: string;
  itemActiveClass: string;
  itemInactiveClass: string;
  ringClass: string;
}> = {
  home: {
    layout: "column",
    containerClass: "top-1/2 -translate-y-1/2 backdrop-blur-xl bg-white/10 border border-white/15 rounded-3xl p-4 shadow-2xl",
    itemActiveClass: "bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg",
    itemInactiveClass: "text-white/70 hover:text-white",
    ringClass: "shadow-[0_0_18px_3px_rgba(0,200,255,0.45)]",
  },
  projects: {
    layout: "column",
    containerClass: "top-1/2 -translate-y-1/2 w-10 bg-gray-700 border border-fuchsia-300/20 rounded-3xl p-4 shadow-2xl",
    itemActiveClass: "bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-lg",
    itemInactiveClass: "text-fuchsia-200/70 hover:text-fuchsia-100",
    ringClass: "shadow-[0_0_16px_3px_rgba(255,0,120,0.35)]",
  },
  stack: {
    layout: "row",
    containerClass: "-translate-x-1/2 bg-black/35 border border-white/10 rounded-2xl px-3 py-2 shadow-lg",
    itemActiveClass: "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40 rounded-xl",
    itemInactiveClass: "text-white/70 hover:text-white hover:bg-white/10 rounded-xl",
    ringClass: "shadow-[0_0_14px_2px_rgba(16,185,129,0.35)]",
  },
  contact: {
    layout: "row",
    containerClass: "-translate-x-1/2 bg-rose-500/10 border border-rose-300/20 rounded-3xl p-4 shadow-xl",
    itemActiveClass: "bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white shadow-lg",
    itemInactiveClass: "text-rose-100/70 hover:text-rose-50",
    ringClass: "shadow-[0_0_16px_2px_rgba(255,70,120,0.35)]",
  },
  game: {
    layout: "column",
    containerClass: "bg-amber-400/10 border border-amber-300/20 rounded-3xl p-4 shadow-2xl",
    itemActiveClass: "bg-gradient-to-br from-amber-400 to-orange-600 text-black shadow-lg",
    itemInactiveClass: "text-amber-200/80 hover:text-amber-100",
    ringClass: "shadow-[0_0_16px_2px_rgba(255,180,0,0.35)]",
  },
};

// 1) CONTAINER 
// 1) ثابت ترنزیشن با تایپ درست
const spring: Transition = { type: "spring", stiffness: 280, damping: 22 };
// 2) CONTAINER با تایپ Variants (بدون as const)
const CONTAINER: Variants = {
  initial: { opacity: 0, x: 0, y: -12, scale: 0.98 },
  animate: (c: { offset: number; axis: "x" | "y" }) => {
    const halfScreen = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
    return {
      opacity: 1,
      x: c.axis === "x" ? halfScreen + c.offset / 1.5 : 0,
      y: c.axis === "y" ? c.offset / 1.5 : 0,
      scale: 1,
      transition: spring, // ✅ الان Transition درست تایپ شده
    };
  },
  exit: { opacity: 0, y: 150, scale: 0.98, transition: { duration: 0.2 } },
};

// item micro-animations
const ITEM = {
  initial: (i: number) => ({ opacity: 0, y: 8,  transition: { delay: i * 0.03 } }),
  animate: (i: number) => ({ opacity: 1, y: 0,  transition: { delay: i * 0.03 } }),
  exit:    (i: number) => ({ opacity: 0, y: -8, transition: { duration: 0.15, delay: i * 0.03 } }),
} as const;

function NavbarUI({ active, onSelect, offsetY = 0 }: NavbarUIProps) { // ← offsetY اضافه شد + مقدار پیش‌فرض
  const theme = THEME[active];
  const entries = useMemo(() => Object.entries(ICONS) as [SectionId, React.ElementType][], []);
  const dirClass = theme.layout === "row" ? "flex-row gap-3 px-2 py-2" : "flex-col gap-6 p-4";
    // اگر row → محور X، اگر column → محور Y
  const axis: "x" | "y" = theme.layout === "row" ? "x" : "y";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={active}                 // با تغییر active، exit/enter اجرا میشه
        variants={CONTAINER}
        initial="initial"
        animate="animate"
        exit="exit"
        custom={{ offset: offsetY, axis }}         // ← حالا مقدار درست پاس میشه
        className={`flex absolute items-center justify-center ${dirClass} ${theme.containerClass}`}
      >
        {entries.map(([id, Icon], i) => {
          const isActive = active === id;
          return (
            <motion.button
              key={id}
              initial={ITEM.initial(i)}
              animate={ITEM.animate(i)}
              exit={ITEM.exit(i)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(id)}
              className={`relative p-3 transition-all duration-300 ${
                isActive ? theme.itemActiveClass : theme.itemInactiveClass
              }`}
            >
              <Icon size={24} />
              {/* optional: حلقه‌ی نوری تم، فقط وقتی اکتیو است */}
              {isActive && <span className={`absolute inset-0 rounded-xl pointer-events-none ${theme.ringClass}`} />}
            </motion.button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}

export default memo(NavbarUI);
