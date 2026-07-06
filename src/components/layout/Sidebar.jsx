import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Target, Gift, Users, Phone, Trophy, User, Menu, X } from 'lucide-react';
import vigorLogo from '../../assets/Group.png';

const navItems = [
  { to: '/',            icon: Home,     label: 'Home',       end: true },
  { to: '/events',      icon: Calendar, label: 'Events' },
  { to: '/earn',        icon: Target,   label: 'Earn' },
  { to: '/rewards',     icon: Gift,     label: 'Rewards' },
  { to: '/refer',       icon: Users,    label: 'Refer' },
  { to: '/leaderboard', icon: Trophy,   label: 'Leaderboard' },
  { to: '/profile',     icon: User,     label: 'Profile' },
  { to: '/contact',     icon: Phone,    label: 'Contact' },
];

// Bottom bar shows 4 most-used items + hamburger for the rest
const bottomItems = [
  { to: '/events',  icon: Calendar, label: 'Events' },
  { to: '/earn',    icon: Target,   label: 'Earn' },
  { to: '/rewards', icon: Gift,     label: 'Rewards' },
  { to: '/refer',   icon: Users,    label: 'Refer' },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── DESKTOP SIDEBAR ─────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <NavLink to="/">
            <img src={vigorLogo} alt="Vigor Space" style={{ width: 90, height: 'auto', display: 'block' }} />
          </NavLink>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
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

      {/* ── MOBILE TOP BAR ─────────────────────────── */}
      <div className="mobile-topbar">
        <NavLink to="/">
          <img src={vigorLogo} alt="Vigor Space" style={{ height: 32, width: 'auto' }} />
        </NavLink>
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu size={24} />
        </button>
      </div>

      {/* ── MOBILE DRAWER (full menu) ───────────────── */}
      {mobileOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileOpen(false)}>
          <aside className="mobile-drawer" onClick={e => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <img src={vigorLogo} alt="Vigor Space" style={{ height: 36, width: 'auto' }} />
              <button className="mobile-menu-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            <nav className="mobile-drawer-nav">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `mobile-drawer-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* ── MOBILE BOTTOM NAV ──────────────────────── */}
      <nav className="mobile-bottom-nav">
        {bottomItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `mobile-bottom-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={22} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
