import { useState } from 'react';
import { Play, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import Ticker from '../components/layout/Ticker';
import FAQAccordion from '../components/ui/FAQAccordion';
import Footer from '../components/layout/Footer';

// ── Real sticker assets ───────────────────────────────────────
import stickerHeart      from '../assets/Frame.png';
import stickerLightning  from '../assets/Frame (1).png';
import stickerHand       from '../assets/Frame (2).png';
import stickerRocket     from '../assets/Group 68.png';
import stickerSmiley     from '../assets/Group 285.png';
import stickerPizza      from '../assets/Group 169.png';
import stickerMusic      from '../assets/Group 159.png';
import stickerMic        from '../assets/Isolation_Mode.png';
import stickerSparkle    from '../assets/Layer_1.png';

// ── Real gift card / brand assets ────────────────────────────
import logoAmazon        from '../assets/Group 95.png';
import logoMyntra        from '../assets/Group 96.png';
import logoSpotify       from '../assets/Group 97.png';
import logoSwiggy        from '../assets/Group 98.png';
import logoGooglePlay    from '../assets/Group 100.png';
import logoNetflix       from '../assets/Group 101.png';

// ── Real photo assets ─────────────────────────────────────────
import aboutPhoto        from '../assets/Rectangle 8.png';
import feedPost1         from '../assets/Group 214.png';
import feedPost2         from '../assets/Group 215.png';
import feedPost3         from '../assets/Group 216.png';

function BrandCard({ src, alt, size = 140 }) {
  return (
    <div style={{
      width: size,
      height: size,
      flexShrink: 0,
      filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.25))',
    }}>
      <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </div>
  );
}


export default function Home() {
  const [rewardsExpanded, setRewardsExpanded] = useState(false);

  return (
    <div>

      {/* ── SECTION 1: HERO ──────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="sticker sticker-heart sticker-float">
            <img src={stickerHeart} alt="heart" />
          </div>
          <div className="sticker sticker-hand sticker-float-delay">
            <img src={stickerHand} alt="hand" />
          </div>
          <div className="sticker sticker-rocket sticker-float-delay2">
            <img src={stickerRocket} alt="rocket" />
          </div>
          <div className="sticker sticker-lightning sticker-float">
            <img src={stickerLightning} alt="lightning" />
          </div>
          <h1 className="hero-title font-bungee">
            CONNECT<br />EARN<br />THRIVE
          </h1>
        </div>
      </section>

      {/* ── TICKER ───────────────────────────────────────────── */}
      <Ticker />

      {/* ── SECTION 2: ABOUT US ──────────────────────────────── */}
      <section className="section-white about-section-wrap">
        <div className="container about-section">
          <div className="about-content">
            <div className="section-subtitle font-caveat pink-subtitle">SQUAD STORY</div>
            <h2 className="section-title section-title-black font-bungee">ABOUT US</h2>
            <p>
              Vigor Space is a youth-centric community empowering students and influencers alike,
              fostering learning, creativity, and industry readiness while providing a supportive
              platform for creators.
            </p>
          </div>
          <div className="about-image-frame">
            <img src={aboutPhoto} alt="About Us" />
            <div className="play-button-overlay">
              <Play size={24} fill="#fff" color="#fff" />
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: HOW IT WORKS ──────────────────────────── */}
      <section className="section-dark hiw-section">
        <div className="container hiw-inner">
          <div className="hiw-sticker">
            <img src={stickerSmiley} alt="smiley" style={{ width: 80 }} />
          </div>
          <div className="hiw-text-block">
            <div className="section-subtitle font-caveat yellow-subtitle">UNRAVEL THE FUN!</div>
            <h2 className="hiw-title font-bungee">
              HOW IT<br />WORKS<span className="hiw-q font-bungee">?</span>
            </h2>
          </div>
          <div className="hiw-steps">
            <div className="hiw-step">
              <div className="hiw-step-num font-bungee">01</div>
              <div className="hiw-step-text">Sign up &amp; create your profile</div>
            </div>
            <div className="hiw-step">
              <div className="hiw-step-num font-bungee">02</div>
              <div className="hiw-step-text">Complete tasks &amp; earn points daily</div>
            </div>
            <div className="hiw-step">
              <div className="hiw-step-num font-bungee">03</div>
              <div className="hiw-step-text">Redeem points for amazing gift cards</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: UNLOCK REWARDS ────────────────────────── */}
      <section
        className={`section-pink rewards-scattered-section ${rewardsExpanded ? 'expanded' : 'stacked'}`}
        onClick={() => setRewardsExpanded(!rewardsExpanded)}
        style={{ cursor: 'pointer' }}
      >
        {/* Amazon */}
        <div className="rs-card rs-amazon">
          <BrandCard src={logoAmazon} alt="Amazon" size={130} />
        </div>
        {/* Swiggy */}
        <div className="rs-card rs-swiggy">
          <BrandCard src={logoSwiggy} alt="Swiggy" size={130} />
        </div>
        {/* Google Play */}
        <div className="rs-card rs-gplay">
          <BrandCard src={logoGooglePlay} alt="Google Play" size={130} />
        </div>

        {/* Center text */}
        <div className="rs-center">
          <h2 className="rewards-home-title font-bungee">UNLOCK REWARDS</h2>
          <p className="rewards-home-desc">
            Discover a world of possibilities with our diverse range of gift cards.
            Choose from popular brands and indulge in your favorite treats or experiences.
          </p>
        </div>

        {/* Myntra */}
        <div className="rs-card rs-myntra">
          <BrandCard src={logoMyntra} alt="Myntra" size={130} />
        </div>
        {/* Spotify */}
        <div className="rs-card rs-spotify">
          <BrandCard src={logoSpotify} alt="Spotify" size={130} />
        </div>
        {/* Netflix */}
        <div className="rs-card rs-netflix">
          <BrandCard src={logoNetflix} alt="Netflix" size={130} />
        </div>
      </section>


      {/* ── SECTION 5: EVENTS ────────────────────────────────── */}
      <section className="section-off-white events-section">
        <div className="container">
          <div className="events-header">
            {/* Floating stickers */}
            <img src={stickerSmiley} alt="smiley" className="ev-sticker ev-s1" />
            <img src={stickerMusic}  alt="music"  className="ev-sticker ev-s2" />
            <img src={stickerMic}    alt="mic"    className="ev-sticker ev-s3" />
            <img src={stickerSparkle} alt="sparkle" className="ev-sticker ev-s4" />

            <h2 className="events-home-title font-bungee">
              EVENTS
              <img src={stickerPizza} alt="pizza" className="ev-pizza" />
            </h2>
          </div>

          {/* Event cards row */}
          <div className="events-cards-row">
            {[
              { img: feedPost1, title: 'Youth Creators Summit', date: 'Aug 10, 2026', loc: 'Mumbai' },
              { img: feedPost2, title: 'Night of Talent', date: 'Aug 22, 2026', loc: 'Pune' },
              { img: feedPost3, title: 'Community Connect', date: 'Sep 5, 2026', loc: 'Delhi' },
            ].map((ev, i) => (
              <div key={i} className="event-card">
                <img src={ev.img} alt={ev.title} className="event-card-img" />
                <div className="event-card-body">
                  <div className="event-card-title">{ev.title}</div>
                  <div className="event-card-meta">{ev.date} · {ev.loc}</div>
                  <button className="btn-know-more" style={{ marginTop: 10, fontSize: '0.7rem' }}>KNOW MORE</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: STORIES ───────────────────────────────── */}
      <section className="section-dark stories-section">
        <div className="container">
          <h2 className="stories-title font-bungee">STORIES</h2>
          <p className="stories-desc">
            Discover inspiring tales of triumph. From navigating career confusion to overcoming mental
            health challenges, watch young individuals share their journeys to resilience and growth.
          </p>
          <div className="stories-grid">
            {[
              { title: 'Overcoming career confusion',                           name: 'Avi Parihar',    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop' },
              { title: 'Tips for Self-Care and Well-Being',                    name: 'Aradhya Warang', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=400&fit=crop' },
              { title: 'Strategies for Career Clarity',                        name: 'Karan Rawool',   img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop' },
              { title: 'Mind Matters: Prioritizing Mental Health in a Busy World', name: 'Palash Shah', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop' },
            ].map((story, i) => (
              <div key={i} className="story-card">
                <img src={story.img} alt={story.title} />
                <div className="story-card-overlay">
                  <div className="story-play-btn">
                    <Play size={18} fill="#fff" color="#fff" />
                  </div>
                  <div className="story-card-title">{story.title}</div>
                  <div className="story-card-author">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${story.name}`} alt={story.name} />
                    <span>{story.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-explore-more" style={{ marginTop: 20 }}>EXPLORE MORE</button>
        </div>
      </section>

      {/* ── SECTION 7: JOIN COMMUNITY ────────────────────────── */}
      <section className="section-dark community-section">
        <div className="community-circle" />
        <div className="container community-content">
          <div className="community-text">
            <div className="section-subtitle font-caveat yellow-subtitle">THE SOCIAL SPOT</div>
            <h2 className="section-title section-title-white font-bungee">JOIN OUR COMMUNITY</h2>
            <p>
              Welcome to our dynamic community hub — a space where collaboration, creativity,
              and growth converge. Join us in fostering connections, nurturing talent, and
              empowering each member to thrive.
            </p>
            <button className="btn-channel">JOIN THE CHANNEL</button>
          </div>
          <div className="whatsapp-preview">
            <div className="whatsapp-play-btn">
              <Play size={20} fill="#075E54" color="#075E54" />
            </div>
            <div className="whatsapp-header">
              <svg viewBox="0 0 30 30" width="32" height="32">
                <circle cx="15" cy="15" r="15" fill="#075E54"/>
                <text x="5" y="20" fontFamily="Bungee" fontSize="8" fill="#F5C842">VS</text>
              </svg>
              <span>Vigor Space</span>
            </div>
            <div className="whatsapp-body">
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#075E54', marginBottom: 4 }}>Vigor Space</div>
              <div className="whatsapp-msg">
                Hi there 👋<br />
                We're thrilled to have you in our exclusive community, where you'll be
                the first to know about exciting updates, special promotions, and
                important announcements.
                <div className="whatsapp-time">17:32</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: #FEED ─────────────────────────────────── */}
      <section className="section-pink feed-section">
        <div className="container">
          <h2 className="feed-title">
            <span className="hash font-caveat">#</span>
            <span className="font-bungee" style={{ color: '#1a1a1a' }}>FEED</span>
          </h2>
          <div className="feed-grid">
            {[feedPost1, feedPost2, feedPost3].map((img, i) => (
              <div key={i} className="feed-card">
                <img className="feed-card-image" src={img} alt={`Feed post ${i + 1}`} />
                <div className="feed-card-actions">
                  <div className="feed-card-actions-left">
                    <Heart className="liked" size={18} />
                    <MessageCircle size={18} />
                    <Send size={18} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MoreHorizontal size={18} style={{ color: 'rgba(255,255,255,0.7)' }} />
                    <Bookmark size={18} style={{ color: 'rgba(255,255,255,0.7)' }} />
                  </div>
                </div>
                <div className="feed-carousel-dots" style={{ paddingBottom: 12 }}>
                  <div className="feed-dot active"></div>
                  <div className="feed-dot"></div>
                  <div className="feed-dot"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 9: LISTENING SESSION ─────────────────────── */}
      <section className="section-dark listening-section">
        <div className="container">
          <div className="section-subtitle font-caveat yellow-subtitle">SPEAK OUT LOUD</div>
          <h2 className="section-title section-title-pink font-bungee">LISTENING SESSION</h2>
          <p>
            Discover transformative conversations in our Listening Sessions, where diverse
            voices explore life's complexities. Engage in discussions on career confusion,
            mental health, and personal growth.
          </p>
          <button className="btn-register">REGISTER NOW</button>
        </div>
      </section>

      {/* ── SECTION 10: OUR ALLIES ───────────────────────────── */}
      <section className="section-dark allies-section">
        <h2 className="allies-title font-bungee">OUR ALLIES</h2>
        <div className="allies-track-container">
          <div className="allies-track allies-track-1">
            {[logoAmazon, logoMyntra, logoNetflix, logoSpotify, logoSwiggy, logoGooglePlay,
              logoAmazon, logoMyntra, logoNetflix, logoSpotify, logoSwiggy, logoGooglePlay].map((src, i) => (
              <div key={i} className="ally-card">
                <img src={src} alt="ally" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 10 }} />
              </div>
            ))}
          </div>
          <div className="allies-track allies-track-2">
            {[logoGooglePlay, logoSwiggy, logoSpotify, logoNetflix, logoMyntra, logoAmazon,
              logoGooglePlay, logoSwiggy, logoSpotify, logoNetflix, logoMyntra, logoAmazon].map((src, i) => (
              <div key={i} className="ally-card">
                <img src={src} alt="ally" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 10 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 11: INFO HUB ─────────────────────────────── */}
      <section className="section-white" style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-subtitle font-caveat pink-subtitle">WHAT THE FAQ</div>
            <h2 className="section-title section-title-black font-bungee" style={{ color: '#1a1a1a' }}>INFO HUB</h2>
          </div>
          <FAQAccordion />
        </div>
      </section>

      <Footer />
    </div>
  );
}
