import { useEffect, useRef } from 'react';

/**
 * Lightweight, dependency-free canvas sparkle field.
 * Mimics the look of Aceternity's SparklesCore without tsparticles.
 *
 * Props:
 *  - minSize / maxSize: particle radius range (px)
 *  - particleDensity: particles per 10,000 px^2 (clamped for performance)
 *  - speed: drift/twinkle multiplier
 *  - particleColor: any CSS color (optional; otherwise inherits `color` from CSS)
 *  - className / style: forwarded to the <canvas>
 */
export default function Sparkles({
  minSize = 0.5,
  maxSize = 1.4,
  particleDensity = 22,
  speed = 1,
  particleColor,
  className = '',
  style,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rand = (min, max) => Math.random() * (max - min) + min;

    let width = 0;
    let height = 0;
    let particles = [];
    let raf = 0;
    let running = true;

    const resolveColor = () => {
      const c = getComputedStyle(canvas).color;
      return c && c !== 'rgba(0, 0, 0, 0)' ? c : '#ffffff';
    };
    let color = resolveColor();

    const makeParticle = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: rand(minSize, maxSize),
      baseAlpha: rand(0.25, 1),
      twinkle: rand(0.006, 0.022) * speed,
      phase: Math.random() * Math.PI * 2,
      vx: rand(-0.05, 0.05) * speed,
      vy: rand(-0.05, 0.05) * speed,
    });

    const build = () => {
      const area = width * height;
      const count = Math.max(0, Math.min(400, Math.round((area / 10000) * particleDensity)));
      particles = Array.from({ length: count }, makeParticle);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      color = resolveColor();
      build();
    };

    const renderStatic = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      for (const p of particles) {
        ctx.globalAlpha = p.baseAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      for (const p of particles) {
        p.phase += p.twinkle;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;
        const alpha = p.baseAlpha * (0.5 + 0.5 * Math.sin(p.phase));
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (running) raf = requestAnimationFrame(draw);
    };

    resize();
    if (prefersReduced) {
      renderStatic();
    } else {
      raf = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [minSize, maxSize, particleDensity, speed, particleColor]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={particleColor ? { color: particleColor, ...style } : style}
    />
  );
}
