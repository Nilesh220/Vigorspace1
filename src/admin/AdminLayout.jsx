import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, CheckSquare, Gift, ShoppingBag, MessageSquare, LogOut, Menu, X, Calendar, Tv, Ticket } from 'lucide-react';
import { supabase } from '../lib/supabase';
import vigorLogo from '../assets/Group.png';

const navItems = [
  { to: '/admin',              label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/admin/users',        label: 'Users',        icon: Users },
  { to: '/admin/tasks',        label: 'Tasks',        icon: ClipboardList },
  { to: '/admin/submissions',  label: 'Submissions',  icon: CheckSquare },
  { to: '/admin/rewards',      label: 'Rewards',      icon: Gift },
  { to: '/admin/redemptions',  label: 'Redemptions',  icon: ShoppingBag },
  { to: '/admin/events',       label: 'Events',       icon: Calendar },
  { to: '/admin/stories',      label: 'Stories',      icon: Tv },
  { to: '/admin/bookings',     label: 'Bookings',     icon: Ticket },
  { to: '/admin/messages',     label: 'Messages',     icon: MessageSquare },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <div className="admin-shell">
      {/* Mobile Top Bar */}
      <header className="admin-mob-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={vigorLogo} alt="Vigor Space" style={{ height: 28 }} />
          <span className="admin-badge font-bungee">ADMIN</span>
        </div>
        <button className="admin-mob-toggle" onClick={() => setMobileOpen(true)} aria-label="Open Menu">
          <Menu size={22} />
        </button>
      </header>

      {/* Sidebar (Desktop view, fixed on left) */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <img src={vigorLogo} alt="Vigor Space" style={{ width: 100 }} />
          <span className="admin-badge font-bungee">ADMIN</span>
        </div>

        <nav className="admin-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="admin-nav-item admin-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Mobile Drawer (Overlay when open) */}
      {mobileOpen && (
        <div className="admin-mob-overlay" onClick={() => setMobileOpen(false)}>
          <aside className="admin-mob-drawer" onClick={e => e.stopPropagation()}>
            <div className="admin-mob-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={vigorLogo} alt="Vigor Space" style={{ height: 28 }} />
                <span className="admin-badge font-bungee">ADMIN</span>
              </div>
              <button className="admin-mob-close" onClick={() => setMobileOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <nav className="admin-mob-nav">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            <button className="admin-nav-item admin-logout" style={{ margin: 'auto 16px 16px' }} onClick={handleLogout}>
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </aside>
        </div>
      )}

      {/* Main Container */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
