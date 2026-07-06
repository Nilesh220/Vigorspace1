import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const empty = { title: '', description: '', points: 100, badge_label: '', badge_color: '#E8576D', image_url: '', is_active: true };

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | task object
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!supabase) return;
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    setTasks(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setForm(empty); setModal('create'); }
  function openEdit(task) { setForm(task); setModal(task); }

  async function save() {
    setSaving(true);
    if (modal === 'create') {
      await supabase.from('tasks').insert([{
        title: form.title, description: form.description,
        points: Number(form.points), badge_label: form.badge_label,
        badge_color: form.badge_color, image_url: form.image_url, is_active: form.is_active
      }]);
    } else {
      await supabase.from('tasks').update({
        title: form.title, description: form.description,
        points: Number(form.points), badge_label: form.badge_label,
        badge_color: form.badge_color, image_url: form.image_url, is_active: form.is_active
      }).eq('id', form.id);
    }
    setSaving(false);
    setModal(null);
    load();
  }

  async function toggleActive(task) {
    await supabase.from('tasks').update({ is_active: !task.is_active }).eq('id', task.id);
    load();
  }

  async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    await supabase.from('tasks').delete().eq('id', id);
    load();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title font-bungee">TASKS</h1>
        <button className="admin-btn admin-btn-pink" onClick={openCreate}>
          <Plus size={16} /> New Task
        </button>
      </div>

      <div className="admin-card">
        {loading ? <div className="spinner" style={{ margin: '40px auto' }} /> : (
          <table className="admin-table">
            <thead>
              <tr><th>Title</th><th>Points</th><th>Badge</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.76rem', marginTop: 2 }}>{t.description?.slice(0, 60)}...</div>
                  </td>
                  <td><span style={{ color: '#F5C842', fontWeight: 700 }}>{t.points} pts</span></td>
                  <td>
                    {t.badge_label && (
                      <span className="admin-badge-pill" style={{ background: t.badge_color + '22', color: t.badge_color }}>
                        {t.badge_label}
                      </span>
                    )}
                  </td>
                  <td>
                    <button className="admin-toggle" onClick={() => toggleActive(t)}>
                      {t.is_active
                        ? <ToggleRight size={24} color="#4CAF50" />
                        : <ToggleLeft size={24} color="rgba(255,255,255,0.3)" />}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="admin-btn admin-btn-sm admin-btn-yellow" onClick={() => openEdit(t)}><Pencil size={13} /> Edit</button>
                      <button className="admin-btn admin-btn-sm admin-btn-red" onClick={() => deleteTask(t.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="font-bungee">{modal === 'create' ? 'NEW TASK' : 'EDIT TASK'}</h3>
              <button onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              {[
                { label: 'Title *', key: 'title', type: 'text' },
                { label: 'Description', key: 'description', type: 'textarea' },
                { label: 'Points', key: 'points', type: 'number' },
                { label: 'Image URL', key: 'image_url', type: 'text' },
                { label: 'Badge Label (e.g. NEW ★)', key: 'badge_label', type: 'text' },
              ].map(({ label, key, type }) => (
                <div className="admin-form-field" key={key}>
                  <label>{label}</label>
                  {type === 'textarea'
                    ? <textarea className="admin-input" rows={3} value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                    : <input className="admin-input" type={type} value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                  }
                </div>
              ))}
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn" onClick={() => setModal(null)}>Cancel</button>
              <button className="admin-btn admin-btn-pink" onClick={save} disabled={saving}>
                {saving ? <span className="spinner-sm" /> : 'Save Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
