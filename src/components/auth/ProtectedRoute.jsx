import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Wraps protected routes.
 * - While session is loading shows a full-screen spinner.
 * - If Supabase isn't configured (demo mode), renders children directly.
 * - If no user, redirects to /login preserving the intended destination.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading, noSupabase } = useAuth();
  const location = useLocation();

  // Demo mode (no .env) — show the page anyway so dev can see the UI
  if (noSupabase) return children;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1B1B2F',
      }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
