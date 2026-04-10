import { useEffect, useRef } from "react";

/**
 * Threat-severity ambient smoke inside the hero card.
 * No arc, no directional emission — particles spontaneously appear
 * everywhere across the card like breathing fog, tinted to threat color.
 * Slow, organic, natural movement. Contained by parent overflow:hidden.
 */

const THREAT_HSL = {
  critical: { hueMin: 345, hueMax: 365, satMin: 80, satMax: 100, lightMin: 28, lightMax: 48 },
  high:     { hueMin: 12,  hueMax: 30,  satMin: 75, satMax: 95,  lightMin: 28, lightMax: 46 },
  medium:   { hueMin: 34,  hueMax: 52,  satMin: 72, satMax: 92,  lightMin: 28, lightMax: 46 },
  low:      { hueMin: 130, hueMax: 160, satMin: 58, satMax: 82,  lightMin: 24, lightMax: 40 },
};

function rand(a, b) { return Math.random() * (b - a) + a; }
function lerp(a, b, t) { return a + (b - a) * t; }

function noise(x, y, t) {
  return Math.sin(x * 0.003 + t * 0.0004) *
    Math.cos(y * 0.004 + t * 0.0005) *
    Math.sin((x + y) * 0.002 + t * 0.0003) +
    Math.sin(x * 0.008 + y * 0.006 + t * 0.0007) * 0.35;
}

export default function HeroThreatSmoke({ threatLevel = "critical" }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const frameRef = useRef(0);
  const breathRef = useRef(0);
  const threatRef = useRef(threatLevel);

  useEffect(() => {
    if (threatRef.current !== threatLevel) {
      particlesRef.current.forEach((p) => {
        p.decay = Math.max(p.decay, 0.005);
      });
      threatRef.current = threatLevel;
    }
  }, [threatLevel]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let W, H;

    const resize = () => {
      const r = c.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      W = r.width;
      H = r.height;
      c.width = W * dpr;
      c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    function spawn() {
      const hsl = THREAT_HSL[threatRef.current] || THREAT_HSL.critical;

      // Appear anywhere on the card — natural, not from a specific source
      const x = rand(W * 0.02, W * 0.98);
      const y = rand(H * 0.05, H * 0.95);

      particlesRef.current.push({
        x, y,
        // Near-zero initial velocity — they just appear and drift
        vx: rand(-0.02, 0.02),
        vy: rand(-0.03, 0.01),
        size: rand(60, 160),
        growRate: rand(0.03, 0.12),
        life: 1,
        decay: rand(0.00012, 0.0005),
        noiseOffX: rand(0, 1000),
        noiseOffY: rand(0, 1000),
        drag: 0.999,
        hue: rand(hsl.hueMin, hsl.hueMax),
        sat: rand(hsl.satMin, hsl.satMax),
        lightness: rand(hsl.lightMin, hsl.lightMax),
        peakAlpha: rand(0.20, 0.45),
        phase: rand(0, Math.PI * 2),
      });
    }

    // Seed — fill the card with visible smoke from the start
    for (let i = 0; i < 40; i++) spawn();

    const draw = () => {
      frameRef.current++;
      const ft = frameRef.current;
      breathRef.current += 0.008;

      ctx.clearRect(0, 0, W, H);

      // Breathing rhythm — slow sine wave controls emission density
      const breath = (Math.sin(breathRef.current) + 1) / 2;
      // ~2 particles per frame on average, surging with breath
      if (Math.random() < 0.5 + breath * 0.4) spawn();
      if (Math.random() < 0.3 + breath * 0.3) spawn();
      // Occasional gentle cluster
      if (Math.random() < 0.012) {
        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) spawn();
      }

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life -= p.decay;
        if (p.life <= 0) { particlesRef.current.splice(i, 1); continue; }

        // Very gentle noise drift — organic wandering
        const nf = noise(p.x + p.noiseOffX, p.y + p.noiseOffY, ft * 0.15);
        p.vx += nf * 0.0008;
        p.vy += Math.cos(nf * 2) * 0.0005;
        p.vy -= 0.0005; // barely perceptible upward tendency

        p.x += p.vx;
        p.y += p.vy;
        p.size += p.growRate;
        p.vx *= p.drag;
        p.vy *= p.drag;

        // Smooth alpha: fade in → sustain → fade out
        // Bell curve shaped — peaks in the middle of life
        const age = 1 - p.life;
        let alpha;
        if (age < 0.15) {
          alpha = (age / 0.15) * p.peakAlpha;
        } else if (p.life < 0.25) {
          alpha = (p.life / 0.25) * p.peakAlpha;
        } else {
          alpha = p.peakAlpha;
        }

        const sat = lerp(25, p.sat, p.life * 0.8 + 0.2);
        const light = lerp(5, p.lightness, p.life * 0.7 + 0.3);

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, `hsla(${p.hue},${sat}%,${light}%,${alpha * 1.0})`);
        grad.addColorStop(0.2, `hsla(${p.hue},${sat * 0.95}%,${light * 0.85}%,${alpha * 0.6})`);
        grad.addColorStop(0.5, `hsla(${p.hue},${sat * 0.8}%,${light * 0.5}%,${alpha * 0.2})`);
        grad.addColorStop(1, `hsla(${p.hue},${sat * 0.5}%,${light * 0.2}%,0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      if (particlesRef.current.length > 250) particlesRef.current.splice(0, particlesRef.current.length - 250);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        zIndex: 1, pointerEvents: "none", borderRadius: 16,
      }}
    />
  );
}
