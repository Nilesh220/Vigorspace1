import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, CheckSquare, Gift, ShoppingBag, MessageSquare, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import vigorLogo from '../assets/Group.png';

const navItems = [
  { to: '/admin',              label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/admin/users',        label: 'Users',        icon: Users },
  { to: '/admin/tasks',        label: 'Tasks',        icon: ClipboardList },
  { to: '/admin/submissions',  label: 'Submissions',  icon: CheckSquare },
  { to: '/admin/rewards',      label: 'Rewards',      icon: Gift },
  { to: '/admin/redemptions',  label: 'Redemptions',  icon: ShoppingBag },
  { to: '/admin/messages',     label: 'Messages',     icon: MessageSquare },
];

export default function AdminLayout() {
  async function handleLogout() {
    if (supabase) await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <div className="admin-shell">
      {/* Sidebar */}
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

      {/* Main */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
