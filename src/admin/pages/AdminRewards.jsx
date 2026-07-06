import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const empty = { name: '', cost_points: 500, logo_char: '🎁', bg_color: '#111111', text_color: '#ffffff', logo_color: '#F5C842', is_active: true };

export default function AdminRewards() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!supabase) return;
    const { data } = await supabase.from('rewards').select('*').order('cost_points');
    setRewards(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setForm(empty); setModal('create'); }
  function openEdit(r) { setForm(r); setModal(r); }

  async function save() {
    setSaving(true);
    const payload = { name: form.name, cost_points: Number(form.cost_points), logo_char: form.logo_char, bg_color: form.bg_color, text_color: form.text_color, logo_color: form.logo_color, is_active: form.is_active };
    if (modal === 'create') await supabase.from('rewards').insert([payload]);
    else await supabase.from('rewards').update(payload).eq('id', form.id);
    setSaving(false);
    setModal(null);
    load();
  }

  async function deleteReward(id) {
    if (!confirm('Delete this reward?')) return;
    await supabase.from('rewards').delete().eq('id', id);
    load();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title font-bungee">REWARDS</h1>
        <button className="admin-btn admin-btn-pink" onClick={openCreate}><Plus size={16} /> New Reward</button>
      </div>

      <div className="admin-rewards-grid">
        {loading ? <div className="spinner" style={{ margin: '40px auto' }} /> :
          rewards.map(r => (
            <div key={r.id} className="admin-reward-card" style={{ background: r.bg_color }}>
              <div className="admin-reward-logo" style={{ color: r.logo_color, fontSize: '2.5rem' }}>{r.logo_char}</div>
              <div className="admin-reward-name" style={{ color: r.text_color }}>{r.name}</div>
              <div style={{ color: '#F5C842', fontFamily: 'Bungee, cursive', fontSize: '0.9rem', marginTop: 6 }}>{r.cost_points} pts</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' }}>
                <button className="admin-btn admin-btn-sm admin-btn-yellow" onClick={() => openEdit(r)}><Pencil size={13} /></button>
                <button className="admin-btn admin-btn-sm admin-btn-red" onClick={() => deleteReward(r.id)}><Trash2 size={13} /></button>
              </div>
            </div>
          ))
        }
      </div>

      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="font-bungee">{modal === 'create' ? 'NEW REWARD' : 'EDIT REWARD'}</h3>
              <button onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              {[
                { label: 'Name *', key: 'name' },
                { label: 'Cost (points)', key: 'cost_points', type: 'number' },
                { label: 'Logo Emoji/Char', key: 'logo_char' },
                { label: 'Background Color', key: 'bg_color', type: 'color' },
                { label: 'Text Color', key: 'text_color', type: 'color' },
                { label: 'Logo Color', key: 'logo_color', type: 'color' },
              ].map(({ label, key, type = 'text' }) => (
                <div className="admin-form-field" key={key}>
                  <label>{label}</label>
                  <input className="admin-input" type={type} value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn" onClick={() => setModal(null)}>Cancel</button>
              <button className="admin-btn admin-btn-pink" onClick={save} disabled={saving}>
                {saving ? <span className="spinner-sm" /> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
