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

function ScratchCard() {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="earn-card">
      <div
        className="scratch-card"
        onClick={() => setRevealed(true)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        {revealed ? (
          <span className="scratch-card-text font-bungee" style={{ color: '#F5C842' }}>
            🎉 +25 BONUS PTS!
          </span>
        ) : (
          <span className="scratch-card-text font-bungee">SCRATCH TO REVEAL!</span>
        )}
      </div>
    </div>
  );
}

export default function Earn() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
            <ScratchCard />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
