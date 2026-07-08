import { createContext, useContext, useState, useEffect, useRef } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confettiActive, setConfettiActive] = useState(false);
  const canvasRef = useRef(null);

  // 1. Show Toast Function
  function showToast(message, type = 'success') {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }

  // 2. Trigger Confetti Function
  function triggerConfetti() {
    setConfettiActive(true);
    setTimeout(() => {
      setConfettiActive(false);
    }, 4000);
  }

  // 3. Canvas Confetti Particle System
  useEffect(() => {
    if (!confettiActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize canvas to cover viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#E8576D', '#F5C842', '#4ECDC4', '#9B59B6', '#3498DB', '#1ABC9C'];
    const particles = [];

    // Create particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height - 20,
        r: Math.random() * 6 + 4,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0,
        speed: Math.random() * 3 + 2,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += p.speed;
        p.x += Math.sin(p.tiltAngle) * 0.5;

        // Draw particle
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();

        // Reset particle if it drifts off screen
        if (p.y > canvas.height) {
          particles[idx] = {
            ...p,
            x: Math.random() * canvas.width,
            y: -20,
            tilt: Math.random() * 10 - 5,
            speed: Math.random() * 3 + 2,
          };
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [confettiActive]);

  return (
    <ToastContext.Provider value={{ showToast, triggerConfetti }}>
      {children}

      {/* Floating Toasts container */}
      <div className="toasts-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-alert toast-${t.type}`}>
            <span className="toast-bullet">•</span>
            <span className="toast-msg">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Canvas Confetti overlay */}
      {confettiActive && (
        <canvas
          ref={canvasRef}
          className="confetti-canvas"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        />
      )}
    </ToastContext.Provider>
  );
}
