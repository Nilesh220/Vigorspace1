import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

function TaskCard({ task, onKnowMore }) {
  return (
    <div className="earn-card">
      <div style={{ position: 'relative' }}>
        {task.image_url ? (
          <img
            className="earn-card-image"
            src={task.image_url}
            alt={task.title}
            style={{ width: '100%' }}
          />
        ) : (
          <div className="earn-card-image" style={{
            background: 'linear-gradient(135deg, #E8576D, #D14A5E)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 160,
          }}>
            <span style={{ fontSize: '3rem' }}>🎯</span>
          </div>
        )}
        {task.badge_label && (
          <span
            className="earn-card-badge"
            style={{ background: task.badge_color || '#E8576D' }}
          >
            {task.badge_label}
          </span>
        )}
      </div>
      <div className="earn-card-body">
        <div className="earn-card-title font-bungee">{task.title}</div>
        <div className="earn-card-meta">
          <span className="earn-card-points">Points: {task.points}</span>
          <button
            className="btn-know-more"
            style={{ color: '#fff' }}
            onClick={() => onKnowMore(task.id)}
          >
            KNOW MORE
          </button>
        </div>
      </div>
    </div>
  );
}

import { useRef } from 'react';
import { useToast } from '../context/ToastContext';

function ScratchCard({ user, profile, refetchProfile }) {
  const canvasRef = useRef(null);
  const { showToast, triggerConfetti } = useToast();
  const [revealed, setRevealed] = useState(false);
  const [prizePts, setPrizePts] = useState(null);
  const [loading, setLoading] = useState(false);
  const isDrawing = useRef(false);

  // Check if user has already scratched today
  useEffect(() => {
    async function checkScratchHistory() {
      if (!user) return;
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('point_transactions')
          .select('delta')
          .eq('user_id', user.id)
          .eq('reason', 'scratch_win')
          .gte('created_at', todayStr + 'T00:00:00')
          .lte('created_at', todayStr + 'T23:59:59')
          .maybeSingle();

        if (data) {
          setRevealed(true);
          setPrizePts(data.delta);
        }
      } catch (err) {
        console.error('Error checking scratch history:', err);
      }
    }
    checkScratchHistory();
  }, [user]);

  // Initialize Canvas
  useEffect(() => {
    if (revealed || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 300;
    const h = canvas.height = 160;

    // Draw grey textured cover
    ctx.fillStyle = '#555555';
    ctx.fillRect(0, 0, w, h);

    // Draw metallic dots
    ctx.fillStyle = '#666666';
    for (let i = 0; i < 200; i++) {
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    ctx.fillStyle = '#F5C842';
    for (let i = 0; i < 25; i++) {
      ctx.fillRect(Math.random() * w, Math.random() * h, 3, 3);
    }

    // Write text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 14px "Bungee", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SWIPE TO SCRATCH!', w / 2, h / 2);
  }, [revealed]);

  // Synthesis double chime sound
  function playSuccessSound() {
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
      playNote(523.25, audioCtx.currentTime, 0.15); // C5
      playNote(659.25, audioCtx.currentTime + 0.1, 0.3); // E5
    } catch (e) {
      console.warn('Web Audio API not supported/active: ', e);
    }
  }

  async function handleAwardPoints(awardedPoints) {
    if (!user || loading) return;
    setLoading(true);
    try {
      // 1. Insert point transaction (we insert even 0-point outcomes so they cannot scratch again)
      const { error: txnErr } = await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          delta: awardedPoints,
          reason: 'scratch_win',
        });

      if (!txnErr) {
        if (awardedPoints > 0) {
          const currentPoints = profile?.total_points || 0;
          
          // 2. Update user profile totals
          await supabase
            .from('profiles')
            .update({ total_points: currentPoints + awardedPoints })
            .eq('id', user.id);

          if (refetchProfile) await refetchProfile();
          
          playSuccessSound();
          triggerConfetti();
          showToast(`🎉 Scratch Card Success! +${awardedPoints} Points added.`, 'success');
        } else {
          showToast('🍀 Better luck next time! Try again tomorrow.', 'error');
        }
      } else {
        showToast(txnErr.message, 'error');
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  // Draw clear path
  function getCoordinates(e) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function handleDrawStart(e) {
    if (!user) {
      showToast('Please log in first to scratch cards!', 'error');
      return;
    }

    // Determine the prize points when scratch begins
    if (prizePts === null) {
      const rand = Math.random();
      const points = rand < 0.4 ? 0 : Math.floor(Math.random() * 5) + 1; // 40% fail, 60% win (1 to 5)
      setPrizePts(points);
    }

    isDrawing.current = true;
    handleDraw(e);
  }

  function handleDraw(e) {
    if (!isDrawing.current || !canvasRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();

    checkPercentCleared();
  }

  function handleDrawEnd() {
    isDrawing.current = false;
  }

  function checkPercentCleared() {
    if (revealed || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    let transparent = 0;

    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) transparent++;
    }

    const percent = transparent / (canvas.width * canvas.height);
    if (percent > 0.48) {
      setRevealed(true);
      const points = prizePts !== null ? prizePts : 0;
      handleAwardPoints(points);
    }
  }

  return (
    <div className="earn-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        className="scratch-card-canvas-container" 
        style={{
          position: 'relative',
          width: 300,
          height: 160,
          background: '#0c0c1b',
          borderRadius: 12,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Hidden prize text */}
        <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
          {prizePts > 0 ? (
            <>
              <div className="font-bungee" style={{ color: '#F5C842', fontSize: '1.25rem', marginBottom: 4 }}>🎉 +{prizePts} POINTS!</div>
              <div style={{ color: '#fff', fontSize: '0.75rem', opacity: 0.8 }}>BONUS CREDITED</div>
            </>
          ) : (
            <>
              <div className="font-bungee" style={{ color: '#E8576D', fontSize: '1.15rem', marginBottom: 4 }}>🍀 BETTER LUCK</div>
              <div style={{ color: '#fff', fontSize: '0.75rem', opacity: 0.8 }}>TRY AGAIN TOMORROW!</div>
            </>
          )}
        </div>

        {/* Canvas overlay */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              cursor: 'crosshair',
              touchAction: 'none'
            }}
            onMouseDown={handleDrawStart}
            onMouseMove={handleDraw}
            onMouseUp={handleDrawEnd}
            onMouseLeave={handleDrawEnd}
            onTouchStart={handleDrawStart}
            onTouchMove={handleDraw}
            onTouchEnd={handleDrawEnd}
          />
        )}
      </div>
    </div>
  );
}

export default function Earn() {
  const navigate = useNavigate();
  const { user, profile, refetchProfile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTasks() {
      const { data, error: err } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (err) {
        setError('Failed to load tasks. Please try again.');
      } else {
        setTasks(data || []);
      }
      setLoading(false);
    }
    fetchTasks();
  }, []);

  return (
    <div>
      <div className="earn-page-hero">
        <h1 className="earn-page-title font-bungee">EARN</h1>

        <hr className="dashed-separator dashed-separator-pink" style={{ marginBottom: 40 }} />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner" />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#E8576D', padding: '40px 0' }}>
            {error}
          </div>
        ) : (
          <div className="earn-cards-grid">
            {tasks.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.5)',
                padding: '60px 0',
              }}>
                <p style={{ fontSize: '1.5rem', fontFamily: 'Bungee' }}>NO TASKS YET</p>
                <p style={{ marginTop: 8, fontSize: '0.9rem' }}>Check back soon for new earning opportunities!</p>
              </div>
            ) : (
              tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onKnowMore={id => navigate(`/task/${id}`)}
                />
              ))
            )}

            {/* Scratch card always shown */}
            <ScratchCard user={user} profile={profile} refetchProfile={refetchProfile} />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
