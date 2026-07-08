import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Tv } from 'lucide-react';

export default function AdminStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // New Story Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Career Guidance');
  const [author, setAuthor] = useState('');
  const [duration, setDuration] = useState('5:00');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = ['Career Guidance', 'Mental Health', 'Professional Development', 'Life Lessons'];

  useEffect(() => {
    fetchStories();
  }, []);

  async function fetchStories() {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false });
    if (!err) setStories(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!title || !author) {
      setError('Please fill in all required fields.');
      return;
    }

    const { error: insertErr } = await supabase
      .from('stories')
      .insert({
        title,
        category,
        author,
        duration,
        image_url: imageUrl || null,
      });

    if (insertErr) {
      setError(insertErr.message);
    } else {
      setSuccess(true);
      setTitle('');
      setAuthor('');
      setDuration('5:00');
      setImageUrl('');
      setAdding(false);
      fetchStories();
    }
  }

  async function toggleActive(id, currentActive) {
    const { error: err } = await supabase
      .from('stories')
      .update({ is_active: !currentActive })
      .eq('id', id);
    if (!err) fetchStories();
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this story?')) return;
    const { error: err } = await supabase
      .from('stories')
      .delete()
      .eq('id', id);
    if (!err) fetchStories();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title font-bungee">MANAGE STORIES</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Create, active state toggle, and delete squad stories.</p>
        </div>
        <button className="admin-btn admin-btn-pink" onClick={() => setAdding(!adding)}>
          <Plus size={16} /> {adding ? 'CANCEL' : 'ADD NEW STORY'}
        </button>
      </div>

      {adding && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3 className="admin-card-title font-bungee">Create Story</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.75rem', fontWeight: 600 }}>STORY TITLE *</label>
                <input
                  type="text"
                  className="settings-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Overcoming Job Anxiety"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.75rem', fontWeight: 600 }}>AUTHOR *</label>
                <input
                  type="text"
                  className="settings-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Rohini Sharma"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.75rem', fontWeight: 600 }}>CATEGORY *</label>
                <select
                  className="settings-input"
                  style={{ width: '100%', background: '#0a0a14', color: '#fff' }}
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.75rem', fontWeight: 600 }}>DURATION</label>
                <input
                  type="text"
                  className="settings-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. 5:12"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.75rem', fontWeight: 600 }}>IMAGE URL (OPTIONAL)</label>
                <input
                  type="text"
                  className="settings-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. https://unsplash.com/..."
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                />
              </div>
            </div>

            {error && <div style={{ color: '#E8576D', fontSize: '0.85rem' }}>{error}</div>}
            {success && <div style={{ color: '#4CAF50', fontSize: '0.85rem' }}>Story created successfully!</div>}

            <button type="submit" className="admin-btn admin-btn-pink" style={{ alignSelf: 'flex-start' }}>
              CREATE STORY
            </button>
          </form>
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div className="spinner" />
          </div>
        ) : stories.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '40px 0' }}>No stories registered yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stories.map(st => (
                <tr key={st.id}>
                  <td>
                    {st.image_url ? (
                      <img src={st.image_url} alt="" style={{ width: 50, height: 35, borderRadius: 4, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 50, height: 35, borderRadius: 4, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>🎥</div>
                    )}
                  </td>
                  <td style={{ fontWeight: 700 }}>{st.title}</td>
                  <td>{st.category}</td>
                  <td>{st.author}</td>
                  <td>{st.duration}</td>
                  <td>
                    <button
                      onClick={() => toggleActive(st.id, st.is_active)}
                      className={`admin-badge-pill ${st.is_active ? 'approved' : 'pending'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {st.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(st.id)} style={{ background: 'none', border: 'none', color: '#E8576D', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
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
