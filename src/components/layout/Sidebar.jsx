import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Calendar, Target, Gift, Users, Phone, Trophy, User, Menu, X, Bell, LogIn } from 'lucide-react';
import vigorLogo from '../../assets/Group.png';
import { useAuth } from '../../context/AuthContext';

const allNavItems = [
  { to: '/',            icon: Home,     label: 'Home',       end: true },
  { to: '/events',      icon: Calendar, label: 'Events' },
  { to: '/earn',        icon: Target,   label: 'Earn' },
  { to: '/rewards',     icon: Gift,     label: 'Rewards' },
  { to: '/refer',       icon: Users,    label: 'Refer' },
  { to: '/leaderboard', icon: Trophy,   label: 'Leaderboard' },
  { to: '/profile',     icon: User,     label: 'Profile' },
  { to: '/contact',     icon: Phone,    label: 'Contact' },
];

// Bottom nav: hamburger first, then 4 main links
const bottomNavItems = [
  { to: '/events',  icon: Calendar, label: 'Events' },
  { to: '/earn',    icon: Target,   label: 'Earn' },
  { to: '/rewards', icon: Gift,     label: 'Rewards' },
  { to: '/refer',   icon: Users,    label: 'Refer' },
];

export default function Sidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.full_name || user?.email?.split('@')[0] || '';
  const avatarSeed  = profile?.full_name || user?.id || 'default';
  const avatarUrl   = profile?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`;

  async function handleSignOut() {
    await signOut();
    navigate('/login');
    setDrawerOpen(false);
  }

  return (
    <>
      {/* ═══════════════════════════════════════
          DESKTOP SIDEBAR (hidden on mobile)
         ═══════════════════════════════════════ */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <NavLink to="/">
            <img src={vigorLogo} alt="Vigor Space" style={{ width: 90, height: 'auto', display: 'block' }} />
          </NavLink>
        </div>
        <nav className="sidebar-nav">
          {allNavItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ═══════════════════════════════════════
          MOBILE TOP BAR
         ═══════════════════════════════════════ */}
      <header className="mob-topbar">
        {/* Logo */}
        <NavLink to="/" className="mob-topbar-logo">
          <img src={vigorLogo} alt="Vigor Space" />
        </NavLink>

        {/* Right side */}
        <div className="mob-topbar-right">
          {user ? (
            /* Logged-in: avatar + bell */
            <>
              <div
                className="mob-avatar"
                onClick={() => { navigate('/profile'); }}
              >
                <img src={avatarUrl} alt={displayName} />
                <span>{displayName}</span>
              </div>
              <button className="mob-bell" onClick={() => {}}>
                <Bell size={20} />
              </button>
            </>
          ) : (
            /* Guest: Sign In pill + bell */
            <>
              <NavLink to="/login" className="mob-signin-btn">
                <LogIn size={14} />
                Sign In
              </NavLink>
              <button className="mob-bell">
                <Bell size={20} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* ═══════════════════════════════════════
          MOBILE BOTTOM NAV
          Hamburger ≡ | Events | Earn | Rewards | Refer
         ═══════════════════════════════════════ */}
      <nav className="mob-bottom-nav">
        {/* Hamburger — opens drawer */}
        <button
          className={`mob-bottom-item mob-hamburger ${drawerOpen ? 'active' : ''}`}
          onClick={() => setDrawerOpen(v => !v)}
          aria-label="Menu"
        >
          <Menu size={22} />
          <span>Menu</span>
        </button>

        {/* 4 main nav links */}
        {bottomNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `mob-bottom-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ═══════════════════════════════════════
          FULL-SCREEN DRAWER
         ═══════════════════════════════════════ */}
      {drawerOpen && (
        <div className="mob-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <aside className="mob-drawer" onClick={e => e.stopPropagation()}>
            {/* Drawer header */}
            <div className="mob-drawer-header">
              <img src={vigorLogo} alt="Vigor Space" style={{ height: 36 }} />
              <button className="mob-drawer-close" onClick={() => setDrawerOpen(false)}>
                <X size={22} />
              </button>
            </div>

            {/* All nav links */}
            <nav className="mob-drawer-nav">
              {allNavItems.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `mob-drawer-item ${isActive ? 'active' : ''}`}
                  onClick={() => setDrawerOpen(false)}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Auth actions */}
            <div className="mob-drawer-footer">
              {user ? (
                <button className="mob-drawer-signout" onClick={handleSignOut}>
                  Sign Out
                </button>
              ) : (
                <NavLink to="/login" className="mob-drawer-signin" onClick={() => setDrawerOpen(false)}>
                  Sign In
                </NavLink>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
