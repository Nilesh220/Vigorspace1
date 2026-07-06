import { useState, useEffect } from 'react';
import { Search, Shield, Coins } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editPoints, setEditPoints] = useState('');

  async function load() {
    if (!supabase) return;
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, total_points, referral_code, role, streak_days, created_at')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleRole(user) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);
    load();
  }

  async function savePoints() {
    const pts = parseInt(editPoints);
    if (isNaN(pts)) return;
    await supabase.from('profiles').update({ total_points: pts }).eq('id', editingUser.id);
    setEditingUser(null);
    load();
  }

  const filtered = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.referral_code || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title font-bungee">USERS</h1>
        <div className="admin-search-bar">
          <Search size={16} />
          <input placeholder="Search by name or referral code..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="admin-card">
        {loading ? <div className="spinner" style={{ margin: '40px auto' }} /> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Points</th>
                <th>Streak</th>
                <th>Referral Code</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>{u.full_name || '—'}</td>
                  <td>
                    {editingUser?.id === u.id ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          className="admin-inline-input"
                          type="number"
                          value={editPoints}
                          onChange={e => setEditPoints(e.target.value)}
                          style={{ width: 70 }}
                        />
                        <button className="admin-btn admin-btn-sm admin-btn-green" onClick={savePoints}>✓</button>
                        <button className="admin-btn admin-btn-sm" onClick={() => setEditingUser(null)}>✕</button>
                      </div>
                    ) : (
                      <span style={{ color: '#F5C842', fontWeight: 700 }}>{u.total_points}</span>
                    )}
                  </td>
                  <td>{u.streak_days}🔥</td>
                  <td><code style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>{u.referral_code}</code></td>
                  <td>
                    <span className="admin-badge-pill" style={{
                      background: u.role === 'admin' ? '#E8576D22' : '#ffffff11',
                      color: u.role === 'admin' ? '#E8576D' : 'rgba(255,255,255,0.5)'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="admin-btn admin-btn-sm"
                        title="Toggle Admin"
                        onClick={() => toggleRole(u)}
                      >
                        <Shield size={13} /> {u.role === 'admin' ? 'Demote' : 'Promote'}
                      </button>
                      <button
                        className="admin-btn admin-btn-sm admin-btn-yellow"
                        title="Edit Points"
                        onClick={() => { setEditingUser(u); setEditPoints(u.total_points); }}
                      >
                        <Coins size={13} /> Points
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
