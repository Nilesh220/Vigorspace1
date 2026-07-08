import { Outlet, useNavigate } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function AppShell() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'You';
  const avatarSeed  = profile?.full_name || user?.id || 'default';
  const avatarUrl   = profile?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`;

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-content">
        {/* Desktop-only top bar */}
        <div className="topbar desktop-only-topbar">
          <div
            className="user-badge"
            title={user?.email}
            onClick={() => navigate('/profile')}
            style={{ cursor: 'pointer' }}
          >
            <img src={avatarUrl} alt={displayName} />
            <span>{displayName}</span>
          </div>
          <div className="notification-bell">
            <Bell size={20} />
          </div>
          {user && (
            <button
              onClick={handleSignOut}
              title="Sign out"
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                marginLeft: 8,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            >
              <LogOut size={18} />
            </button>
          )}
        </div>

        <Outlet />
      </div>
    </div>
  );
}
