import React, { useRef, useEffect } from 'react';

const COLORS = ['#0d9488', '#059669', '#7c3aed', '#ea580c', '#3b82f6']; // Teal, Emerald, Purple, Orange, Blue

class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = (Math.random() - 0.5) * 0.8;
    this.baseRadius = Math.random() * 2 + 1;
    this.radius = this.baseRadius;
    this.isDarkMode = document.documentElement.classList.contains('dark');
    // For light mode use a soft gray dot; for dark mode use a soft bright dot
    this.baseColor = this.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'; 
    this.hoverColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.currentColor = this.baseColor;
    this.targetRadius = this.baseRadius;
  }

  update(mouse) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;

    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 180) {
      // Antigravity repel effect
      const forceDirectionX = dx / distance;
      const forceDirectionY = dy / distance;
      const force = (180 - distance) / 180;
      this.vx -= forceDirectionX * force * 0.4;
      this.vy -= forceDirectionY * force * 0.4;
      
      this.currentColor = this.hoverColor;
      this.targetRadius = this.baseRadius * 3;
    } else {
      this.isDarkMode = document.documentElement.classList.contains('dark');
      this.baseColor = this.isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
      this.currentColor = this.baseColor;
      this.targetRadius = this.baseRadius;
      
      if (Math.abs(this.vx) > 1) this.vx *= 0.95;
      if (Math.abs(this.vy) > 1) this.vy *= 0.95;
    }

    this.radius += (this.targetRadius - this.radius) * 0.1;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.currentColor;
    
    if (this.currentColor !== this.baseColor) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.currentColor;
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    let animationFrameId;
    let mouse = { x: -1000, y: -1000 };

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      const numParticles = Math.min((canvas.width * canvas.height) / 10000, 250); 
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle(canvas));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update(mouse);
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      init();
    };

    init();
    animate();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};

export default InteractiveBackground;
