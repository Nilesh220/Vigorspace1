import { MessageSquare, Users, Sparkles, Send, Award, HelpCircle } from 'lucide-react';
import Footer from '../components/layout/Footer';

const CHANNELS = [
  {
    name: 'Vigor WhatsApp Channel',
    platform: 'WhatsApp',
    desc: 'Get daily tasks, flash updates, memes, and live event reminders directly on your phone.',
    members: '12K+ Members',
    color: '#25D366',
    link: 'https://chat.whatsapp.com/example',
  },
  {
    name: 'Vigor Discord Community',
    platform: 'Discord',
    desc: 'Chat with mentors, collaborate on designs, stream sessions, and join voice rooms.',
    members: '8.4K+ Members',
    color: '#5865F2',
    link: 'https://discord.gg/example',
  },
  {
    name: 'Vigor Telegram News',
    platform: 'Telegram',
    desc: 'Instant push alerts for exclusive tasks, reward drops, and winner announcements.',
    members: '6.2K+ Members',
    color: '#0088cc',
    link: 'https://t.me/example',
  },
];

export default function CommunityPage() {
  return (
    <div className="community-page-container">
      {/* Header */}
      <div className="community-header-section">
        <span className="community-badge font-caveat">THE SOCIAL SPOT</span>
        <h1 className="community-main-title font-bungee">COMMUNITY</h1>
        <p className="community-subtitle">
          Welcome to our dynamic community hub — join any channel to build connections, learn skills, and unlock opportunities.
        </p>
      </div>

      {/* Main Content */}
      <div className="container" style={{ paddingBottom: 80 }}>
        {/* Platforms Grid */}
        <div className="community-grid">
          {CHANNELS.map(ch => (
            <div key={ch.name} className="community-platform-card" style={{ borderTop: `4px solid ${ch.color}` }}>
              <div className="platform-card-header">
                <h3 className="platform-name font-bungee">{ch.platform}</h3>
                <span className="platform-members">{ch.members}</span>
              </div>
              <h4 className="platform-channel-title">{ch.name}</h4>
              <p className="platform-desc">{ch.desc}</p>
              
              <a 
                href={ch.link}
                target="_blank"
                rel="noreferrer"
                className="platform-join-btn font-bungee"
                style={{ backgroundColor: ch.color, borderColor: ch.color }}
              >
                JOIN THE SQUAD
              </a>
            </div>
          ))}
        </div>

        {/* Community Guidelines */}
        <div className="community-guidelines-box">
          <h3 className="guidelines-title font-bungee">
            <Sparkles size={20} style={{ marginRight: 8, color: '#F5C842' }} />
            SQUAD ETIQUETTE
          </h3>
          <div className="guidelines-grid">
            <div className="guideline-item">
              <Award size={18} style={{ color: '#E8576D', marginBottom: 8 }} />
              <div className="guideline-bold">Stay Active</div>
              <p>Participate in discussions, complete tasks, and claim points daily.</p>
            </div>
            <div className="guideline-item">
              <Users size={18} style={{ color: '#F5C842', marginBottom: 8 }} />
              <div className="guideline-bold">Be Supportive</div>
              <p>Help other creators, share feedback politely, and respect perspectives.</p>
            </div>
            <div className="guideline-item">
              <HelpCircle size={18} style={{ color: '#4CAF50', marginBottom: 8 }} />
              <div className="guideline-bold">Ask Questions</div>
              <p>Reach out to mentors in the Discord help channels when stuck.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
