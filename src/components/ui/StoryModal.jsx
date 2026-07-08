import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Pause } from 'lucide-react';

export default function StoryModal({ stories = [], initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const progressInterval = useRef(null);

  const currentStory = stories[currentIndex];
  const duration = 5000; // 5 seconds per story

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Handle progress timer
  useEffect(() => {
    if (paused) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      return;
    }

    setProgress(0);
    const step = 100 / (duration / 100); // steps of 100ms

    progressInterval.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(progressInterval.current);
          handleNext();
          return 100;
        }
        return p + step;
      });
    }, 100);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [currentIndex, paused]);

  function handleNext() {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose(); // close when last story completes
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  }

  if (!currentStory) return null;

  return (
    <div className="insta-story-overlay" onClick={onClose}>
      <div className="insta-story-container" onClick={e => e.stopPropagation()}>
        
        {/* Progress Bars (at the top) */}
        <div className="insta-story-progress-bar">
          {stories.map((story, index) => {
            let widthPercent = 0;
            if (index < currentIndex) widthPercent = 100;
            if (index === currentIndex) widthPercent = progress;
            return (
              <div key={story.id} className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ width: `${widthPercent}%` }} 
                />
              </div>
            );
          })}
        </div>

        {/* Story Header */}
        <div className="insta-story-header">
          <div className="story-user-details">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentStory.author)}`} 
              alt={currentStory.author} 
              className="story-avatar"
            />
            <div>
              <div className="story-username">{currentStory.author}</div>
              <div className="story-time-tag">{currentStory.category}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              className="insta-control-btn" 
              onClick={() => setPaused(!paused)}
              aria-label={paused ? "Play" : "Pause"}
            >
              {paused ? <Play size={18} fill="#fff" /> : <Pause size={18} fill="#fff" />}
            </button>
            <button className="insta-control-btn" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Media Content */}
        <div 
          className="insta-story-content"
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
        >
          <img 
            src={currentStory.image_url || currentStory.img || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop'} 
            alt={currentStory.title} 
            className="insta-story-media"
          />

          {/* Nav Areas (Click left/right sections of screen to change) */}
          <div className="insta-tap-left" onClick={handlePrev} />
          <div className="insta-tap-right" onClick={handleNext} />

          {/* Text/Overlay at bottom */}
          <div className="insta-story-caption">
            <h3 className="font-bungee">{currentStory.title}</h3>
            <p>{currentStory.description || 'Watch to learn about their creative journey!'}</p>
          </div>
        </div>

        {/* Desktop Side Buttons */}
        <button 
          className="insta-nav-btn left" 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          aria-label="Previous Story"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          className="insta-nav-btn right" 
          onClick={handleNext}
          aria-label="Next Story"
        >
          <ChevronRight size={24} />
        </button>

      </div>
    </div>
  );
}
