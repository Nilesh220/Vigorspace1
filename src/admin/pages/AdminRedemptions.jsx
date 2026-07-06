import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const STATUS_COLORS = { pending: '#F5C842', fulfilled: '#4CAF50', cancelled: '#E8576D' };

export default function AdminRedemptions() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!supabase) return;
    setLoading(true);
    let q = supabase
      .from('redemptions')
      .select('id, points_spent, status, created_at, profiles(full_name), rewards(name, logo_char)')
      .order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function updateStatus(id, status) {
    await supabase.from('redemptions').update({ status }).eq('id', id);
    load();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title font-bungee">REDEMPTIONS</h1>
        <div className="admin-filter-tabs">
          {['pending', 'fulfilled', 'cancelled', 'all'].map(f => (
            <button
              key={f}
              className={`admin-filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
              style={filter === f ? { borderColor: STATUS_COLORS[f] || '#fff', color: STATUS_COLORS[f] || '#fff' } : {}}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card">
        {loading ? <div className="spinner" style={{ margin: '40px auto' }} /> : items.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '40px 0' }}>No redemptions found.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>User</th><th>Reward</th><th>Points Spent</th><th>Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.profiles?.full_name || '—'}</td>
                  <td>
                    <span style={{ fontSize: '1.2rem', marginRight: 6 }}>{r.rewards?.logo_char}</span>
                    {r.rewards?.name || '—'}
                  </td>
                  <td><span style={{ color: '#E8576D', fontWeight: 700 }}>-{r.points_spent} pts</span></td>
                  <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <span className="admin-badge-pill" style={{ background: STATUS_COLORS[r.status] + '22', color: STATUS_COLORS[r.status] }}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="admin-btn admin-btn-sm admin-btn-green" onClick={() => updateStatus(r.id, 'fulfilled')}>
                          <CheckCircle size={13} /> Fulfil
                        </button>
                        <button className="admin-btn admin-btn-sm admin-btn-red" onClick={() => updateStatus(r.id, 'cancelled')}>
                          <XCircle size={13} /> Cancel
                        </button>
                      </div>
                    )}
                    {r.status !== 'pending' && (
                      <button className="admin-btn admin-btn-sm" onClick={() => updateStatus(r.id, 'pending')}>Reset</button>
                    )}
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
