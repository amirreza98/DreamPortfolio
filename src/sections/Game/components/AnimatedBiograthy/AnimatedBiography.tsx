import React, { useState, useEffect } from "react";

const CoolText = () => {
  const text = "Hello, my name is AmirReza Azemati. I am a te, passionate about";
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % (text.length + 1)); 
      // loops from 0 → text.length → back to 0
    }, 100);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="p-4 text-xl font-mono text-white">
      {text.slice(0, index)}
      <span className="animate-pulse text-cyan-400">|</span>
    </div>
  );
};

export default CoolText;

