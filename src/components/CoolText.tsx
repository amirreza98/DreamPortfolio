import React, { useState, useEffect } from "react";

type CoolTextProps = {
  text: string;
  speed?: number;
};

const CoolText: React.FC<CoolTextProps> = ({ text, speed = 100 }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % (text.length + 1));
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <div className="font-mono">
      {text.slice(0, index)}
      <span className="animate-pulse text-cyan-400">|</span>
    </div>
  );
};

export default CoolText;
