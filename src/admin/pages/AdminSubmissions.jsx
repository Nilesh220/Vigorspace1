import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ExternalLink, Eye, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const STATUS_COLORS = { pending: '#F5C842', approved: '#4CAF50', rejected: '#E8576D' };

export default function AdminSubmissions() {
  const [subs, setSubs] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [previewProof, setPreviewProof] = useState(null);

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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {s.proof_link && (
                        <button 
                          onClick={() => setPreviewProof({ type: 'link', content: s.proof_link })}
                          className="admin-btn admin-btn-sm" 
                          style={{ background: 'rgba(78, 144, 217, 0.1)', color: '#4A90D9', border: '1px solid rgba(78, 144, 217, 0.2)', fontSize: '0.75rem', padding: '4px 8px' }}
                        >
                          <Eye size={12} style={{ marginRight: 4 }} /> Preview Link
                        </button>
                      )}
                      {s.proof_url && (
                        <button 
                          onClick={() => setPreviewProof({ type: 'image', content: s.proof_url })}
                          className="admin-btn admin-btn-sm" 
                          style={{ background: 'rgba(245, 200, 66, 0.1)', color: '#F5C842', border: '1px solid rgba(245, 200, 66, 0.2)', fontSize: '0.75rem', padding: '4px 8px' }}
                        >
                          <Eye size={12} style={{ marginRight: 4 }} /> View Image
                        </button>
                      )}
                      {!s.proof_link && !s.proof_url && <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>}
                    </div>
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

      {/* Proof Previewer Modal */}
      {previewProof && (
        <div className="booking-popup-overlay" onClick={() => setPreviewProof(null)}>
          <div className="booking-popup-card" style={{ width: 'min(90vw, 650px)', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <button 
              className="insta-control-btn" 
              style={{ position: 'absolute', top: 16, right: 16, color: 'rgba(255,255,255,0.6)' }} 
              onClick={() => setPreviewProof(null)}
            >
              <X size={22} />
            </button>

            <h3 className="font-bungee" style={{ color: 'var(--yellow)', fontSize: '1.2rem', marginBottom: 16 }}>
              SUBMISSION PROOF PREVIEW
            </h3>

            <div style={{ background: '#0a0a14', borderRadius: 8, padding: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              {previewProof.type === 'image' ? (
                <img 
                  src={previewProof.content} 
                  alt="Proof Screenshot" 
                  style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: 6 }} 
                />
              ) : (
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', wordBreak: 'break-all', marginBottom: 20 }}>
                    {previewProof.content}
                  </p>
                  <a 
                    href={previewProof.content} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="admin-btn admin-btn-pink font-bungee" 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', textDecoration: 'none' }}
                  >
                    <ExternalLink size={14} /> OPEN LINK IN NEW TAB
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
