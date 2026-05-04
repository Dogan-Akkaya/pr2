import { useEffect, useRef } from "react";
import { TL } from "../data/threat-levels";
import { useTheme } from "../context/ThemeContext";

// Parse "#RRGGBB" or "rgb(...)" to [r,g,b]
function parseRGB(color) {
  if (!color) return [12, 16, 33];
  if (color.startsWith("#")) {
    const h = color.slice(1);
    const v = h.length === 3
      ? h.split("").map((c) => parseInt(c + c, 16))
      : [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    return v;
  }
  const m = color.match(/\d+/g);
  return m ? [+m[0], +m[1], +m[2]] : [12, 16, 33];
}

// HSL ranges per threat level for the smoke particles
const THREAT_HSL = {
  critical: { hueMin: 348, hueMax: 358, satMin: 82, satMax: 95, lightMin: 28, lightMax: 40 },
  high:     { hueMin: 15,  hueMax: 28,  satMin: 80, satMax: 92, lightMin: 30, lightMax: 42 },
  medium:   { hueMin: 38,  hueMax: 48,  satMin: 75, satMax: 90, lightMin: 30, lightMax: 42 },
  low:      { hueMin: 140, hueMax: 160, satMin: 60, satMax: 80, lightMin: 25, lightMax: 38 },
};

function rand(a, b) { return Math.random() * (b - a) + a; }
function lerp(a, b, t) { return a + (b - a) * t; }

function noise(x, y, t) {
  return Math.sin(x * 0.007 + t * 0.001) *
    Math.cos(y * 0.009 + t * 0.0012) *
    Math.sin((x + y) * 0.005 + t * 0.0007) +
    Math.sin(x * 0.013 + y * 0.011 + t * 0.0018) * 0.5;
}

export default function ThreatSmokeLayer({ threatLevel = "critical", originY = 200 }) {
  const { t, mode } = useTheme();
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const smokeRef = useRef([]);
  const fogRef = useRef([]);
  const frameRef = useRef(0);
  const waveRef = useRef(0);
  const threatRef = useRef(threatLevel);
  const prevThreatRef = useRef(threatLevel);
  const bgRef = useRef(parseRGB(t.bgBase));

  // Keep bgRef synced with theme so the running animation picks up toggles
  useEffect(() => { bgRef.current = parseRGB(t.bgBase); }, [t.bgBase]);

  // When threat level changes, mark old particles for fast kill
  useEffect(() => {
    if (threatRef.current !== threatLevel) {
      prevThreatRef.current = threatRef.current;
      // Accelerate decay on all existing smoke particles
      smokeRef.current.forEach((p) => {
        p.decay = Math.max(p.decay, 0.008); // fast kill
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
      H = Math.min(r.height, 750);
      c.width = W * dpr;
      c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Arc geometry — upward bow centered on content area
    function getArcPoint(t) {
      const arcCenterX = W * 0.5;
      const arcRadius = W * 0.85;
      const startAngle = -Math.PI * 0.72;
      const endAngle = -Math.PI * 0.28;
      const angle = lerp(startAngle, endAngle, t);
      return {
        x: arcCenterX + Math.cos(angle) * arcRadius,
        y: originY + Math.sin(angle) * arcRadius * 0.35,
      };
    }

    function getArcNormal(t) {
      const startAngle = -Math.PI * 0.72;
      const endAngle = -Math.PI * 0.28;
      const angle = lerp(startAngle, endAngle, t);
      return { nx: Math.cos(angle), ny: Math.sin(angle) };
    }

    // Fog spawner
    function spawnFog() {
      fogRef.current.push({
        x: rand(-200, W + 200), y: rand(0, H),
        vx: rand(0.08, 0.3) * (Math.random() < 0.5 ? 1 : -1),
        vy: rand(-0.03, 0.03),
        size: rand(150, 350), life: 1, decay: rand(0.0004, 0.0012),
        phase: rand(0, Math.PI * 2), baseAlpha: rand(0.04, 0.09),
      });
    }
    // Initial fog
    for (let i = 0; i < 25; i++) spawnFog();

    // Smoke spawner
    function spawnSmoke() {
      waveRef.current += 0.016;
      const wt = waveRef.current;
      const wavePulse = (Math.sin(wt * 1.2) + 1) / 2;
      const wavePulse2 = (Math.sin(wt * 3.1 + 1.7) + 1) / 2;
      const combined = wavePulse * 0.7 + wavePulse2 * 0.3;
      const emitCount = Math.floor(rand(1, 3) + combined * 3);

      const currentThreat = threatRef.current;
      const hsl = THREAT_HSL[currentThreat] || THREAT_HSL.critical;

      for (let i = 0; i < emitCount; i++) {
        const t = rand(0, 1);
        const pos = getArcPoint(t);
        const norm = getArcNormal(t);
        const speed = rand(0.1, 0.5) + combined * 0.3;
        const jA = rand(-0.5, 0.5);
        const cosJ = Math.cos(jA), sinJ = Math.sin(jA);
        const dirX = norm.nx * cosJ - norm.ny * sinJ;
        const dirY = norm.nx * sinJ + norm.ny * cosJ;
        const baseSize = rand(8, 25) + combined * 20;
        const isWild = Math.random() < 0.12;

        smokeRef.current.push({
          x: pos.x + rand(-8, 8), y: pos.y + rand(-5, 5),
          vx: dirX * speed * (isWild ? rand(1.5, 2.5) : 1),
          vy: dirY * speed * (isWild ? rand(1.5, 2.5) : 1),
          size: baseSize * (isWild ? rand(1.3, 2) : 1),
          growRate: rand(0.06, 0.2), life: 1,
          decay: rand(0.0003, 0.0012),
          noiseOffX: rand(0, 1000), noiseOffY: rand(0, 1000),
          drag: 0.998 + Math.random() * 0.0015,
          phase: rand(0, Math.PI * 2),
          hue: rand(hsl.hueMin, hsl.hueMax),
          sat: rand(hsl.satMin, hsl.satMax),
          lightness: rand(hsl.lightMin, hsl.lightMax),
          startAlpha: rand(0.2, 0.5),
          driftX: rand(-0.15, 0.15),
        });
      }

      // Rare burst
      if (Math.random() < 0.007) {
        const burstCount = 3 + Math.floor(Math.random() * 5);
        for (let b = 0; b < burstCount; b++) {
          const t = rand(0.2, 0.8);
          const pos = getArcPoint(t);
          const norm = getArcNormal(t);
          const speed = rand(0.3, 0.8);
          const jA = rand(-0.8, 0.8);
          smokeRef.current.push({
            x: pos.x + rand(-12, 12), y: pos.y + rand(-8, 8),
            vx: (norm.nx * Math.cos(jA) - norm.ny * Math.sin(jA)) * speed,
            vy: (norm.nx * Math.sin(jA) + norm.ny * Math.cos(jA)) * speed,
            size: rand(20, 45), growRate: rand(0.08, 0.25),
            life: 1, decay: rand(0.0004, 0.001),
            noiseOffX: rand(0, 1000), noiseOffY: rand(0, 1000),
            drag: 0.998 + Math.random() * 0.0015,
            phase: rand(0, Math.PI * 2),
            hue: rand(hsl.hueMin, hsl.hueMax),
            sat: rand(hsl.satMin, hsl.satMax),
            lightness: rand(hsl.lightMin, hsl.lightMax),
            startAlpha: rand(0.25, 0.55),
            driftX: rand(-0.2, 0.2),
          });
        }
      }
    }

    // Draw arc glow
    function drawArcGlow(time) {
      const currentThreat = threatRef.current;
      const tl = TL[currentThreat] || TL.critical;
      const col = tl.color;
      ctx.save();
      const pulse = (Math.sin(time * 0.001) + 1) / 2 * 0.15 + 0.85;
      for (let i = 0; i <= 40; i++) {
        const p = getArcPoint(i / 40);
        const glowSize = rand(30, 55) * pulse;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
        grad.addColorStop(0, `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${0.06 * pulse})`);
        grad.addColorStop(1, `rgba(${col[0]}, ${col[1]}, ${col[2]}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Draw arc sparks
    function drawSparks() {
      if (Math.random() < 0.3) {
        const currentThreat = threatRef.current;
        const tl = TL[currentThreat] || TL.critical;
        const col = tl.color;
        const t = rand(0, 1);
        const p = getArcPoint(t);
        const sparkSize = rand(2, 6);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sparkSize);
        grad.addColorStop(0, `rgba(${col[0]}, ${col[1]}, ${col[2]}, 0.9)`);
        grad.addColorStop(1, `rgba(${col[0]}, ${col[1]}, ${col[2]}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, sparkSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initial fill (theme-aware base)
    const [br0, bg0, bb0] = bgRef.current;
    ctx.fillStyle = `rgb(${br0},${bg0},${bb0})`;
    ctx.fillRect(0, 0, W, H);

    const draw = () => {
      frameRef.current++;
      const ft = frameRef.current;

      // Trail rendering — theme-aware: wash with current bgBase
      const [br, bg, bb] = bgRef.current;
      ctx.fillStyle = `rgba(${br},${bg},${bb},0.055)`;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = `rgba(${br},${bg},${bb},0.02)`;
      ctx.fillRect(0, 0, W, H * 0.5);
      if (ft % 90 === 0) { ctx.fillStyle = `rgba(${br},${bg},${bb},0.05)`; ctx.fillRect(0, 0, W, H * 0.4); }
      if (ft % 140 === 0) { ctx.fillStyle = `rgba(${br},${bg},${bb},0.06)`; ctx.fillRect(0, 0, W, H); }

      // Fog
      if (Math.random() < 0.06) spawnFog();
      for (let i = fogRef.current.length - 1; i >= 0; i--) {
        const p = fogRef.current[i];
        p.life -= p.decay;
        if (p.life <= 0) { fogRef.current.splice(i, 1); continue; }
        p.x += p.vx;
        p.y += p.vy + Math.sin(ft * 0.003 + p.phase) * 0.08;
        if (p.x < -p.size) p.x = W + p.size;
        if (p.x > W + p.size) p.x = -p.size;
        const alpha = p.life * p.baseAlpha;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, `rgba(140,145,155,${alpha})`);
        grad.addColorStop(0.4, `rgba(120,125,135,${alpha * 0.5})`);
        grad.addColorStop(1, "rgba(100,105,115,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Arc glow
      drawArcGlow(ft);

      // Smoke
      spawnSmoke();
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = smokeRef.current.length - 1; i >= 0; i--) {
        const p = smokeRef.current[i];
        p.life -= p.decay;
        if (p.life <= 0) { smokeRef.current.splice(i, 1); continue; }
        const nf = noise(p.x * 0.007 + p.noiseOffX, p.y * 0.007 + p.noiseOffY, ft * 0.4);
        p.vx += nf * 0.004;
        p.vy += Math.cos(nf * 3) * 0.002;
        p.vx += p.driftX * 0.01;
        p.vy -= 0.004;
        p.x += p.vx;
        p.y += p.vy;
        p.size += p.growRate;
        p.vx *= p.drag;
        p.vy *= p.drag;
        if (p.y < 60) { p.vy *= 0.97; p.vx *= 0.98; }

        const ageFraction = 1 - p.life;
        let alphaEnvelope;
        if (ageFraction < 0.05) alphaEnvelope = ageFraction / 0.05;
        else alphaEnvelope = p.life;
        const alpha = alphaEnvelope * p.startAlpha;
        const sat = lerp(40, p.sat, p.life);
        const light = lerp(8, p.lightness, p.life);

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, `hsla(${p.hue},${sat}%,${light}%,${alpha * 0.9})`);
        grad.addColorStop(0.25, `hsla(${p.hue},${sat * 0.9}%,${light * 0.75}%,${alpha * 0.55})`);
        grad.addColorStop(0.55, `hsla(${p.hue},${sat * 0.8}%,${light * 0.5}%,${alpha * 0.15})`);
        grad.addColorStop(1, `hsla(${p.hue},${sat * 0.7}%,${light * 0.3}%,0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Sparks
      drawSparks();

      // Budget caps
      if (smokeRef.current.length > 600) smokeRef.current.splice(0, smokeRef.current.length - 600);
      if (fogRef.current.length > 60) fogRef.current.splice(0, fogRef.current.length - 60);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [originY, mode]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 750, zIndex: 1, pointerEvents: "none" }}
    />
  );
}
