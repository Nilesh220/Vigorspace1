import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { Check, X } from 'lucide-react';

const ToastContext = createContext(null);

const streakSchedule = [10, 15, 20, 30, 35, 40, 50]; // points per day 1-7

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confettiActive, setConfettiActive] = useState(false);
  const [streakClaim, setStreakClaim] = useState(null); // { dayNum, streakDays, points }
  const { profile } = useAuth() || {};
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

  // Chime synth sound for streak claim
  function playStreakChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const audioCtx = new AudioContext();
      const playNote = (freq, time, dur) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + dur);
      };
      // Arpeggio chime notes
      playNote(523.25, audioCtx.currentTime, 0.15); // C5
      playNote(659.25, audioCtx.currentTime + 0.08, 0.15); // E5
      playNote(783.99, audioCtx.currentTime + 0.16, 0.15); // G5
      playNote(1046.50, audioCtx.currentTime + 0.24, 0.40); // C6
    } catch (e) {
      console.warn(e);
    }
  }

  // 3. Monitor and show Daily Streak Claim modal on first load of the day
  useEffect(() => {
    if (!profile) return;
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const lastShownKey = `streak_modal_shown_${profile.id}`;
    const lastShownDate = localStorage.getItem(lastShownKey);

    if (profile.last_login_date === todayStr && lastShownDate !== todayStr) {
      const cycleDay = ((profile.streak_days - 1) % 7) + 1;
      const pts = streakSchedule[cycleDay - 1] || 10;

      // Render the modal
      setStreakClaim({
        dayNum: cycleDay,
        streakDays: profile.streak_days,
        points: pts
      });

      // Save key so it doesn't pop up again today
      localStorage.setItem(lastShownKey, todayStr);

      // Trigger alerts and sound effects
      playStreakChime();
      setTimeout(() => {
        triggerConfetti();
      }, 300);
    }
  }, [profile]);

  // 4. Canvas Confetti Particle System
  useEffect(() => {
    if (!confettiActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#E8576D', '#F5C842', '#4ECDC4', '#9B59B6', '#3498DB', '#1ABC9C'];
    const particles = [];

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

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();

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

      {/* Daily Streak Claim animation Modal popup */}
      {streakClaim && (
        <div className="booking-popup-overlay" style={{ zIndex: 10000 }}>
          <div className="booking-popup-card" style={{ width: 'min(92vw, 440px)', padding: '28px 24px', textAlign: 'center', border: '2px solid var(--pink)', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)' }}>
            <button 
              className="insta-control-btn" 
              style={{ position: 'absolute', top: 16, right: 16, color: 'rgba(255,255,255,0.4)' }} 
              onClick={() => setStreakClaim(null)}
            >
              <X size={20} />
            </button>

            <h3 className="font-bungee" style={{ color: 'var(--pink)', fontSize: '1.25rem', letterSpacing: '0.5px', marginBottom: 4 }}>
              DAILY STREAK CLAIMED!
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 20 }}>
              Logged in successfully. Day {streakClaim.streakDays} claimed!
            </p>

            {/* Checkmark ticking animation banner */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 20px' }}>
              <div 
                className="streak-circle-success-tick"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'rgba(76, 175, 80, 0.12)',
                  border: '3px solid #4CAF50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                  animation: 'tickPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                <Check size={38} color="#4CAF50" strokeWidth={3.5} />
              </div>
            </div>

            {/* 7 Day track */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, marginBottom: 24, padding: '0 4px' }}>
              {streakSchedule.map((pts, i) => {
                const dayNum = i + 1;
                const isClaimed = dayNum < streakClaim.dayNum;
                const isCurrent = dayNum === streakClaim.dayNum;
                return (
                  <div 
                    key={i} 
                    style={{
                      background: isCurrent ? 'rgba(232, 87, 109, 0.15)' : isClaimed ? 'rgba(76, 175, 80, 0.08)' : 'rgba(255,255,255,0.03)',
                      border: isCurrent ? '1.5px solid var(--pink)' : isClaimed ? '1.5px solid #4CAF50' : '1.5px solid rgba(255,255,255,0.06)',
                      borderRadius: 6,
                      padding: '8px 2px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      boxShadow: 'none'
                    }}
                  >
                    <span style={{ fontSize: '0.55rem', color: isCurrent ? 'var(--pink)' : isClaimed ? '#4CAF50' : 'rgba(255,255,255,0.3)', fontWeight: 700 }}>D{dayNum}</span>
                    <span style={{ fontSize: '0.85rem', margin: '4px 0 2px' }}>{isClaimed ? '✅' : '🪙'}</span>
                    <span style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,0.5)' }}>+{pts}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px 16px', marginBottom: 22, border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ color: 'var(--pink)', fontWeight: 800, fontSize: '1rem', fontFamily: 'Bungee' }}>
                +{streakClaim.points} POINTS EARNED!
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', marginTop: 4 }}>
                Your total balance has been updated successfully.
              </div>
            </div>

            <button 
              className="admin-btn admin-btn-pink font-bungee" 
              style={{ width: '100%', padding: '12px', fontSize: '0.85rem', letterSpacing: 1 }}
              onClick={() => setStreakClaim(null)}
            >
              LET'S GO!
            </button>
          </div>
        </div>
      )}

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
