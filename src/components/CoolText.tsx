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

  // Slice text progressively and convert <br/> to actual line breaks
  const visibleText = text.slice(0, index).replace(/<br\s*\/?>/gi, "<div style='margin-bottom:1rem'></div>");

  return (
    <div
      className="font-mono"
      dangerouslySetInnerHTML={{
        __html: `${visibleText}<span class='animate-pulse text-cyan-400'>|</span>`,
      }}
    />
  );
};

export default CoolText;
