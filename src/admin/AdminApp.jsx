import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AdminLayout from './AdminLayout';

// Lazy load admin pages
const AdminDashboard   = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers       = lazy(() => import('./pages/AdminUsers'));
const AdminTasks       = lazy(() => import('./pages/AdminTasks'));
const AdminSubmissions = lazy(() => import('./pages/AdminSubmissions'));
const AdminRewards     = lazy(() => import('./pages/AdminRewards'));
const AdminRedemptions = lazy(() => import('./pages/AdminRedemptions'));
const AdminMessages    = lazy(() => import('./pages/AdminMessages'));
const AdminEvents      = lazy(() => import('./pages/AdminEvents'));
const AdminStories     = lazy(() => import('./pages/AdminStories'));
const AdminBookings    = lazy(() => import('./pages/AdminBookings'));

function AdminLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', background: 'transparent' }}>
      <div className="spinner" />
    </div>
  );
}

export default function AdminApp() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (!supabase) { setChecking(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setChecking(false); return; }
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      setIsAdmin(data?.role === 'admin');
      setChecking(false);
    }
    checkAdmin();
  }, []);

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#1B1B2F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', background: '#1B1B2F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <h1 className="font-bungee" style={{ color: '#E8576D', fontSize: '3rem' }}>ACCESS DENIED</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>You need admin privileges to view this page.</p>
        <a href="/" className="font-bungee" style={{ color: '#F5C842', fontSize: '0.9rem', letterSpacing: 1 }}>← BACK TO HOME</a>
      </div>
    );
  }

  return (
    <Suspense fallback={<AdminLoader />}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="submissions" element={<AdminSubmissions />} />
          <Route path="rewards" element={<AdminRewards />} />
          <Route path="redemptions" element={<AdminRedemptions />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="stories" element={<AdminStories />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
