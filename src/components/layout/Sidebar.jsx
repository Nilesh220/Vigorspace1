import { NavLink } from 'react-router-dom';
import { Home, Calendar, Target, Gift, Users, Phone, Trophy, User } from 'lucide-react';
import vigorLogo from '../../assets/Group.png';

export default function Sidebar() {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/events', icon: Calendar, label: 'Events' },
    { to: '/earn', icon: Target, label: 'Earn' },
    { to: '/rewards', icon: Gift, label: 'Rewards' },
    { to: '/refer', icon: Users, label: 'Refer' },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/contact', icon: Phone, label: 'Contact us' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <NavLink to="/">
          <img
            src={vigorLogo}
            alt="Vigor Space"
            style={{ width: 100, height: 'auto', display: 'block' }}
          />
        </NavLink>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
            end={item.to === '/'}
          >
            <item.icon />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
