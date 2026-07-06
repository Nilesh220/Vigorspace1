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
