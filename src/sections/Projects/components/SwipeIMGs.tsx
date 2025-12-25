import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  images: string[];
  intervalMs?: number;
  effect?: "slide" | "cube" | "coverflow" | "wipe" | "kenburns" | "push";
};

export default function SimpleAutoScroller({
  images,
  intervalMs = 2000,
  effect = "wipe",
}: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => slideNext(), intervalMs);
    return () => clearInterval(t);
  }, [paused, intervalMs]);

  const slideNext = () => {
    setDirection(1);
    setIndex((p) => (p + 1) % images.length);
  };
  const slidePrev = () => {
    setDirection(-1);
    setIndex((p) => (p - 1 + images.length) % images.length);
  };

  // افکت‌ها
  const variants = useMemo(() => {
    if (shouldReduce) {
      // بدون انیمیشن برای کاهش حرکت
      return {
        initial: { opacity: 1, x: 0, rotateY: 0, scale: 1, clipPath: "inset(0% 0% 0% 0%)" },
        animate: { opacity: 1, x: 0, rotateY: 0, scale: 1, clipPath: "inset(0% 0% 0% 0%)" },
        exit: { opacity: 1, x: 0, rotateY: 0, scale: 1, clipPath: "inset(0% 0% 0% 0%)" },
        transition: { duration: 0 },
      };
    }

    switch (effect) {
      case "cube":
        return {
          initial: (dir: number) => ({ rotateY: -90 * dir, x: dir * 100, opacity: 1, transformOrigin: `${dir === 1 ? "100%" : "0%"} 50%` }),
          animate: { rotateY: 0, x: 0, opacity: 1 },
          exit: (dir: number) => ({ rotateY: 90 * dir, x: -dir * 100, opacity: 1, transformOrigin: `${dir === 1 ? "0%" : "100%"} 50%` }),
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        };
      case "coverflow":
        return {
          initial: (dir: number) => ({ x: dir * 120, rotateY: -15 * dir, scale: 0.9, opacity: 1 }),
          animate: { x: 0, rotateY: 0, scale: 1, opacity: 1 },
          exit: (dir: number) => ({ x: -dir * 120, rotateY: 15 * dir, scale: 0.9, opacity: 1 }),
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        };
      case "wipe":
        return {
          initial: (dir: number) => ({ clipPath: dir === 1 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" }),
          animate: { clipPath: "inset(0% 0% 0% 0%)" },
          exit: (dir: number) => ({ clipPath: dir === 1 ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)" }),
          transition: { duration: 0.5, ease: [0.65, 0, 0.35, 1] },
        };
      case "kenburns":
        return {
          initial: (dir: number) => ({ scale: 1.05, x: dir * 20, opacity: 1 }),
          animate: { scale: 1.15, x: 0, opacity: 1 },
          exit: (dir: number) => ({ scale: 1.05, x: -dir * 20, opacity: 1 }),
          transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
        };
      case "push":
        return {
          initial: (dir: number) => ({ x: dir * 100, opacity: 1 }),
          animate: { x: 0, opacity: 1 },
          exit: (dir: number) => ({ x: -dir * 100, opacity: 1 }),
          transition: { duration: 0.45, type: "tween", ease: [0.22, 1, 0.36, 1] },
        };
      default: // slide کلاسیک بدون فید
        return {
          initial: (dir: number) => ({ x: dir * 80, opacity: 1 }),
          animate: { x: 0, opacity: 1 },
          exit: (dir: number) => ({ x: -dir * 80, opacity: 1 }),
          transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        };
    }
  }, [effect, shouldReduce]);

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence custom={direction} mode="wait">
        <motion.img
          key={images[index]}
          src={images[index]}
          alt={`slide-${index}`}
          className="absolute p-2 w-full pt-4 object-cover select-none"
          custom={direction}
          initial={variants.initial as any}
          animate={variants.animate as any}
          exit={variants.exit as any}
          transition={variants.transition as any}
          draggable={false}
        />
      </AnimatePresence>

      {/* کشیدن با ماوس/تاچ برای سوییپ (اختیاری) */}
      <motion.div
        className="absolute inset-0"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x < -50) slideNext();
          else if (info.offset.x > 50) slidePrev();
        }}
      />

      <button
        onClick={slidePrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full"
        aria-label="Previous"
      >
        <ChevronLeft size={15} />
      </button>
      <button
        onClick={slideNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full"
        aria-label="Next"
      >
        <ChevronRight size={15} />
      </button>

      {/* نوار پیشروی اتوپلی (گزینه‌ای) */}
      <motion.div
        key={index}
        className="absolute bottom-0 left-0 right-0 h-1 bg-white/40"
        initial={{ scaleX: 0, transformOrigin: "0% 50%" }}
        animate={{ scaleX: 1 }}
        transition={{ duration: paused ? 0 : intervalMs / 1000 }}
      />
    </div>
  );
}
