import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import Home from './pages/Home';
import Events from './pages/Events';
import Contact from './pages/Contact';
import Earn from './pages/Earn';
import Rewards from './pages/Rewards';
import Refer from './pages/Refer';
import TaskDetails from './pages/TaskDetails';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import NotFound from './pages/NotFound';
import AdminApp from './admin/AdminApp';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
