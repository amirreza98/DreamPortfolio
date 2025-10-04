import { useEffect, useRef } from "react";

/* =========================
   Logical playfield size
   ========================= */
const LOGICAL_W = 1000;
const LOGICAL_H = 700;
const FLOOR_Y = LOGICAL_H - 43; // هرچقدر می‌خوای بالاتر بیاد، این عددو زیاد کن
const RAMP_TOP_Y = LOGICAL_H - 260; // جایی که شیب‌ها از آن شروع می‌شوند
const DRAIN_GAP = 160;            // فاصلهٔ خالی وسط (دهانه‌ی درِین)
const PLATFORM_LEN = 200;         // طول سکوهای صاف کنار فلاپر
const DT = 1 / 60;            // گام زمانی ثابت برای کنترل نرم
const FLIPPER_MAX_SPEED = 8;  // rad/s حداکثر سرعت چرخش فلپر

/* =========================
   Physics tunables
   ========================= */
const BALL_R = 10;
const GRAVITY = 0.3;     // px / frame^2 (logical units)
const FRICTION = 0.995;  // velocity damping per frame
const RESTITUTION = 0.9; // bounciness on walls

// Bumper parameters
const BUMPER_R = 18;
const BUMPER_LIGHT_MS = 370;   // چند میلی‌ثانیه روشن بماند
/* =========================
   Types (Step 2)
   ========================= */
type Vec2 = { x: number; y: number };

type Segment = { a: Vec2; b: Vec2; normal?: Vec2 };

export type Ball = {
  pos: Vec2;
  vel: Vec2;
  r: number;
};

export type SkillKey =
  | "TypeScript" | "React" | "Node.js" | "Express" | "MongoDB"
  | "PostgreSQL" | "Tailwind" | "Docker" | "Git" | "AWS";

export type Bumper = {
  pos: Vec2;
  r: number;
  skill: SkillKey;
  isActive: boolean;
  litUntil: number; // ms timestamp
  isLit: boolean;
};

export type FlipperSide = "left" | "right";

export type Flipper = {
  side: FlipperSide;
  pivot: Vec2;
  length: number;
  thickness: number; // drawing only
  angle: number;       // current angle (rad)
  angleRest: number;   // rest angle
  angleActive: number; // max active angle
  angVel: number;      // rad/s (we'll use later)
};

export type Wall = Segment;

type Controls = { left: boolean; right: boolean; nudge: boolean };


// Clamp در بازه [0,1]
function clamp01(t: number) {
  return Math.max(0, Math.min(1, t));
}

// نزدیک‌ترین نقطه از سگمنت به یک نقطه + نرمال
function closestPointAndNormal(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
) {
  const vx = x2 - x1, vy = y2 - y1;
  const len2 = vx*vx + vy*vy || 1e-6;
  let t = ((px - x1)*vx + (py - y1)*vy) / len2;
  t = clamp01(t);
  const cx = x1 + t*vx, cy = y1 + t*vy;
  // نرمال از سگمنت به سمت توپ
  let nx = px - cx, ny = py - cy;
  const dist = Math.hypot(nx, ny) || 1e-6;
  nx /= dist; ny /= dist;
  return { cx, cy, nx, ny, dist, t };
}

// برخورد توپ با سگمنت (فلپر/دیوار باریک)
function collideBallWithSegment(
  ball: Ball,
  x1: number, y1: number,
  x2: number, y2: number,
  effectiveRadius: number,         // شعاع مؤثر (توپ + ضخامت فلپر/۲)
  restitution = RESTITUTION
) {
  const { nx, ny, dist } = closestPointAndNormal(ball.pos.x, ball.pos.y, x1, y1, x2, y2);
  const overlap = effectiveRadius - dist;
  if (overlap > 0) {
    // هل دادن توپ به بیرون
    ball.pos.x += nx * overlap;
    ball.pos.y += ny * overlap;

    // بازتاب سرعت روی نرمال (فقط اگر به سمت داخل می‌رفت)
    const vn = ball.vel.x * nx + ball.vel.y * ny;
    if (vn < 0) {
      ball.vel.x -= (1 + restitution) * vn * nx;
      ball.vel.y -= (1 + restitution) * vn * ny;
    }
    return true;
  }
  return false;
}

function collideBallWithBumper(ball: Ball, b: Bumper, restitution = 1.0) {
  const dx = ball.pos.x - b.pos.x;
  const dy = ball.pos.y - b.pos.y;
  const dist = Math.hypot(dx, dy) || 1e-6;
  const minDist = ball.r + b.r;

  if (dist < minDist) {
    // جدا کردن
    const nx = dx / dist, ny = dy / dist;
    const overlap = minDist - dist;
    ball.pos.x += nx * overlap;
    ball.pos.y += ny * overlap;

    // بازتاب سرعت روی نرمال
    const vn = ball.vel.x * nx + ball.vel.y * ny;
    if (vn < 0) {
      ball.vel.x -= (1 + restitution) * vn * nx;
      ball.vel.y -= (1 + restitution) * vn * ny;
    }

    // روشن کردن بامپر
    b.isLit = true;
    b.isActive = false;
    b.litUntil = performance.now() + BUMPER_LIGHT_MS;
    return true;
  }
  return false;
}

/* Skills registry (logos later) */
export const SKILLS: SkillKey[] = [
  "TypeScript","React","Node.js","Express","MongoDB",
  "PostgreSQL","Tailwind","Docker","Git","AWS"
];

/* =========================
   Helpers to build geometry
   ========================= */
function buildWalls(): Wall[] {
    
  const cx = LOGICAL_W / 2;

  // سکوی صاف کنار فلاپرها
  // (برای رسم ناحیه خاکستری پایین)
  const leftPlatStart  = cx - DRAIN_GAP / 2 - PLATFORM_LEN; // شروع سکوی چپ
  const leftPlatEnd    = cx - DRAIN_GAP / 2 - 50;                 // انتهای سکوی چپ (لبه‌ی درِین)
  const rightPlatStart = cx + DRAIN_GAP / 2 + 50;                 // شروع سکوی راست (لبه‌ی درِین)
  const rightPlatEnd   = cx + DRAIN_GAP / 2 + PLATFORM_LEN;  // انتهای سکوی راست


  // Outer rectangle for now; ramps will be added in the next step
  return [
    // مرزهای بالا/طرفین
    { a: { x: 0, y: 0 }, b: { x: LOGICAL_W, y: 0 } },                   // TOP
    { a: { x: 0, y: 0 }, b: { x: 0, y: RAMP_TOP_Y } },                   // LEFT vertical
    { a: { x: LOGICAL_W, y: 0 }, b: { x: LOGICAL_W, y: RAMP_TOP_Y } },   // RIGHT vertical

    // شیب‌ها
    { a: { x: 0, y: RAMP_TOP_Y }, b: { x: leftPlatStart, y: FLOOR_Y } },        // ramp left
    { a: { x: LOGICAL_W, y: RAMP_TOP_Y }, b: { x: rightPlatEnd, y: FLOOR_Y } }, // ramp right

    // سکوهای صاف کنار فلاپرها
    { a: { x: leftPlatStart, y: FLOOR_Y }, b: { x: leftPlatEnd, y: FLOOR_Y } },   // platform left
    { a: { x: rightPlatStart, y: FLOOR_Y }, b: { x: rightPlatEnd, y: FLOOR_Y } }, // platform right

    // دیواره‌ی عمودی زیر سکوها (جلوی افتادن توپ به ناحیه خاکستری پایین را می‌گیرد)
    { a: { x: leftPlatStart,  y: FLOOR_Y }, b: { x: leftPlatStart,  y: LOGICAL_H } },
    { a: { x: rightPlatEnd,   y: FLOOR_Y }, b: { x: rightPlatEnd,   y: LOGICAL_H } },
  ];
}

function buildFlippers(): Flipper[] {
  const len = 120, thick = 16;
  const cx = LOGICAL_W / 2;          // screen middle (x)
  const y  = LOGICAL_H - 35;         // near bottom

  return [
    // LEFT flipper: pivot at center - length, pointing toward center
    {
      side: "left",
      pivot: { x: cx - len - 60, y },
      length: len, thickness: thick,
      angle: 0.2,                 // ≈ 11° down-right (rest)
      angleRest: 0.2,
      angleActive: -0.6,          // flips up-right toward center
      angVel: 20,
    },
    // RIGHT flipper: pivot at center + length, pointing toward center
    {
      side: "right",
      pivot: { x: cx + len + 60, y },
      length: len, thickness: thick,
      angle: Math.PI - 0.2,       // ≈ 169° down-left (rest)
      angleRest: Math.PI - 0.2,
      angleActive: Math.PI + 0.6, // flips up-left toward center
      angVel: 20,
    },
  ];
}


// گرید: 4 ردیف × 9 ستون
function buildBumpers(): Bumper[] {
  const items: Bumper[] = [];

  // ماسک دقیقا همان که گفتی
  const MASK: number[][] = [
    [1,1,0,0,0,0,0,0,1,1], // ردیف 1 (بالا)
    [1,1,1,0,0,0,0,1,1,1], // ردیف 2
    [0,1,1,1,0,0,1,1,1,0], // ردیف 3
    [0,0,1,1,0,0,1,1,0,0], // ردیف 4 (پایین)
  ];

  const ROWS = MASK.length;
  const COLS = MASK[0].length;

  // اندازه‌ی گرید: 9 ستون، 4 ردیف
  // فاصله‌ی مساوی بین ستون‌ها و ردیف‌ها
  const PAD_X = 40; // فاصله از کناره‌ها
  const PAD_Y = RAMP_TOP_Y - 100; // شروع بالایی


  // مختصات X ستون‌ها
  const xs = Array.from({ length: COLS }, (_, c) => PAD_X + c * 100);

  // مختصات Y ردیف‌ها
  const ys = Array.from({ length: ROWS }, (_, r) => PAD_Y + r * 90);

  // ساخت بامپرها طبق ماسک
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!MASK[r][c]) continue;
      items.push({
        pos: { x: xs[c], y: ys[r] },
        r: BUMPER_R,
        skill: SKILLS[items.length % SKILLS.length],
        isLit: false,
        litUntil: 0,
        isActive: true,
      });
    }
  }

  return items;
}




/* Compute the visible endpoints of a flipper segment for drawing */
function flipperEndpoints(f: Flipper) {
  const x2 = f.pivot.x + Math.cos(f.angle) * f.length;
  const y2 = f.pivot.y + Math.sin(f.angle) * f.length;
  return { x1: f.pivot.x, y1: f.pivot.y, x2, y2 };
}

/* =========================
   Component
   ========================= */
export default function PinballGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- Core game objects (Step 2: refs for mutation without re-render) ---
  const ballRef = useRef<Ball>({
    pos: { x: LOGICAL_W - 40, y: 40 },
    vel: { x: -2, y: 0 },
    r: BALL_R,
  });

  const bumpersRef = useRef<Bumper[]>([]);
  const flippersRef = useRef<Flipper[]>([]);
  const wallsRef = useRef<Wall[]>([]);
  const controlsRef = useRef<Controls>({ left: false, right: false, nudge: false });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    // Build initial world
    wallsRef.current = buildWalls();
    flippersRef.current = buildFlippers();
    bumpersRef.current = buildBumpers();

    // Fullscreen canvas
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    // Keyboard (we’ll use these in the flipper step)
    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") controlsRef.current.left = down;
      if (e.code === "ArrowRight" || e.code === "KeyL") controlsRef.current.right = down;
      if (e.code === "ArrowUp") controlsRef.current.nudge = down;
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    /* =========================
            step
   ========================= */
    let raf = 0;
    const step = () => {
      // --- Physics update (ball + temporary rectangle collisions) ---
      const b = ballRef.current;
      b.vel.y += GRAVITY;
      b.vel.x *= FRICTION; b.vel.y *= FRICTION;
      b.pos.x += b.vel.x; b.pos.y += b.vel.y;
      
      // Update flipper angles before collisions
      // Update flippers toward target angle based on keys
      for (const f of flippersRef.current) {
        const pressed = f.side === "left" ? controlsRef.current.left : controlsRef.current.right;
        const target = pressed ? f.angleActive : f.angleRest;

        const prev = f.angle;
        const maxDelta = FLIPPER_MAX_SPEED * DT;           // بیشترین تغییر زاویه در یک فریم
        const want = target - prev;
        const delta = Math.max(-maxDelta, Math.min(maxDelta, want));
        f.angle = prev + delta;
        f.angVel = (f.angle - prev) / DT;                  // برای ایمپالس ضربه استفاده می‌کنیم
      }


      // Rectangle bounds (we’ll replace with segment walls next step)
      for (const w of wallsRef.current) {
        collideBallWithSegment(
          ballRef.current,
          w.a.x, w.a.y, w.b.x, w.b.y,
          ballRef.current.r, // شعاع مؤثر برای دیوار
          1
        );
      }

      // Bumpers collisions + خاموش/روشن
      const now = performance.now();
      for (const bp of bumpersRef.current) {
        // خاموش شدن پس از زمان روشنایی
        if (bp.isLit && now > bp.litUntil) {
          bp.isLit = false;
          bp.isActive = false;
        }
        if (!bp.isActive) (
          // اگر غیرفعال است، بعد از مدتی دوباره فعال شود
          bp.isActive = now > bp.litUntil + 500
        )

        collideBallWithBumper(ballRef.current, bp, 1); // کمی پران‌تر از دیوار
      }

      // Flipper collisions (separate loop because we need updated angles)
      for (const f of flippersRef.current) {
        const { x1, y1, x2, y2 } = flipperEndpoints(f);
        const effR = ballRef.current.r + f.thickness * 0.5; // شعاع مؤثر
        collideBallWithSegment(ballRef.current, x1, y1, x2, y2, effR, 1.4); // کمی پرتابی‌تر
      }
      //-----------------------------
      // ---------- Render ---
      //-----------------------------

      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Scale logical → screen
      ctx.save();
      ctx.scale(W / LOGICAL_W, H / LOGICAL_H);

      // Playfield outline
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, LOGICAL_W, FLOOR_Y);

      // Walls
      // Scale فعال است (ctx.scale(...))
      const PLATFORM_HEIGHT = 43;
      const cx = LOGICAL_W / 2;
      const leftPlatStart  = cx - DRAIN_GAP / 2 - PLATFORM_LEN;
      const leftPlatEnd    = cx - DRAIN_GAP;
      const rightPlatStart = cx + DRAIN_GAP;
      const rightPlatEnd   = cx + DRAIN_GAP / 2 + PLATFORM_LEN;


      ctx.fillStyle = "#d9d9d9";

      // چپ (شیب)
      ctx.beginPath();
      ctx.moveTo(2, RAMP_TOP_Y);
      ctx.lineTo(leftPlatStart, FLOOR_Y);
      ctx.lineTo(leftPlatStart, LOGICAL_H);
      ctx.lineTo(0, LOGICAL_H);
      ctx.closePath();
      ctx.fill();

      // راست (شیب)
      ctx.beginPath();
      ctx.moveTo(LOGICAL_W, RAMP_TOP_Y);
      ctx.lineTo(rightPlatEnd, FLOOR_Y);
      ctx.lineTo(rightPlatEnd, LOGICAL_H);
      ctx.lineTo(LOGICAL_W, LOGICAL_H);
      ctx.closePath();
      ctx.fill();

      // پایین (خاکستری)
      ctx.fillRect(leftPlatStart,  FLOOR_Y, leftPlatEnd  - leftPlatStart,  PLATFORM_HEIGHT);
      ctx.fillRect(rightPlatStart, FLOOR_Y, rightPlatEnd - rightPlatStart, PLATFORM_HEIGHT);

      // Flippers
      for (const f of flippersRef.current) {
        const { x1, y1, x2, y2 } = flipperEndpoints(f);
        ctx.lineCap = "round";
        ctx.lineWidth = f.thickness;
        ctx.strokeStyle = "#86efac";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Bumpers (با لوگو بعداً)
      for (const bp of bumpersRef.current) {
        // glow ساده وقتی روشن است
        if (bp.isLit) {
          ctx.beginPath();
          ctx.arc(bp.pos.x, bp.pos.y, bp.r * 1.6, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(80,120,255,0.25)";
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(bp.pos.x, bp.pos.y, bp.r, 0, Math.PI * 2);
        ctx.fillStyle = bp.isLit ? "#5b7cff" : "#2f47b9"; // روشن/خاموش
        ctx.fill();

        // (بعداً لوگو را اینجا می‌گذاریم)
      }
      // Ball
      ctx.beginPath();
      ctx.arc(b.pos.x, b.pos.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = "#e43a2f";
      ctx.fill();

      ctx.restore();

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, []);

  // Fullscreen canvas (independent of parent)
  return (
    <canvas
      ref={canvasRef}
      style={{
        inset: 1,
        width: "99vw",
        height: "99vh",
        display: "block",
        zIndex: 0,
        background: "white",
      }}
    />
  );
}
