import { useState } from 'react';
import { Play, Flame, Compass, MessageCircle, Heart, Star, Sparkles } from 'lucide-react';
import Footer from '../components/layout/Footer';

const INITIAL_STORIES = [
  {
    id: 1,
    title: 'Overcoming Career Confusion',
    category: 'Career Guidance',
    author: 'Avi Parihar',
    duration: '5:12',
    likes: 142,
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
    featured: true,
  },
  {
    id: 2,
    title: 'Tips for Self-Care & Well-Being',
    category: 'Mental Health',
    author: 'Aradhya Warang',
    duration: '4:45',
    likes: 98,
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
    featured: false,
  },
  {
    id: 3,
    title: 'Strategies for Career Clarity',
    category: 'Career Guidance',
    author: 'Karan Rawool',
    duration: '6:30',
    likes: 189,
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
    featured: true,
  },
  {
    id: 4,
    title: 'Mind Matters: Prioritizing Self',
    category: 'Mental Health',
    author: 'Palash Shah',
    duration: '3:50',
    likes: 76,
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop',
    featured: false,
  },
  {
    id: 5,
    title: 'Navigating Industry Readiness',
    category: 'Professional Development',
    author: 'Sanya Malhotra',
    duration: '8:15',
    likes: 212,
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop',
    featured: false,
  },
  {
    id: 6,
    title: 'Finding Creativity in Tech',
    category: 'Life Lessons',
    author: 'Rohan Joshi',
    duration: '5:40',
    likes: 154,
    img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=500&fit=crop',
    featured: false,
  },
];

export default function Stories() {
  const [activeTab, setActiveTab] = useState('All');
  const [stories, setStories] = useState(INITIAL_STORIES);

  const categories = ['All', 'Career Guidance', 'Mental Health', 'Professional Development', 'Life Lessons'];

  const filteredStories = activeTab === 'All' 
    ? stories 
    : stories.filter(s => s.category === activeTab);

  function handleLike(id) {
    setStories(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, likes: s.likes + 1, hasLiked: true };
      }
      return s;
    }));
  }

  return (
    <div className="stories-page-container">
      {/* Hero Header */}
      <div className="stories-hero-header">
        <span className="stories-badge font-caveat">SQUAD TALKS</span>
        <h1 className="stories-main-title font-bungee">STORIES</h1>
        <p className="stories-subtitle">
          Discover inspiring tales of triumph. Watch young individuals share their journeys to resilience, growth, and clarity.
        </p>

        {/* Categories Tab Bar */}
        <div className="stories-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={`stories-tab-btn ${activeTab === cat ? 'active' : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat === 'All' && <Compass size={14} style={{ marginRight: 4 }} />}
              {cat === 'Mental Health' && <Sparkles size={14} style={{ marginRight: 4 }} />}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      <div className="container" style={{ paddingBottom: 80 }}>
        {filteredStories.length === 0 ? (
          <div className="stories-empty-state">
            <span style={{ fontSize: '3rem' }}>🎥</span>
            <h3 className="font-bungee">No Stories Found</h3>
            <p>We'll upload stories in this category soon. Stay tuned!</p>
          </div>
        ) : (
          <div className="stories-media-grid">
            {filteredStories.map(story => (
              <div key={story.id} className="story-media-card">
                {/* Media Wrapper */}
                <div className="story-media-wrapper">
                  <img src={story.img} alt={story.title} className="story-img" />
                  <div className="story-card-overlay-btn">
                    <div className="story-play-icon-circle">
                      <Play size={22} fill="#fff" color="#fff" />
                    </div>
                  </div>
                  <span className="story-duration-tag">{story.duration}</span>
                  {story.featured && (
                    <span className="story-featured-badge">
                      <Flame size={12} fill="#F5C842" color="#F5C842" /> FEATURED
                    </span>
                  )}
                </div>

                {/* Content info */}
                <div className="story-media-info">
                  <span className="story-cat-label">{story.category}</span>
                  <h3 className="story-title-text font-bungee">{story.title}</h3>
                  
                  <div className="story-card-meta-row">
                    <div className="story-author-chip">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(story.author)}`} 
                        alt={story.author} 
                      />
                      <span>{story.author}</span>
                    </div>

                    <button 
                      className={`story-like-btn ${story.hasLiked ? 'liked' : ''}`}
                      onClick={() => handleLike(story.id)}
                    >
                      <Heart size={15} fill={story.hasLiked ? '#E8576D' : 'transparent'} />
                      <span>{story.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
