import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const STATUS_COLORS = { pending: '#F5C842', approved: '#4CAF50', rejected: '#E8576D' };

export default function AdminSubmissions() {
  const [subs, setSubs] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!supabase) return;
    setLoading(true);
    let q = supabase
      .from('task_submissions')
      .select('id, status, proof_url, proof_link, submitted_at, profiles(full_name), tasks(title, points)')
      .order('submitted_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    setSubs(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function updateStatus(id, status) {
    await supabase.from('task_submissions').update({ status, reviewed_at: new Date().toISOString() }).eq('id', id);
    load();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title font-bungee">SUBMISSIONS</h1>
        <div className="admin-filter-tabs">
          {['pending', 'approved', 'rejected', 'all'].map(f => (
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
        {loading ? <div className="spinner" style={{ margin: '40px auto' }} /> : subs.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '40px 0' }}>No submissions found.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>User</th><th>Task</th><th>Points</th><th>Proof</th><th>Submitted</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.profiles?.full_name || '—'}</td>
                  <td style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{s.tasks?.title || '—'}</td>
                  <td><span style={{ color: '#F5C842', fontWeight: 700 }}>{s.tasks?.points ?? '—'}</span></td>
                  <td>
                    {s.proof_link && (
                      <a href={s.proof_link} target="_blank" rel="noreferrer" style={{ color: '#4A90D9', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                        <ExternalLink size={13} /> View
                      </a>
                    )}
                    {s.proof_url && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>File uploaded</span>}
                    {!s.proof_link && !s.proof_url && <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>}
                  </td>
                  <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>
                    {new Date(s.submitted_at).toLocaleDateString()}
                  </td>
                  <td>
                    <span className="admin-badge-pill" style={{ background: STATUS_COLORS[s.status] + '22', color: STATUS_COLORS[s.status] }}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    {s.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="admin-btn admin-btn-sm admin-btn-green" onClick={() => updateStatus(s.id, 'approved')}>
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button className="admin-btn admin-btn-sm admin-btn-red" onClick={() => updateStatus(s.id, 'rejected')}>
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    )}
                    {s.status !== 'pending' && (
                      <button className="admin-btn admin-btn-sm" onClick={() => updateStatus(s.id, 'pending')}>
                        Reset
                      </button>
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
