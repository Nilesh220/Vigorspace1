import { useEffect, useState } from 'react';
import { Search, Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import Footer from '../components/layout/Footer';
import { supabase } from '../lib/supabase';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookedStatus, setBookedStatus] = useState({});

  useEffect(() => {
    async function fetchEvents() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('is_active', true)
          .order('event_date', { ascending: true });

        if (!error) {
          setEvents(data || []);
          if (data && data.length > 0) {
            setSelectedEvent(data[0]); // default select the first event as featured
          }
        }
      } catch (err) {
        console.error('Failed to load events from Supabase:', err);
      }
      setLoading(false);
    }
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(ev =>
    ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function getEventDateParts(dateStr) {
    const d = new Date(dateStr);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: months[d.getMonth()],
      fullDate: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  function handleBook(eventId) {
    setBookedStatus(prev => ({ ...prev, [eventId]: true }));
  }

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  const featured = selectedEvent || events[0];

  return (
    <div>
      {/* Hero */}
      <div className="events-page-hero">
        <h1 className="events-page-title font-bungee">EVENTS</h1>
        <hr className="dashed-separator dashed-separator-pink" style={{ marginBottom: 30 }} />

        <div className="search-bar">
          <Search />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {featured ? (
          /* Featured Event */
          <div className="featured-event" onClick={() => setSelectedEvent(featured)}>
            <div className="featured-event-images">
              <div className="img-stack">
                <img src={featured.image_url || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop'} alt={featured.title} style={{ zIndex: 1, opacity: 0.4 }} />
                <img src={featured.image_url || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop'} alt={featured.title} style={{ zIndex: 2, opacity: 0.7 }} />
                <img src={featured.image_url || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop'} alt={featured.title} style={{ zIndex: 3 }} />
              </div>
            </div>
            <div className="featured-event-info">
              <div className="featured-event-date">
                {getEventDateParts(featured.event_date).day}<br />
                {getEventDateParts(featured.event_date).month}
              </div>
              <div className="featured-event-name">{featured.title}</div>
              <p className="featured-event-desc">{featured.description || 'No description provided.'}</p>
              <button className="btn-know-more">KNOW MORE</button>
            </div>
          </div>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '40px 0' }}>No active events found.</p>
        )}
      </div>

      {/* Event Detail Modal Area (when selected) */}
      {selectedEvent && (
        <div className="section-dark" style={{ padding: '40px 20px' }}>
          <div className="featured-event" style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="featured-event-images">
              <div className="img-stack">
                <img src={selectedEvent.image_url || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop'} alt={selectedEvent.title} />
              </div>
            </div>
            <div className="featured-event-info">
              <div className="featured-event-name font-bungee" style={{ fontSize: '1.4rem', color: '#fff' }}>{selectedEvent.title}</div>
              <div className="event-meta" style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="event-meta-item" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>
                  <Calendar size={16} color="var(--pink)" />
                  <span>{getEventDateParts(selectedEvent.event_date).fullDate}</span>
                </div>
                <div className="event-meta-item" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>
                  <Clock size={16} color="var(--pink)" />
                  <span>{getEventDateParts(selectedEvent.event_date).time}</span>
                </div>
                <div className="event-meta-item" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>
                  <MapPin size={16} color="var(--pink)" />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>
              <p className="featured-event-desc" style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>
                {selectedEvent.description || 'No description provided.'}
              </p>
              <button 
                className="btn-book font-bungee" 
                onClick={() => handleBook(selectedEvent.id)}
                disabled={bookedStatus[selectedEvent.id]}
                style={{
                  padding: '12px 36px',
                  borderRadius: 30,
                  border: 'none',
                  backgroundColor: bookedStatus[selectedEvent.id] ? '#4CAF50' : 'var(--yellow)',
                  color: bookedStatus[selectedEvent.id] ? '#fff' : 'var(--dark)',
                  cursor: bookedStatus[selectedEvent.id] ? 'default' : 'pointer',
                  fontWeight: 800,
                }}
              >
                {bookedStatus[selectedEvent.id] ? '✓ BOOKED' : 'BOOK SPOT'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* More Events */}
      {filteredEvents.length > 0 && (
        <div className="section-dark more-events" style={{ borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
          <h2 className="more-events-title font-bungee">CHECK OUT MORE EVENTS</h2>
          <div className="events-grid">
            {filteredEvents.map(event => (
              <div key={event.id} className="event-card" onClick={() => setSelectedEvent(event)}>
                <img className="event-card-image" src={event.image_url || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop'} alt={event.title} />
                <div className="event-card-body">
                  <div className="event-card-date">
                    {getEventDateParts(event.event_date).day}<br />
                    {getEventDateParts(event.event_date).month}
                  </div>
                  <div className="event-card-name font-bungee">{event.title}</div>
                  <p className="event-card-desc">{event.description || 'No description provided.'}</p>
                  <button className="btn-know-more font-bungee">KNOW MORE</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
