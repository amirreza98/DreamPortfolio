import React, { useState, useEffect } from "react";

const CoolText = () => {
  const text = "Hello, my name is AmirReza Azemati. I am a te, passionate about a";
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text[i]);
      i++;
      if (i === text.length) clearInterval(interval);
    }, 100); // سرعت تایپ
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 text-xl font-mono text-white">
      {displayed}
      <span className="animate-pulse">|</span>
    </div>
  );
};

export default CoolText;

