import { useEffect, useState } from 'react';
import { Play, Flame, Compass, Heart, Sparkles, Plus } from 'lucide-react';
import Footer from '../components/layout/Footer';
import { supabase } from '../lib/supabase';
import StoryModal from '../components/ui/StoryModal';

export default function Stories() {
  const [activeTab, setActiveTab] = useState('All');
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);

  const categories = ['All', 'Career Guidance', 'Mental Health', 'Professional Development', 'Life Lessons'];

  useEffect(() => {
    async function fetchStories() {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error) {
        setStories(data || []);
      }
      setLoading(false);
    }
    fetchStories();
  }, []);

  const filteredStories = activeTab === 'All' 
    ? stories 
    : stories.filter(s => s.category === activeTab);

  async function handleLike(e, storyId, currentLikes) {
    e.stopPropagation(); // prevent opening the story modal when clicking like
    
    // Check if already liked in local state to prevent multiple clicks
    const story = stories.find(s => s.id === storyId);
    if (story?.hasLiked) return;

    const { error } = await supabase
      .from('stories')
      .update({ likes: currentLikes + 1 })
      .eq('id', storyId);

    if (!error) {
      setStories(prev => prev.map(s => {
        if (s.id === storyId) {
          return { ...s, likes: s.likes + 1, hasLiked: true };
        }
        return s;
      }));
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="stories-page-container">
      {/* Hero Header */}
      <div className="stories-hero-header">
        <span className="stories-badge font-caveat">SQUAD TALKS</span>
        <h1 className="stories-main-title font-bungee">STORIES</h1>
        <p className="stories-subtitle">
          Discover inspiring tales of triumph. Click on any story to view it in fullscreen slideshow format.
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
            {filteredStories.map((story, i) => (
              <div 
                key={story.id} 
                className="story-media-card" 
                onClick={() => setActiveStoryIndex(i)}
                style={{ cursor: 'pointer' }}
              >
                {/* Media Wrapper */}
                <div className="story-media-wrapper">
                  <img src={story.image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop'} alt={story.title} className="story-img" />
                  <div className="story-card-overlay-btn">
                    <div className="story-play-icon-circle">
                      <Play size={22} fill="#fff" color="#fff" />
                    </div>
                  </div>
                  <span className="story-duration-tag">{story.duration || '5:00'}</span>
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
                      onClick={(e) => handleLike(e, story.id, story.likes)}
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

      {/* Full Screen Instagram-style Stories Overlay */}
      {activeStoryIndex !== null && (
        <StoryModal 
          stories={filteredStories}
          initialIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
        />
      )}

      <Footer />
    </div>
  );
}
