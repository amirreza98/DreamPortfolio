// localMeta.ts
export type RepoMeta = {
  title?: string;          // اگه بخوای اسم نمایشی فرق کنه
  blurb?: string;          // خلاصه‌ی 1 خطی دستی
  tags?: string[];         // برچسب‌های خیلی کوتاه
  pin?: number;            // برای ترتیب (کمتر = بالاتر)
  hidden?: boolean;        // برای مخفی‌کردن بعضی ریپوها
  Link?: string;           // لینک سفارشی به جای گیت‌هاب
};

export const LOCAL_META: Record<string, RepoMeta> = {
  SolarSense: {
    blurb: "Realtime microgrid dashboard monitoring and fault detection (Modbus/MQTT, React).",
    tags: ["React", "IoT"],
    pin: 1,
  },
    CISpace: {
    blurb: "Seat/room booking platform with admin dashboard — React + Python API.",
    tags: ["React", "Python", "Booking"],
    Link: "https://cispace.vercel.app",
    pin: 2,
    },
    twindigital: {
    blurb: "Digital twin fashion platform — 3D model with real-time color & pattern customization.",
    tags: ["React", "Three.js", "3D", "FashionTech"],
    Link: "https://thriving-bubblegum-aee085.netlify.app",
    pin: 3,
    },
    realtor: {
    blurb: "Real estate listing platform (React, Node.js).",
    tags: ["React", "Node.js"],
    Link: "https://realtor-tan-beta.vercel.app",
    pin: 4,
    },
    "old-portfolio": {
    blurb: "My old portfolio website (Vanilla JS, CSS).",
    tags: ["JavaScript", "CSS"],
    Link: "https://thunderous-scone-5524b8.netlify.app",
    pin: 5,
    },
    openmemory: {
    blurb: "platform for sharing memories and photos.",
    tags: ["Next.js", "Social"],
    Link: "https://polite-mochi-42c933.netlify.app",
    pin: 6,
    },
    memorygame: {
    blurb: "Classic memory card game (HTML, CSS, JS).",
    tags: ["JavaScript", "Game"],
    Link: "https://fanciful-cascaron-80c237.netlify.app",
    pin: 7,
  },  
};
