import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Search, Calendar, Users } from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [bookingsRes, eventsRes] = await Promise.all([
        supabase
          .from('event_bookings')
          .select('*, events(title, event_date)')
          .order('created_at', { ascending: false }),
        supabase
          .from('events')
          .select('id, title')
          .order('title', { ascending: true })
      ]);

      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (eventsRes.data) setEvents(eventsRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to cancel and delete this booking?')) return;
    const { error } = await supabase
      .from('event_bookings')
      .delete()
      .eq('id', id);

    if (!error) {
      setBookings(prev => prev.filter(b => b.id !== id));
    }
  }

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEvent = selectedEventId === 'all' || b.event_id === selectedEventId;

    return matchesSearch && matchesEvent;
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title font-bungee">EVENT BOOKINGS</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Track attendee details and manage reservations for squad events.</p>
        </div>
      </div>

      {/* Control bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="search-bar" style={{ maxWidth: '100%' }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search attendee by name, email, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="settings-input"
          style={{ background: '#0c0c1b', color: '#fff', padding: '10px 14px' }}
          value={selectedEventId}
          onChange={e => setSelectedEventId(e.target.value)}
        >
          <option value="all">All Events</option>
          {events.map(ev => (
            <option key={ev.id} value={ev.id}>{ev.title}</option>
          ))}
        </select>
      </div>

      {/* Bookings Statistics summary block */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px' }}>
          <div style={{ background: 'rgba(232,87,109,0.1)', padding: 12, borderRadius: 12 }}>
            <Users size={24} color="var(--pink)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Total Bookings</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{filteredBookings.length}</div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div className="spinner" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '40px 0' }}>No bookings match the filters.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Attendee</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Event Booked</th>
                <th>Booked At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 700, color: '#fff' }}>{b.full_name}</td>
                  <td>{b.email}</td>
                  <td>{b.phone}</td>
                  <td style={{ fontWeight: 600, color: 'var(--yellow)' }}>{b.events?.title || '—'}</td>
                  <td style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                    {new Date(b.created_at).toLocaleString()}
                  </td>
                  <td>
                    <button 
                      onClick={() => handleDelete(b.id)} 
                      style={{ background: 'none', border: 'none', color: '#E8576D', cursor: 'pointer' }}
                      title="Cancel Booking"
                    >
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
