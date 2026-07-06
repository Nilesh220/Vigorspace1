import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AdminLayout from './AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminTasks from './pages/AdminTasks';
import AdminSubmissions from './pages/AdminSubmissions';
import AdminRewards from './pages/AdminRewards';
import AdminRedemptions from './pages/AdminRedemptions';
import AdminMessages from './pages/AdminMessages';

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
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="tasks" element={<AdminTasks />} />
        <Route path="submissions" element={<AdminSubmissions />} />
        <Route path="rewards" element={<AdminRewards />} />
        <Route path="redemptions" element={<AdminRedemptions />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
