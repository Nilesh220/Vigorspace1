import { useState, useEffect } from 'react';
import { Users, CheckSquare, Star, ShoppingBag, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon" style={{ background: color + '22', color }}>
        <Icon size={22} />
      </div>
      <div>
        <div className="admin-stat-value font-bungee">{value ?? '—'}</div>
        <div className="admin-stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentSubs, setRecentSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const [
        { count: totalUsers },
        { count: pending },
        { count: totalRedeem },
        { data: users },
        { data: subs },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('task_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('redemptions').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('full_name, email, total_points, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('task_submissions').select('id, status, submitted_at, profiles(full_name), tasks(title)').order('submitted_at', { ascending: false }).limit(5),
      ]);
      setStats({ totalUsers, pending, totalRedeem });
      setRecentUsers(users || []);
      setRecentSubs(subs || []);
      setLoading(false);
    }
    load();
  }, []);

  const statusBadge = (s) => {
    const colors = { pending: '#F5C842', approved: '#4CAF50', rejected: '#E8576D' };
    return <span className="admin-badge-pill" style={{ background: colors[s] + '22', color: colors[s] }}>{s}</span>;
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title font-bungee">DASHBOARD</h1>

      <div className="admin-stats-grid">
        <StatCard icon={Users}       label="Total Users"         value={stats.totalUsers}  color="#4A90D9" />
        <StatCard icon={Clock}       label="Pending Submissions" value={stats.pending}     color="#F5C842" />
        <StatCard icon={ShoppingBag} label="Redemptions"        value={stats.totalRedeem} color="#E8576D" />
        <StatCard icon={TrendingUp}  label="Active"              value="Live"              color="#4CAF50" />
      </div>

      {/* SVG Analytics Line Chart */}
      <div className="admin-card" style={{ marginBottom: 24, padding: '24px' }}>
        <h2 className="admin-card-title font-bungee" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <TrendingUp size={18} color="var(--yellow)" /> WEEKLY ACTIVITY TRENDS
        </h2>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 20, fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#4A90D9', display: 'inline-block' }} />
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Signups (Scaled x10)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#E8576D', display: 'inline-block' }} />
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Event Bookings (Scaled x10)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#F5C842', display: 'inline-block' }} />
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Points Awarded (x100)</span>
          </div>
        </div>

        {/* Responsive Chart Wrapper */}
        <div style={{ width: '100%', overflowX: 'auto', background: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: '16px' }}>
          <svg viewBox="0 0 600 220" width="100%" height="220" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4A90D9" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#4A90D9" stopOpacity="0"/>
              </linearGradient>
              <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8576D" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#E8576D" stopOpacity="0"/>
              </linearGradient>
              <linearGradient id="yellowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F5C842" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#F5C842" stopOpacity="0"/>
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="40" y1="20" x2="580" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3" />
            <line x1="40" y1="70" x2="580" y2="70" stroke="rgba(255,255,255,0.06)" strokeDasharray="3" />
            <line x1="40" y1="120" x2="580" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="3" />
            <line x1="40" y1="170" x2="580" y2="170" stroke="rgba(255,255,255,0.06)" strokeDasharray="3" />
            
            {/* Axis Labels */}
            <text x="15" y="24" fill="rgba(255,255,255,0.3)" fontSize="9">100</text>
            <text x="15" y="74" fill="rgba(255,255,255,0.3)" fontSize="9">60</text>
            <text x="15" y="124" fill="rgba(255,255,255,0.3)" fontSize="9">30</text>
            <text x="15" y="174" fill="rgba(255,255,255,0.3)" fontSize="9">0</text>

            {/* X-axis days (Mon to Sun) */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <text key={day} x={70 + i * 80} y="195" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle">{day}</text>
            ))}

            {/* Chart Lines (Signups: [20,35,45,30,65,85,55], Bookings: [10,25,30,15,48,70,40], Points: [15,22,35,28,50,68,48]) */}
            {/* Signups Path */}
            <path
              d="M 70 160 Q 150 137.5 150 135 T 230 120 T 310 142.5 T 390 90 T 470 60 T 550 105"
              fill="none"
              stroke="#4A90D9"
              strokeWidth="3.5"
            />
            <path
              d="M 70 160 Q 150 137.5 150 135 T 230 120 T 310 142.5 T 390 90 T 470 60 T 550 105 L 550 170 L 70 170 Z"
              fill="url(#blueGrad)"
            />

            {/* Bookings Path */}
            <path
              d="M 70 170 Q 150 152.5 150 150 T 230 142.5 T 310 165 T 390 115 T 470 82.5 T 550 127.5"
              fill="none"
              stroke="#E8576D"
              strokeWidth="3.5"
            />
            <path
              d="M 70 170 Q 150 152.5 150 150 T 230 142.5 T 310 165 T 390 115 T 470 82.5 T 550 127.5 L 550 170 L 70 170 Z"
              fill="url(#pinkGrad)"
            />

            {/* Points Path */}
            <path
              d="M 70 162.5 Q 150 157.5 150 151 T 230 135 T 310 145 T 390 112.5 T 470 85 T 550 115"
              fill="none"
              stroke="#F5C842"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />

            {/* Hover Circles */}
            <circle cx="470" cy="60" r="5" fill="#4A90D9" stroke="#fff" strokeWidth="1.5" />
            <circle cx="470" cy="82.5" r="5" fill="#E8576D" stroke="#fff" strokeWidth="1.5" />
            <circle cx="470" cy="85" r="4" fill="#F5C842" stroke="#fff" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      <div className="admin-two-col">
        {/* Recent Users */}
        <div className="admin-card">
          <h2 className="admin-card-title font-bungee">RECENT SIGNUPS</h2>
          {loading ? <div className="spinner" style={{ margin: '20px auto' }} /> : (
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Points</th><th>Joined</th></tr></thead>
              <tbody>
                {recentUsers.map((u, i) => (
                  <tr key={i}>
                    <td>{u.full_name || '—'}</td>
                    <td><span style={{ color: '#F5C842', fontWeight: 700 }}>{u.total_points}</span></td>
                    <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Submissions */}
        <div className="admin-card">
          <h2 className="admin-card-title font-bungee">RECENT SUBMISSIONS</h2>
          {loading ? <div className="spinner" style={{ margin: '20px auto' }} /> : (
            <table className="admin-table">
              <thead><tr><th>User</th><th>Task</th><th>Status</th></tr></thead>
              <tbody>
                {recentSubs.map((s, i) => (
                  <tr key={i}>
                    <td>{s.profiles?.full_name || '—'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{s.tasks?.title || '—'}</td>
                    <td>{statusBadge(s.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
