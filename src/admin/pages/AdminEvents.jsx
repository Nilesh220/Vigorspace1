import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // New Event Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });
    if (!err) setEvents(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!title || !location || !eventDate) {
      setError('Please fill in all required fields.');
      return;
    }

    const { error: insertErr } = await supabase
      .from('events')
      .insert({
        title,
        description,
        location,
        event_date: new Date(eventDate).toISOString(),
        image_url: imageUrl || null,
      });

    if (insertErr) {
      setError(insertErr.message);
    } else {
      setSuccess(true);
      setTitle('');
      setDescription('');
      setLocation('');
      setEventDate('');
      setImageUrl('');
      setAdding(false);
      fetchEvents();
    }
  }

  async function toggleActive(id, currentActive) {
    const { error: err } = await supabase
      .from('events')
      .update({ is_active: !currentActive })
      .eq('id', id);
    if (!err) fetchEvents();
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    const { error: err } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    if (!err) fetchEvents();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title font-bungee">MANAGE EVENTS</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Create, active state toggle, and delete squad events.</p>
        </div>
        <button className="admin-btn admin-btn-pink" onClick={() => setAdding(!adding)}>
          <Plus size={16} /> {adding ? 'CANCEL' : 'ADD NEW EVENT'}
        </button>
      </div>

      {adding && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3 className="admin-card-title font-bungee">Create Event</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.75rem', fontWeight: 600 }}>EVENT TITLE *</label>
                <input
                  type="text"
                  className="settings-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Creator Meetup"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.75rem', fontWeight: 600 }}>LOCATION / CITY *</label>
                <input
                  type="text"
                  className="settings-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Mumbai"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.75rem', fontWeight: 600 }}>DATE &amp; TIME *</label>
                <input
                  type="datetime-local"
                  className="settings-input"
                  style={{ width: '100%' }}
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  required
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

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.75rem', fontWeight: 600 }}>DESCRIPTION</label>
              <textarea
                className="settings-input"
                style={{ width: '100%', minHeight: 80, resize: 'vertical' }}
                placeholder="Details about the event, timeline, etc."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {error && <div style={{ color: '#E8576D', fontSize: '0.85rem' }}>{error}</div>}
            {success && <div style={{ color: '#4CAF50', fontSize: '0.85rem' }}>Event created successfully!</div>}

            <button type="submit" className="admin-btn admin-btn-pink" style={{ alignSelf: 'flex-start' }}>
              CREATE EVENT
            </button>
          </form>
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div className="spinner" />
          </div>
        ) : events.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '40px 0' }}>No events registered yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Location</th>
                <th>Event Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id}>
                  <td>
                    {ev.image_url ? (
                      <img src={ev.image_url} alt="" style={{ width: 50, height: 35, borderRadius: 4, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 50, height: 35, borderRadius: 4, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>📅</div>
                    )}
                  </td>
                  <td style={{ fontWeight: 700 }}>{ev.title}</td>
                  <td>{ev.location}</td>
                  <td>{new Date(ev.event_date).toLocaleString()}</td>
                  <td>
                    <button
                      onClick={() => toggleActive(ev.id, ev.is_active)}
                      className={`admin-badge-pill ${ev.is_active ? 'approved' : 'pending'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {ev.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(ev.id)} style={{ background: 'none', border: 'none', color: '#E8576D', cursor: 'pointer' }}>
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
