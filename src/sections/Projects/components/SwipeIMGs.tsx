import { useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

type Props = { images: string[]; name?: string };

export default function SwipeStack({ images, name = "repo" }: Props) {
  const [queue, setQueue] = useState(images);

  const rotateQueue = () => setQueue((q) => [...q.slice(1), q[0]]);

  return (
    <div className="relative h-40 w-full max-w-md">
      {queue.slice(0, 5).map((src, i) => {
        const isTop = i === 0;

        // motion values for the TOP card
        const x = useMotionValue(0);
        const rotate = useTransform(x, [-220, 0, 220], [-15, 0, 15]);
        const opacity = useTransform(x, [-260, 0, 260], [0, 1, 0]);

        const flingOut = async (dir: -1 | 1) => {
          await animate(x, dir * 600, { type: "spring", stiffness: 260, damping: 24 });
          rotateQueue();
          x.set(0);
        };

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
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            drag={isTop ? "x" : false}
            dragElastic={0.15}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              const t = 120; // px
              if (info.offset.x > t || info.velocity.x > 800) {
                flingOut(1);
              } else if (info.offset.x < -t || info.velocity.x < -800) {
                flingOut(-1);
              } else {
                animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
              }
            }}
          />
        );
      })}
    </div>
  );
}