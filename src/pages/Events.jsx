import { useEffect, useState } from 'react';
import { Search, Calendar, Clock, MapPin, Ticket, X } from 'lucide-react';
import Footer from '../components/layout/Footer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Events() {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookedStatus, setBookedStatus] = useState({});

  // Booking details popup states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

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

        if (user) {
          const { data: bookings } = await supabase
            .from('event_bookings')
            .select('event_id')
            .eq('user_id', user.id);

          if (bookings) {
            const status = {};
            bookings.forEach(b => {
              status[b.event_id] = true;
            });
            setBookedStatus(status);
          }
        }
      } catch (err) {
        console.error('Failed to load events from Supabase:', err);
      }
      setLoading(false);
    }
    fetchEvents();
  }, [user]);

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

  function handleOpenBooking(ev) {
    if (!user) {
      alert('Please log in first to book tickets for events!');
      return;
    }
    setSelectedEvent(ev);
    setBookingName(profile?.full_name || '');
    setBookingEmail(user?.email || '');
    setBookingPhone('');
    setBookingMessage('');
    setShowBookingModal(true);
  }

  async function handleConfirmBooking(e) {
    e.preventDefault();
    if (!bookingName || !bookingPhone) {
      setBookingMessage('Please fill in Name and Phone number.');
      return;
    }
    setBookingLoading(true);
    setBookingMessage('');

    try {
      const { error } = await supabase
        .from('event_bookings')
        .insert({
          user_id: user.id,
          event_id: selectedEvent.id,
          full_name: bookingName,
          email: bookingEmail,
          phone: bookingPhone,
        });

      if (error) {
        if (error.code === '23505') {
          setBookingMessage('You have already booked a ticket for this event!');
        } else {
          setBookingMessage(error.message);
        }
      } else {
        setBookedStatus(prev => ({ ...prev, [selectedEvent.id]: true }));
        setBookingMessage('Booking successful! Your ticket has been generated.');
        setTimeout(() => {
          setShowBookingModal(false);
        }, 1800);
      }
    } catch (err) {
      setBookingMessage(err.message);
    }
    setBookingLoading(false);
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
                onClick={() => handleOpenBooking(selectedEvent)}
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

      {showBookingModal && (
        <div className="booking-popup-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="booking-popup-card" onClick={e => e.stopPropagation()}>
            <button className="insta-control-btn" style={{ position: 'absolute', top: 16, right: 16, color: 'rgba(255,255,255,0.5)' }} onClick={() => setShowBookingModal(false)}>
              <X size={20} />
            </button>
            
            <h3 className="font-bungee" style={{ color: 'var(--pink)', marginBottom: 6, fontSize: '1.2rem' }}>EVENT BOOKING</h3>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>
              Book your spot for <strong>{selectedEvent?.title}</strong>. Fill in details to generate your digital ticket.
            </p>

            <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>FULL NAME *</label>
                <input 
                  type="text" 
                  className="settings-input" 
                  style={{ width: '100%', padding: '10px 12px' }}
                  value={bookingName}
                  onChange={e => setBookingName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>EMAIL ADDRESS (READONLY)</label>
                <input 
                  type="email" 
                  className="settings-input" 
                  style={{ width: '100%', padding: '10px 12px', opacity: 0.6 }}
                  value={bookingEmail}
                  readOnly
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>PHONE NUMBER *</label>
                <input 
                  type="tel" 
                  className="settings-input" 
                  style={{ width: '100%', padding: '10px 12px' }}
                  value={bookingPhone}
                  onChange={e => setBookingPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  required
                />
              </div>

              {bookingMessage && (
                <div style={{ 
                  color: bookingMessage.includes('successful') ? '#4CAF50' : '#E8576D', 
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginTop: 4
                }}>
                  {bookingMessage}
                </div>
              )}

              <button 
                type="submit" 
                className="admin-btn admin-btn-pink font-bungee" 
                style={{ width: '100%', marginTop: 8 }}
                disabled={bookingLoading}
              >
                {bookingLoading ? 'CONFIRMING...' : 'CONFIRM BOOKING'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
