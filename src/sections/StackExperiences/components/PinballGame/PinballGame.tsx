import React, { useEffect, useRef, useState } from "react";

type Bumper = {
  x: number;
  y: number;
  r: number;
  skill: string;
  activeUntil: number;
};

// --- Tunables ---
const GRAVITY = 0.32;
const FRICTION = 0.9992;
const RESTITUTION = 0.92;
const BALL_RADIUS = 9;

const FLIPPER_LENGTH = 120;
const FLIPPER_THICKNESS = 14;
const FLIPPER_ANGLE_REST = -0.18;
const FLIPPER_ANGLE_ACTIVE = 0.62;
const FLIPPER_SPEED = 0.22;

const MARGIN = 24; // inner margin from canvas edge for the playfield

const SKILL_LIST = [
  "TypeScript","React","Node.js","Express","MongoDB",
  "PostgreSQL","Tailwind","Docker","Git","AWS"
];

// Helper: distance from a point to a segment + closest point
function pointSegDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const vx = x2 - x1, vy = y2 - y1;
  const wx = px - x1, wy = py - y1;
  const len2 = vx*vx + vy*vy || 1;
  let t = (wx*vx + wy*vy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t*vx, cy = y1 + t*vy;
  const dx = px - cx, dy = py - cy;
  const dist = Math.hypot(dx, dy);
  return { dist, cx, cy, nx: dist ? dx/dist : 0, ny: dist ? dy/dist : 0 };
}

// Resolve circle vs segment collision (reflect + push out)
function collideBallWithSegment(ball: {x:number;y:number;vx:number;vy:number}, x1:number,y1:number,x2:number,y2:number, radius:number) {
  const { dist, cx, cy, nx, ny } = pointSegDistance(ball.x, ball.y, x1, y1, x2, y2);
  if (dist < radius) {
    // push out
    const overlap = radius - dist;
    ball.x += nx * overlap;
    ball.y += ny * overlap;
    // reflect
    const dot = ball.vx * nx + ball.vy * ny;
    if (dot < 0) {
      ball.vx -= 2 * dot * nx;
      ball.vy -= 2 * dot * ny;
      ball.vx *= RESTITUTION;
      ball.vy *= RESTITUTION;
    }
    return true;
  }
  return false;
}

// Build a polyline from control points, then we’ll collide against each segment
function makePolyline(points: Array<[number, number]>): Array<[number, number]> {
  return points;
}

export default function PinballGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // runtime canvas size
  const sizeRef = useRef({ w: 800, h: 1200 });

  // Ball state
  const ball = useRef({ x: 0, y: 0, vx: -3, vy: 0 });

  // Flippers
  const leftFlipper = useRef({ cx: 0, cy: 0, angle: FLIPPER_ANGLE_REST, target: FLIPPER_ANGLE_REST });
  const rightFlipper = useRef({ cx: 0, cy: 0, angle: -FLIPPER_ANGLE_REST, target: -FLIPPER_ANGLE_REST });

  // Walls (segments) + Rails (polylines of segments)
  const sideSegments = useRef<Array<[number, number, number, number]>>([]);
  const railSegments = useRef<Array<[number, number, number, number]>>([]);

  // Bumpers
  const bumpersRef = useRef<Bumper[]>([]);
  const [lastHitSkill, setLastHitSkill] = useState<string | null>(null);

  // ---------- Layout ----------
  const layout = () => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const w = window.innerWidth;
    const h = window.innerHeight;

    c.width = w * dpr;
    c.height = h * dpr;
    c.style.width = `${w}px`;
    c.style.height = `${h}px`;
    const ctx = c.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    sizeRef.current = { w, h };

    // Place flippers near corners (green)
    const yFlipper = h - 90;
    const gap = Math.min(180, w * 0.22); // distance between flipper hinges
    leftFlipper.current.cx  = (w / 2) - (gap / 2);
    leftFlipper.current.cy  = yFlipper;
    rightFlipper.current.cx = (w / 2) + (gap / 2);
    rightFlipper.current.cy = yFlipper;

    // Ball spawn (top-right)
    ball.current.x = w - (MARGIN + 60);
    ball.current.y = MARGIN + 60;
    ball.current.vx = -3;
    ball.current.vy = 0;

    // Side walls (purple): left/right vertical + two diagonals guiding to the drain gap
    const ySlopeStart = h * 0.62;
    const ySlopeEnd = yFlipper - 38;

    sideSegments.current = [
      // verticals
      [MARGIN, MARGIN, MARGIN, h - MARGIN],
      [w - MARGIN, MARGIN, w - MARGIN, h - MARGIN],
      // top cap
      [MARGIN, MARGIN, w - MARGIN, MARGIN],
      // diagonals to bottom
      [MARGIN, ySlopeStart, w * 0.43, ySlopeEnd],            // left slope
      [w - MARGIN, ySlopeStart, w * 0.57, ySlopeEnd],        // right slope
    ];


    // Bumpers grid
    // --- Random bottom-biased bumpers (left/right lanes) ---
    const count = 10;              // how many bumpers total
    const r = 18;                  // bumper radius
    const yMin = h * 0.55;         // start lower half
    const yMax = h * 0.82;         // not too close to flippers
    const leftX  = w * 0.35;       // lane centers
    const rightX = w * 0.65;
    const jitterX = 34;            // small horizontal jitter
    const minGap = r * 2.2;        // spacing to avoid overlaps

    const bumps: Bumper[] = [];
    let tries = 0;

    while (bumps.length < count && tries < count * 50) {
      tries++;

      const sideX = Math.random() < 0.5 ? leftX : rightX;
      const x = sideX + (Math.random() - 0.5) * jitterX * 2;
      const y = yMin + Math.random() * (yMax - yMin);

      // keep away from each other
      let ok = true;
      for (const b of bumps) {
        if (Math.hypot(x - b.x, y - b.y) < minGap) { ok = false; break; }
      }
      // keep away from flipper hinge area a bit
      if (ok) {
        const lf = leftFlipper.current, rf = rightFlipper.current;
        if (Math.hypot(x - lf.cx, y - lf.cy) < 120 || Math.hypot(x - rf.cx, y - rf.cy) < 120) ok = false;
      }

      if (ok) {
        const idx = bumps.length % SKILL_LIST.length;
        bumps.push({ x, y, r, skill: SKILL_LIST[idx], activeUntil: 0 });
      }
    }

    bumpersRef.current = bumps;

  };

  // ---------- Controls ----------
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        leftFlipper.current.target = FLIPPER_ANGLE_ACTIVE;
      }
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        rightFlipper.current.target = -FLIPPER_ANGLE_ACTIVE;
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        leftFlipper.current.target = FLIPPER_ANGLE_REST;
      }
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        rightFlipper.current.target = -FLIPPER_ANGLE_REST;
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // ---------- Bumpers ----------
  const handleBumperCollision = (b: { x:number;y:number;vx:number;vy:number }, bumper: Bumper) => {
    const dx = b.x - bumper.x;
    const dy = b.y - bumper.y;
    const dist = Math.hypot(dx, dy);
    if (dist < bumper.r + BALL_RADIUS) {
      const overlap = bumper.r + BALL_RADIUS - dist;
      const nx = dx / (dist || 1);
      const ny = dy / (dist || 1);
      b.x += nx * overlap;
      b.y += ny * overlap;
      const dot = b.vx * nx + b.vy * ny;
      b.vx -= 2 * dot * nx;
      b.vy -= 2 * dot * ny;
      // bumper kick
      b.vx += nx * 2.2;
      b.vy += ny * 2.2;
      bumper.activeUntil = performance.now() + 800;
      setLastHitSkill(bumper.skill);
    }
  };

  // ---------- Flipper impulse & simple floor under them ----------
  const applyFlipperImpulse = (flipper: { cx:number; cy:number; angle:number; target:number }, isLeft:boolean) => {
    const sin = Math.sin(flipper.angle), cos = Math.cos(flipper.angle);

    // quick hit zone
    const dx = ball.current.x - flipper.cx;
    const dy = ball.current.y - flipper.cy;
    const dist = Math.hypot(dx, dy);
    const movingTowardActive = isLeft ? flipper.target > flipper.angle : flipper.target < flipper.angle;

    if (dist < FLIPPER_LENGTH + 26 && dy > -30 && dy < 90 && Math.abs(dx) < FLIPPER_LENGTH + 36) {
      if (movingTowardActive) {
        const nx = -sin * (isLeft ? 1 : -1);
        const ny =  cos * (isLeft ? 1 : -1);
        const strength = 8.0;
        ball.current.vx += nx * strength;
        ball.current.vy += ny * strength;
      }
    }

    // local "floor" to prevent clipping
    const floorY = flipper.cy + FLIPPER_THICKNESS;
    if (ball.current.y > floorY && Math.abs(ball.current.x - flipper.cx) < FLIPPER_LENGTH * 0.9) {
      ball.current.y = floorY;
      if (ball.current.vy > 0) ball.current.vy *= -0.25;
    }
  };

  // ---------- Loop ----------
  const resetBall = () => {
    const { w } = sizeRef.current;
    ball.current.x = w - (MARGIN + 60);
    ball.current.y = MARGIN + 60;
    ball.current.vx = -3;
    ball.current.vy = 0;
  };

  const loop = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { w, h } = sizeRef.current;

    // physics
    ball.current.vy += GRAVITY;
    ball.current.vx *= FRICTION;
    ball.current.vy *= FRICTION;
    ball.current.x += ball.current.vx;
    ball.current.y += ball.current.vy;

    // collide with side segments (purple)
    for (const [x1, y1, x2, y2] of sideSegments.current) {
      collideBallWithSegment(ball.current, x1, y1, x2, y2, BALL_RADIUS);
    }

    // bumpers
    const now = performance.now();
    for (const bumper of bumpersRef.current) {
      handleBumperCollision(ball.current, bumper);
      if (bumper.activeUntil < now) {
        // no-op; draw checks time
      }
    }

    // flippers rotate toward targets and apply impulse
    const lf = leftFlipper.current;
    const rf = rightFlipper.current;
    lf.angle += (lf.target - lf.angle) * FLIPPER_SPEED;
    rf.angle += (rf.target - rf.angle) * FLIPPER_SPEED;
    applyFlipperImpulse(lf, true);
    applyFlipperImpulse(rf, false);

    // drain: if ball passes below bottom margin, reset
    if (ball.current.y > h + 60) resetBall();

    // -------- DRAW --------
    ctx.clearRect(0, 0, w, h);

    // background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#0f1c2b");
    grad.addColorStop(0.6, "#0a1420");
    grad.addColorStop(1, "#04080e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // playfield glass border
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(MARGIN, MARGIN, w - 2*MARGIN, h - 2*MARGIN, 18);
    ctx.stroke();

    // purple walls (collidable)
    ctx.strokeStyle = "#7C3AED";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    for (const [x1, y1, x2, y2] of sideSegments.current) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }


    // bumpers
    for (const bumper of bumpersRef.current) {
      const active = now < bumper.activeUntil;
      ctx.beginPath();
      ctx.arc(bumper.x, bumper.y, bumper.r, 0, Math.PI * 2);
      ctx.fillStyle = active ? "#10B981" : "#374151";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(bumper.x, bumper.y, bumper.r * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = active ? "#34D399" : "#1F2937";
      ctx.fill();

      if (active) {
        ctx.font = "12px ui-sans-serif, system-ui, -apple-system";
        ctx.textAlign = "center";
        ctx.fillStyle = "#E5E7EB";
        ctx.fillText(bumper.skill, bumper.x, bumper.y - bumper.r - 8);
      }
    }

    // draw flippers (green)
    const drawFlipper = (fl: {cx:number;cy:number;angle:number}, isLeft:boolean) => {
      ctx.save();
      ctx.translate(fl.cx, fl.cy);
      ctx.rotate(fl.angle);
      ctx.fillStyle = "#22C55E";
      ctx.fillRect(0, -FLIPPER_THICKNESS/2, (isLeft ? 1 : -1) * FLIPPER_LENGTH, FLIPPER_THICKNESS);
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI*2);
      ctx.fillStyle = "#16A34A";
      ctx.fill();
      ctx.restore();
    };
    drawFlipper(lf, true);
    drawFlipper(rf, false);

    // ball
    ctx.beginPath();
    ctx.arc(ball.current.x, ball.current.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#E5E7EB";
    ctx.fill();

    // HUD
    if (lastHitSkill) {
      ctx.font = "14px ui-sans-serif, system-ui, -apple-system";
      ctx.textAlign = "center";
      ctx.fillStyle = "#D1D5DB";
      ctx.fillText(`Last hit: ${lastHitSkill}`, w / 2, 28);
    }

    animationRef.current = requestAnimationFrame(loop);
  };

  // ---------- Effects ----------
  useEffect(() => {
    layout();
    animationRef.current = requestAnimationFrame(loop);

    const onResize = () => {
      layout();
    };
    window.addEventListener("resize", onResize);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // initial DPR setup
  useEffect(() => {
    layout();
  }, []);

  return (
    <div className="w-screen h-screen">
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        aria-label="Fullscreen Pinball"
      />
      <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-300">
        Controls: Left/Right arrows (or A/D) to flip.
      </div>
    </div>
  );
}
