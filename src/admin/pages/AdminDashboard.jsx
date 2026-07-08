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
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabase) return;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      const sevenDaysAgoISO = sevenDaysAgo.toISOString();

      const [
        { count: totalUsers },
        { count: pending },
        { count: totalRedeem },
        { data: users },
        { data: subs },
        { data: dailySignups },
        { data: dailyBookings },
        { data: dailyPoints },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('task_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('redemptions').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('full_name, email, total_points, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('task_submissions').select('id, status, submitted_at, profiles(full_name), tasks(title)').order('submitted_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('created_at').gte('created_at', sevenDaysAgoISO),
        supabase.from('event_bookings').select('created_at').gte('created_at', sevenDaysAgoISO),
        supabase.from('point_transactions').select('created_at, delta').gt('delta', 0).gte('created_at', sevenDaysAgoISO),
      ]);

      // Construct last 7 days array locally
      const daysArray = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const dateVal = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${dateVal}`;
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        daysArray.push({ dateStr, dayLabel, signups: 0, bookings: 0, points: 0 });
      }

      // Aggregate live signups
      (dailySignups || []).forEach(item => {
        if (!item.created_at) return;
        const dateStr = item.created_at.split('T')[0];
        const dayObj = daysArray.find(x => x.dateStr === dateStr);
        if (dayObj) dayObj.signups++;
      });

      // Aggregate live bookings
      (dailyBookings || []).forEach(item => {
        if (!item.created_at) return;
        const dateStr = item.created_at.split('T')[0];
        const dayObj = daysArray.find(x => x.dateStr === dateStr);
        if (dayObj) dayObj.bookings++;
      });

      // Aggregate points transactions
      (dailyPoints || []).forEach(item => {
        if (!item.created_at) return;
        const dateStr = item.created_at.split('T')[0];
        const dayObj = daysArray.find(x => x.dateStr === dateStr);
        if (dayObj) dayObj.points += item.delta;
      });

      setStats({ totalUsers, pending, totalRedeem });
      setRecentUsers(users || []);
      setRecentSubs(subs || []);
      setChartData(daysArray);
      setLoading(false);
    }
    load();
  }, []);

  const getPointsPath = (type) => {
    if (!chartData || chartData.length === 0) return '';
    return chartData.map((d, i) => {
      let val = 0;
      if (type === 'signups') val = d.signups * 10;
      else if (type === 'bookings') val = d.bookings * 10;
      else if (type === 'points') val = d.points / 10;
      
      const x = 70 + i * 80;
      const y = 170 - (Math.min(100, val) / 100) * 150;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const getAreaPath = (type) => {
    const line = getPointsPath(type);
    if (!line) return '';
    return `${line} L 550 170 L 70 170 Z`;
  };

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
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Points Awarded (Scaled ÷10)</span>
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

            {/* X-axis days (Dynamic weekdays) */}
            {chartData.map((d, i) => (
              <text key={i} x={70 + i * 80} y="195" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle">{d.dayLabel}</text>
            ))}

            {chartData.length > 0 && (
              <>
                {/* Signups Paths */}
                <path d={getPointsPath('signups')} fill="none" stroke="#4A90D9" strokeWidth="3.5" />
                <path d={getAreaPath('signups')} fill="url(#blueGrad)" />

                {/* Bookings Paths */}
                <path d={getPointsPath('bookings')} fill="none" stroke="#E8576D" strokeWidth="3.5" />
                <path d={getAreaPath('bookings')} fill="url(#pinkGrad)" />

                {/* Points Path */}
                <path d={getPointsPath('points')} fill="none" stroke="#F5C842" strokeWidth="2.5" strokeDasharray="4 2" />

                {/* Data point markers */}
                {chartData.map((d, i) => {
                  const x = 70 + i * 80;
                  const yS = 170 - (Math.min(100, d.signups * 10) / 100) * 150;
                  const yB = 170 - (Math.min(100, d.bookings * 10) / 100) * 150;
                  const yP = 170 - (Math.min(100, d.points / 10) / 100) * 150;
                  return (
                    <g key={i}>
                      <circle cx={x} cy={yS} r="4.5" fill="#4A90D9" stroke="#fff" strokeWidth="1.5" title={`Signups: ${d.signups}`} />
                      <circle cx={x} cy={yB} r="4.5" fill="#E8576D" stroke="#fff" strokeWidth="1.5" title={`Bookings: ${d.bookings}`} />
                      <circle cx={x} cy={yP} r="3.5" fill="#F5C842" stroke="#fff" strokeWidth="1.5" title={`Points: ${d.points}`} />
                    </g>
                  );
                })}
              </>
            )}
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
