import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

type Props = {
  images: string[];
  name?: string;
  auto?: boolean;
  intervalMs?: number;     // delay BETWEEN completed sweeps
  pauseOnHover?: boolean;
  direction?: 1 | -1 | "alt"; // constant or alternating
  durationMs?: number;     // sweep animation duration
};

export default function SwipeStack({
  images,
  name = "repo",
  auto = true,
  intervalMs = 1600,       // smoother cadence than 800ms
  pauseOnHover = false,
  direction = "alt",
  durationMs = 420,        // ~0.42s feels snappy but smooth
}: Props) {
  const [queue, setQueue] = useState(images);
  const [paused, setPaused] = useState(false);

  // motion values for top card
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 0, 260], [-15, 0, 15]);
  const opacity = useTransform(x, [-260, 0, 260], [0, 1, 0]);

  const dirRef = useRef<1 | -1>(1);
  const alive = useRef(true);
  const playing = useRef(false);

  const rotateQueue = () => setQueue(q => (q.length ? [...q.slice(1), q[0]] : q));

  const sweep = async (dir: -1 | 1) => {
    if (playing.current) return; // prevent overlap
    playing.current = true;
    // tween is smoother/predictable than spring for autoplay
    await animate(x, dir * 260, { duration: durationMs / 1000, ease: [0.22, 1, 0.36, 1] }); // easeOutCubic-ish
    rotateQueue();
    x.set(0); // reset instantly for next top card
    playing.current = false;
  };

  useEffect(() => {
    alive.current = true;
    (async () => {
      if (!auto) return;
      while (alive.current) {
        if (!paused && queue.length > 1) {
          // decide direction
          const dir =
            direction === "alt"
              ? (dirRef.current = dirRef.current === 1 ? -1 : 1)
              : (direction as 1 | -1);
          await sweep(dir);
        }
        // wait AFTER the sweep so interval is gap between completed sweeps
        await new Promise(r => setTimeout(r, intervalMs));
      }
    })();
    return () => {
      alive.current = false;
    };
  }, [auto, paused, queue.length, intervalMs, direction, durationMs]); // rebind if knobs change

  return (
    <div
      className="relative h-40 w-full max-w-md"
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
      style={{ willChange: "transform" }}
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
              willChange: "transform, opacity",
            }}
            initial={{ y: i * 8, scale: 1 - i * 0.03, opacity: 1 - i * 0.07 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            drag={isTop ? "x" : false}
            dragElastic={0.8}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              const t = 120;
              if (info.offset.x > t || info.velocity.x > 800) {
                sweep(1);
              } else if (info.offset.x < -t || info.velocity.x < -800) {
                sweep(-1);
              } else {
                animate(x, 0, { duration: 0.28, ease: [0.22, 1, 0.36, 1] });
              }
            }}
          />
        );
      })}
    </div>
  );
}
