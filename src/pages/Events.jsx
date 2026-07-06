import { useState } from 'react';
import { Search, Calendar, Clock, MapPin } from 'lucide-react';
import Footer from '../components/layout/Footer';

const eventsData = [
  {
    id: 1,
    date: '08',
    month: 'MAY',
    fullDate: 'May 8, 2024',
    time: '22:00-04:00',
    location: 'Abcd Club, Andheri West',
    title: 'EDM NIGHT WITH LOST STORIES AT NIT MUMBAI',
    desc: 'Lorem ipsum dolor sit amet consectetur iodit id proin elit id adipiscing augue. Eget ultrices elit consectetur sed bibendum sit elit.',
    img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop',
  },
  {
    id: 2,
    date: '08',
    month: 'MAY',
    title: 'EDM NIGHT WITH LOST STORIES AT NIT MUMBAI',
    desc: 'Lorem ipsum dolor sit amet consmnjetur iodit id proin elit id adipiscing augue...',
    img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop',
  },
];

export default function Events() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const featured = eventsData[0];

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

        {/* Featured Event */}
        <div className="featured-event" onClick={() => setSelectedEvent(featured)}>
          <div className="featured-event-images">
            <div className="img-stack">
              <img src={featured.img} alt={featured.title} style={{ zIndex: 1, opacity: 0.4 }} />
              <img src={featured.img} alt={featured.title} style={{ zIndex: 2, opacity: 0.7 }} />
              <img src={featured.img} alt={featured.title} style={{ zIndex: 3 }} />
            </div>
          </div>
          <div className="featured-event-info">
            <div className="featured-event-date">{featured.date}<br/>{featured.month}</div>
            <div className="featured-event-name">{featured.title}</div>
            <p className="featured-event-desc">{featured.desc}</p>
            <button className="btn-know-more">KNOW MORE</button>
          </div>
        </div>
      </div>

      {/* Event Detail (when selected) */}
      {selectedEvent && (
        <div className="section-dark" style={{ padding: '60px' }}>
          <div className="featured-event" style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="featured-event-images">
              <div className="img-stack">
                <img src={selectedEvent.img} alt={selectedEvent.title} />
              </div>
            </div>
            <div className="featured-event-info">
              <div className="featured-event-name">{selectedEvent.title}</div>
              <div className="event-meta">
                <div className="event-meta-item">
                  <Calendar size={16} />
                  <span>{selectedEvent.fullDate}</span>
                </div>
                <div className="event-meta-item">
                  <Clock size={16} />
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="event-meta-item">
                  <MapPin size={16} />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>
              <p className="featured-event-desc">
                Lorem ipsum dolor sit amet consectetur. Tortor blandit id proin elit id
                adipiscing augue. Eget ultrices elit consectetur sed bibendum sit elit.
              </p>
              <button className="btn-book">BOOK</button>
            </div>
          </div>
        </div>
      )}

      {/* More Events */}
      <div className="section-dark more-events">
        <h2 className="more-events-title font-bungee">CHECK OUT MORE EVENTS</h2>
        <div className="events-grid">
          {eventsData.map((event, i) => (
            <div key={i} className="event-card" onClick={() => setSelectedEvent(event)}>
              <img className="event-card-image" src={event.img} alt={event.title} />
              <div className="event-card-body">
                <div className="event-card-date">{event.date}<br/>{event.month}</div>
                <div className="event-card-name">{event.title}</div>
                <p className="event-card-desc">{event.desc}</p>
                <button className="btn-know-more">KNOW MORE</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
