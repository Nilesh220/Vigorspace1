import { useState, useEffect } from 'react';
import { User, Bell, Shield, Key, Check, AlertCircle, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/layout/Footer';

const AVATARS = [
  'Amy', 'Robert', 'Molly', 'Harley', 'Scoot', 'Buster', 'Princess', 'Cuddles',
];

export default function Settings() {
  const { user, profile, refreshProfile } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('default');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      // Try to extract seed from API url if possible, otherwise use a fallback
      if (profile.avatar_url && profile.avatar_url.includes('seed=')) {
        const seed = decodeURIComponent(profile.avatar_url.split('seed=')[1]);
        setAvatarSeed(seed);
      }
    }
  }, [profile]);

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`;

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        avatar_url: newAvatar,
      })
      .eq('id', user.id);

    if (updateErr) {
      setError(updateErr.message);
    } else {
      setSuccess(true);
      await refreshProfile();
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  }

  return (
    <div className="settings-page-container">
      {/* Header */}
      <div className="settings-header-section">
        <span className="settings-badge font-caveat">ACCOUNT CENTER</span>
        <h1 className="settings-main-title font-bungee">SETTINGS</h1>
        <p className="settings-subtitle">
          Manage your squad profile details, notifications, preferences, and account preferences.
        </p>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>
        <div className="settings-layout">
          {/* Card left */}
          <div className="settings-card">
            <h3 className="settings-card-title font-bungee">
              <User size={18} style={{ marginRight: 8, color: '#F5C842' }} />
              EDIT PROFILE
            </h3>

            <form onSubmit={handleSave} className="settings-form">
              {/* Avatar Selector */}
              <div className="settings-group">
                <label className="settings-label">SQUAD AVATAR</label>
                <div className="avatar-preview-row">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`}
                    alt="Current Avatar" 
                    className="current-avatar-preview"
                  />
                  <div className="avatar-seeds-grid">
                    {AVATARS.map(seed => (
                      <button
                        key={seed}
                        type="button"
                        className={`avatar-seed-btn ${avatarSeed === seed ? 'selected' : ''}`}
                        onClick={() => setAvatarSeed(seed)}
                      >
                        {seed}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="settings-group">
                <label className="settings-label">FULL NAME</label>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="Enter your name..."
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>

              {/* Email (Read Only) */}
              <div className="settings-group">
                <label className="settings-label">EMAIL ADDRESS (SECURE)</label>
                <input
                  type="email"
                  className="settings-input"
                  value={user?.email || ''}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>

              {error && (
                <div className="settings-error-msg">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="settings-success-msg">
                  <Check size={15} />
                  <span>Settings saved successfully!</span>
                </div>
              )}

              <button type="submit" className="btn-settings-save font-bungee" disabled={loading}>
                {loading ? <span className="spinner-sm" /> : <><Save size={16} /> SAVE CHANGES</>}
              </button>
            </form>
          </div>

          {/* Preferences Right */}
          <div className="settings-card">
            <h3 className="settings-card-title font-bungee">
              <Bell size={18} style={{ marginRight: 8, color: '#E8576D' }} />
              NOTIFICATIONS
            </h3>
            <div className="settings-preferences-list">
              <div className="preference-item">
                <div>
                  <div className="preference-title">Email Task Digests</div>
                  <div className="preference-desc">Receive weekly task highlights and point summaries.</div>
                </div>
                <input type="checkbox" defaultChecked />
              </div>

              <div className="preference-item">
                <div>
                  <div className="preference-title">Flash Reward Drops</div>
                  <div className="preference-desc">Get notifications for new brand voucher availability.</div>
                </div>
                <input type="checkbox" defaultChecked />
              </div>

              <div className="preference-item">
                <div>
                  <div className="preference-title">Security Notifications</div>
                  <div className="preference-desc">Alert me on logins from new browsers or devices.</div>
                </div>
                <input type="checkbox" defaultChecked disabled />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
