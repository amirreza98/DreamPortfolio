import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

type MailCardProps = {
  play: boolean;
  onFinished?: () => void;
};

const CARD_W = 360;
const CARD_H = 240;

export default function MailCard({ play }: MailCardProps) {
  const [stage, setStage] = useState<"idle" | "ball-fall" | "close" | "fly" | "rotate">("idle");

  useEffect(() => {
    if (!play) return;
    setStage("ball-fall");
    const t1 = setTimeout(() => setStage("close"), 1100);
    const t2 = setTimeout(() => setStage("fly"), 1800);
    const t3 = setTimeout(() => setStage("rotate"), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [play]);

  // ✅ Use `satisfies Variants` so "spring" / "easeInOut" stay as literal types
  const flyVariant = {
    center: {
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 120, damping: 12 },
    },
    right: {
      x: 420,
      y: -80,
      rotate: 360,
      scale: 0.9,
      transition: { duration: 1.1, ease: "easeInOut" },
    },
  } satisfies Variants;

  const flapVariant = {
    open:  { rotateX: 0,   transition: { duration: 0.45 } },
    close: { rotateX: 180, transition: { duration: 0.45 } },
  } satisfies Variants;

  return (
    // ظرف با پرسپکتیو برای افکت 3D
    <motion.div
      className="relative"
      style={{ width: CARD_W, height: CARD_H, perspective: 1000 }}
      animate={play && stage === "fly" ? "right" : "center"}
      variants={flyVariant}
    >
      <div className="absolute inset-0 rounded-2xl shadow-2xl bg-white/95 border border-gray-200 overflow-hidden">
        <div className="absolute inset-0 bg-white" />
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: CARD_H / 2,
            background:
              "linear-gradient(135deg, transparent 50%, #f1f5f9 50%), linear-gradient(225deg, transparent 50%, #f1f5f9 50%)",
            backgroundSize: `${CARD_W / 1.2}px ${CARD_H / 1.2}px`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "left bottom, right bottom",
          }}
        />
      </div>

      {/* درب پاکت */}
      <motion.div
        className="absolute left-0 right-0 top-0 origin-top bg-slate-100 border-b border-gray-300"
        style={{ height: CARD_H / 2 }}
        variants={flapVariant}
        animate={play && (stage === "ball-fall") ? "close" : "open"}
      />
      {/* توپ قرمز */}
      <AnimatePresence>
        {play && ( stage === "ball-fall") && (
          <motion.div
            initial={{ x: 0, y: -220 }}
            animate={{ y: CARD_H / 2 - 30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeIn" }}
            className="absolute left-1/2 -translate-x-1/2"
          >
            <div className="w-8 h-8 rounded-full bg-red-600 shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-2/3 h-2/3 rounded-xl border-2 border-gray-300" />
      </div>
    </motion.div>
  );
}
