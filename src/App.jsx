import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import { ToastProvider } from './context/ToastContext';

// Lazy load user pages
const Home          = lazy(() => import('./pages/Home'));
const Events        = lazy(() => import('./pages/Events'));
const Contact       = lazy(() => import('./pages/Contact'));
const Earn          = lazy(() => import('./pages/Earn'));
const Rewards       = lazy(() => import('./pages/Rewards'));
const Refer         = lazy(() => import('./pages/Refer'));
const TaskDetails   = lazy(() => import('./pages/TaskDetails'));
const Leaderboard   = lazy(() => import('./pages/Leaderboard'));
const Profile       = lazy(() => import('./pages/Profile'));
const Stories       = lazy(() => import('./pages/Stories'));
const News          = lazy(() => import('./pages/News'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const Settings      = lazy(() => import('./pages/Settings'));
const Login         = lazy(() => import('./pages/Login'));
const SignUp        = lazy(() => import('./pages/SignUp'));
const NotFound      = lazy(() => import('./pages/NotFound'));

// Lazy load admin router (prevents regular users from fetching admin bundle)
const AdminApp      = lazy(() => import('./admin/AdminApp'));

function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B1B2F' }}>
      <div className="spinner" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public auth routes (no sidebar) */}
              <Route path="/login"  element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Admin portal — own layout, own auth guard */}
              <Route path="/admin/*" element={<AdminApp />} />

              {/* App shell routes */}
              <Route element={<AppShell />}>
                {/* Public pages */}
                <Route path="/"        element={<Home />} />
                <Route path="/events"  element={<Events />} />
                <Route path="/contact" element={<Contact />} />

                {/* Protected pages */}
                <Route path="/earn"         element={<ProtectedRoute><Earn /></ProtectedRoute>} />
                <Route path="/task/:id"     element={<ProtectedRoute><TaskDetails /></ProtectedRoute>} />
                <Route path="/rewards"      element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
                <Route path="/refer"        element={<ProtectedRoute><Refer /></ProtectedRoute>} />
                <Route path="/leaderboard"  element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/stories"      element={<ProtectedRoute><Stories /></ProtectedRoute>} />
                <Route path="/news"         element={<ProtectedRoute><News /></ProtectedRoute>} />
                <Route path="/community"    element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
                <Route path="/settings"     element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
