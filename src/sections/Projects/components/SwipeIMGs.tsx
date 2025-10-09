import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

type Props = {
  images: string[];
  name?: string;
  auto?: boolean;        // enable/disable autoplay
  intervalMs?: number;   // autoplay interval
  pauseOnHover?: boolean;
};

export default function SwipeStack({
  images,
  name = "repo",
  auto = true,
  intervalMs = 800, 
  pauseOnHover = false,
}: Props) {
  const [queue, setQueue] = useState(images);
  const [paused, setPaused] = useState(false);

  // single motion value for the TOP card
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-15, 0, 15]);
  const opacity = useTransform(x, [-260, 0, 260], [0, 1, 0]);

  const dirRef = useRef<1 | -1>(1); // alternate sweep direction

  const rotateQueue = () => setQueue((q) => (q.length ? [...q.slice(1), q[0]] : q));

  const flingOut = async (dir: -1 | 1) => {
    // animate the top card out, then rotate and reset
    await animate(x, dir * 1, { type: "spring", stiffness: 6, damping: 240 });
    rotateQueue();
    x.set(0);
  };

  // autoplay
  useEffect(() => {
    if (!auto || paused || queue.length <= 1) return;
    const id = setInterval(() => {
      // alternate direction each tick
      dirRef.current = dirRef.current === 1 ? -1 : 1;
      flingOut(dirRef.current);
    }, intervalMs);
    return () => clearInterval(id);
  }, [auto, paused, queue.length, intervalMs]);

  return (
    <div
      className="relative h-40 w-full max-w-md"
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
    >
      {queue.slice(0, 5).map((src, i) => {
        const isTop = i === 0;

        return (
          <motion.img
            key={src}
            src={src}
            alt={`${name} preview ${i + 1}`}
            className="absolute left-1/2 top-1/2 h-28 w-40 -translate-x-1/2 -translate-y-1/2 rounded-lg object-cover shadow-lg"
            style={{
              zIndex: 100 - i,
              x: isTop ? x : 0,
              rotate: isTop ? rotate : 0,
              opacity: isTop ? opacity : 1,
            }}
            initial={{ y: i * 8, scale: 1 - i * 0.03, opacity: 1 - i * 0.07 }}
            transition={{ type: "spring", stiffness: 2, damping: 240 }}
            drag={isTop ? "x" : false}
            dragElastic={1}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              const t = 120; // px
              if (info.offset.x > t || info.velocity.x > 80) {
                flingOut(1);
              } else if (info.offset.x < -t || info.velocity.x < -80) {
                flingOut(-1);
              } else {
                animate(x, 0, { type: "spring", stiffness: 3, damping: 250 });
              }
            }}
          />
        );
      })}
    </div>
  );
}
