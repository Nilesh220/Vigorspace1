import { useState, useEffect } from 'react';
import { Mail, MailOpen, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminMessages() {
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  async function load() {
    if (!supabase) return;
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    setMsgs(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function markRead(id, is_read) {
    await supabase.from('contact_messages').update({ is_read }).eq('id', id);
    load();
  }

  async function deleteMsg(id) {
    if (!confirm('Delete this message?')) return;
    await supabase.from('contact_messages').delete().eq('id', id);
    if (selected?.id === id) setSelected(null);
    load();
  }

  async function openMsg(msg) {
    setSelected(msg);
    if (!msg.is_read) await markRead(msg.id, true);
  }

  return (
    <div className="admin-page">
      <h1 className="admin-page-title font-bungee">CONTACT MESSAGES</h1>
      <div className="admin-messages-layout">
        {/* List */}
        <div className="admin-msg-list admin-card">
          {loading ? <div className="spinner" style={{ margin: '40px auto' }} /> :
            msgs.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '40px 20px' }}>No messages yet.</p>
            ) :
            msgs.map(m => (
              <div
                key={m.id}
                className={`admin-msg-item ${selected?.id === m.id ? 'selected' : ''} ${!m.is_read ? 'unread' : ''}`}
                onClick={() => openMsg(m)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {m.is_read ? <MailOpen size={15} color="rgba(255,255,255,0.4)" /> : <Mail size={15} color="#F5C842" />}
                  <span style={{ fontWeight: m.is_read ? 400 : 700 }}>{m.name}</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', marginTop: 4, marginLeft: 23 }}>
                  {m.message.slice(0, 50)}…
                </div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', marginTop: 4, marginLeft: 23 }}>
                  {new Date(m.created_at).toLocaleString()}
                </div>
              </div>
            ))
          }
        </div>

        {/* Detail */}
        <div className="admin-msg-detail admin-card">
          {!selected ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', paddingTop: 60 }}>
              <Mail size={48} style={{ margin: '0 auto 16px' }} />
              <p>Select a message to read</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selected.name}</h2>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginTop: 4 }}>
                    {selected.email} {selected.phone && `· ${selected.phone}`}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: 2 }}>
                    {new Date(selected.created_at).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="admin-btn admin-btn-sm" onClick={() => markRead(selected.id, !selected.is_read)}>
                    {selected.is_read ? 'Mark Unread' : 'Mark Read'}
                  </button>
                  <button className="admin-btn admin-btn-sm admin-btn-red" onClick={() => deleteMsg(selected.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selected.message}</p>
              <a href={`mailto:${selected.email}`} className="admin-btn admin-btn-pink" style={{ display: 'inline-flex', marginTop: 24, textDecoration: 'none' }}>
                Reply via Email
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
