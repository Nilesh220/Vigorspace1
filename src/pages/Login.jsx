import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import vigorLogo from '../assets/Group.png';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/earn';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  }

  return (
    <div className="auth-page">
      {/* Left panel — branding */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-rocket">
            <img src={vigorLogo} alt="Vigor Space Logo" style={{ width: 220, height: 'auto' }} />
          </div>
          <p className="auth-brand-tagline font-caveat" style={{ marginTop: 10 }}>Connect · Earn · Thrive</p>

          <div className="auth-brand-dots">
            <div className="auth-dot" style={{ background: '#E8576D' }} />
            <div className="auth-dot" style={{ background: '#F5C842' }} />
            <div className="auth-dot" style={{ background: '#4A90D9' }} />
          </div>
        </div>
      </div>


      {/* Right panel — form */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h1 className="auth-form-title font-bungee">WELCOME BACK</h1>
            <p className="auth-form-subtitle">Sign in to continue your journey</p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="login-email" className="auth-label">Email</label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="auth-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="login-password" className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-toggle-pass"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn-auth-primary"
              disabled={loading}
            >
              {loading ? <span className="spinner-sm" /> : 'SIGN IN'}
            </button>
          </form>

          <div className="auth-form-footer">
            <span>Don't have an account?</span>
            <Link to="/signup" className="auth-link">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
