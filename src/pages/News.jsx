import { Calendar, Tag, ArrowRight, User } from 'lucide-react';
import Footer from '../components/layout/Footer';

const ARTICLES = [
  {
    id: 1,
    title: 'Introducing Vigor Points: Earn Rewards Daily!',
    excerpt: 'We are thrilled to launch Vigor Points. Complete creative tasks, refer your squad, and cash out with premium brand vouchers.',
    category: 'Squad Update',
    date: 'July 5, 2026',
    author: 'Vigor Team',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=300&fit=crop',
  },
  {
    id: 2,
    title: 'Youth Creators Summit 2026 Registrations Open',
    excerpt: 'Connect with industry mentors, collaborate with other creative minds, and learn strategies to accelerate your design journey.',
    category: 'Events',
    date: 'June 28, 2026',
    author: 'Event Coordinator',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=300&fit=crop',
  },
  {
    id: 3,
    title: 'Top 5 Tips to Navigate Career Confusion in College',
    excerpt: 'Feeling lost about your future career path? Here is a simple, battle-tested blueprint to finding clarity and industry readiness.',
    category: 'Mentorship',
    date: 'June 22, 2026',
    author: 'Ravi Verma (Mentor)',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=300&fit=crop',
  },
];

export default function News() {
  return (
    <div className="news-page-container">
      {/* Header */}
      <div className="news-header-section">
        <span className="news-badge font-caveat">LATEST UPDATES</span>
        <h1 className="news-main-title font-bungee">SQUAD NEWS</h1>
        <p className="news-subtitle">
          Stay updated with Vigor Space happenings, brand opportunities, skill hacks, and community developments.
        </p>
      </div>

      {/* Main Articles List */}
      <div className="container" style={{ paddingBottom: 80 }}>
        <div className="news-grid">
          {ARTICLES.map(article => (
            <article key={article.id} className="news-card">
              <div className="news-card-img-wrapper">
                <img src={article.image} alt={article.title} />
                <span className="news-card-category">{article.category}</span>
              </div>

              <div className="news-card-content">
                <div className="news-card-meta">
                  <div className="news-meta-item">
                    <Calendar size={13} />
                    <span>{article.date}</span>
                  </div>
                  <div className="news-meta-item">
                    <User size={13} />
                    <span>{article.author}</span>
                  </div>
                </div>

                <h3 className="news-card-title font-bungee">{article.title}</h3>
                <p className="news-card-excerpt">{article.excerpt}</p>

                <button className="news-card-btn font-bungee">
                  READ MORE <ArrowRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
