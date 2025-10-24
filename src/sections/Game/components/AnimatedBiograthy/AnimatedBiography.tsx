import CoolText from "../../../../components/CoolText";
import { useState } from "react";


const AnimatedBiography = () => {
  const [english, setEnglish] = useState(true);
  const handleClick=()=>{
    if (english){
      return setEnglish(false)
    }
    return setEnglish(true);
  };

  const text = `Hello, my name is AmirReza Azemati. My journey began in Foolad Zarand Co. and first discovered my fascination with digital twins. How powerful was this experience connection between the physical and digital worlds. That experience sparked something in me.<br/>
  Later, I moved to Germany to pursue my master's degree, Although it challenges me to manege studying with expensives. Yet, the more I learned, the stronger my passion grew for building digital models that bring real-world systems to life.<br/>
  Over time, I realized that the web interface is where all these ideas truly come alive, where technology, design, and interaction meet. Today, I'm focused on developing smart, web-based digital twin experiences that connect End Point Users to the systems shaping our future.`;

  const text_de = `Hallo, mein Name ist AmirReza Azemati. Meine Reise begann im Foolad Zarand GmbH. arbeitete und zum ersten Mal meine Faszination für digitale Zwillinge entdeckte – die kraftvolle Verbindung zwischen der physischen und der digitalen Welt. Diese Erfahrung hat in mir etwas entfacht.<br/>
  Später zog ich nach Deutschland, um meinen Masterabschluss zu machen. Es war eine Herausforderung, das Studium mit den hohen Lebenshaltungskosten zu bewältigen. Doch je mehr ich lernte, desto stärker wurde meine Leidenschaft, digitale Modelle zu entwickeln, die reale Systeme zum Leben erwecken.<br/>
  Mit der Zeit wurde mir klar, dass die Weboberfläche der Ort ist, an dem all diese Ideen wirklich lebendig werden - dort, wo Technologie, Design und Interaktion aufeinandertreffen. Heute konzentriere ich mich darauf, intelligente, webbasierte Digital-Twin-Erlebnisse zu entwickeln, die Endnutzer mit den Systemen verbinden, die unsere Zukunft gestalten.`;


  return (
    <div className="flex flex-col min-w-1/2 h-full justify-between overflow-hidden ">
      <button 
        onClick={handleClick}
        className="relative text-xl text-amber-2000 py-1">
        {english ? '▶DE' : '▶EN'}
      </button>
      <div className="flex flex-col-reverse min-h-10 max-h-max overflow-y-hidden text-justify">
        <div>
          <CoolText key={english ? "english" : "german"} text={english ? text : text_de} speed={70} />
        </div>
      </div>
    </div>
  );

};

export default AnimatedBiography;

