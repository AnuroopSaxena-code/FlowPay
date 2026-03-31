import React, { useRef, useEffect } from 'react';

const PARTICLE_COLORS = ['#2dd4bf', '#34d399', '#818cf8', '#a78bfa', '#38bdf8'];

class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    this.x  = Math.random() * this.canvas.width;
    this.y  = Math.random() * this.canvas.height;
    this.vx = (Math.random() - 0.5) * 0.7;
    this.vy = (Math.random() - 0.5) * 0.7;
    this.baseRadius = Math.random() * 1.8 + 0.8;
    this.radius     = this.baseRadius;
    this.targetRadius = this.baseRadius;
    this.isDark     = document.documentElement.classList.contains('dark');
    this.baseAlpha  = this.isDark ? 0.18 : 0.12;
    this.baseColor  = this.isDark
      ? `rgba(255,255,255,${this.baseAlpha})`
      : `rgba(15,23,42,${this.baseAlpha})`;
    this.accentColor = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
    this.currentColor = this.baseColor;
    this.glowing = false;
  }

  update(mouse) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > this.canvas.width)  this.vx *= -1;
    if (this.y < 0 || this.y > this.canvas.height)  this.vy *= -1;

    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const RADIUS = 200;

    if (dist < RADIUS) {
      const force = (RADIUS - dist) / RADIUS;
      const dirX  = dx / dist;
      const dirY  = dy / dist;
      this.vx -= dirX * force * 0.45;
      this.vy -= dirY * force * 0.45;
      this.currentColor = this.accentColor;
      this.targetRadius = this.baseRadius * 3.5;
      this.glowing = true;
    } else {
      this.isDark = document.documentElement.classList.contains('dark');
      this.baseColor = this.isDark
        ? 'rgba(255,255,255,0.18)'
        : 'rgba(15,23,42,0.12)';
      this.currentColor = this.baseColor;
      this.targetRadius = this.baseRadius;
      this.glowing = false;
      if (Math.abs(this.vx) > 1) this.vx *= 0.95;
      if (Math.abs(this.vy) > 1) this.vy *= 0.95;
    }

    this.radius += (this.targetRadius - this.radius) * 0.1;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.currentColor;

    if (this.glowing) {
      ctx.shadowBlur = 18;
      ctx.shadowColor = this.accentColor;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

const InteractiveBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    let animId;
    let mouse = { x: -2000, y: -2000 };

    const init = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      const count = prefersReducedMotion ? 0 : Math.min((canvas.width * canvas.height) / 9000, 220);
      for (let i = 0; i < count; i++) particles.push(new Particle(canvas));
    };

    const drawConnections = () => {
      const maxDist = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.12;
            const isDark = document.documentElement.classList.contains('dark');
            ctx.strokeStyle = isDark
              ? `rgba(255,255,255,${alpha})`
              : `rgba(15,23,42,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!prefersReducedMotion) {
        drawConnections();
        particles.forEach(p => { p.update(mouse); p.draw(ctx); });
      }
      animId = requestAnimationFrame(animate);
    };

    const onMouseMove  = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onMouseLeave = ()  => { mouse.x = -2000; mouse.y = -2000; };
    const onResize     = ()  => init();

    init();
    animate();

    window.addEventListener('resize',    onResize);
    window.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('resize',    onResize);
      window.removeEventListener('mousemove', onMouseMove);
      document.body.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* Canvas particle layer */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Teal orb — top left */}
        <div
          className="orb orb-1"
          style={{
            width: '600px', height: '600px',
            top: '-150px', left: '-100px',
            background: 'radial-gradient(circle, rgba(20,184,166,0.22) 0%, rgba(16,185,129,0.1) 50%, transparent 70%)',
          }}
        />
        {/* Violet orb — bottom right */}
        <div
          className="orb orb-2"
          style={{
            width: '700px', height: '700px',
            bottom: '-200px', right: '-150px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(99,102,241,0.08) 50%, transparent 70%)',
          }}
        />
        {/* Indigo orb — center */}
        <div
          className="orb orb-3"
          style={{
            width: '450px', height: '450px',
            top: '40%', left: '45%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)',
          }}
        />
      </div>
    </>
  );
};

export default InteractiveBackground;
