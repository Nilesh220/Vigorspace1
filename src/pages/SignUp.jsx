import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import vigorLogo from '../assets/Group.png';

export default function SignUp() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: '', email: '', password: '', referralCode: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          referral_code: form.referralCode.trim().toUpperCase() || undefined,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      // Auto-navigate after a moment (session is set if email confirm is off)
      setTimeout(() => navigate('/earn'), 2500);
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
          {success ? (
            <div className="auth-success-state">
              <CheckCircle size={56} color="#4CAF50" />
              <h2 className="font-bungee" style={{ color: '#F5C842', marginTop: 16 }}>YOU'RE IN!</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
                Account created. Redirecting you now…
              </p>
            </div>
          ) : (
            <>
              <div className="auth-form-header">
                <h1 className="auth-form-title font-bungee">JOIN THE SQUAD</h1>
                <p className="auth-form-subtitle">Create your account and start earning</p>
              </div>

              {error && (
                <div className="auth-error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-field">
                  <label htmlFor="signup-name" className="auth-label">Full Name</label>
                  <div className="auth-input-wrapper">
                    <User size={16} className="auth-input-icon" />
                    <input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      className="auth-input"
                      placeholder="Your name"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="signup-email" className="auth-label">Email</label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="auth-input-icon" />
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      className="auth-input"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="signup-password" className="auth-label">Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      id="signup-password"
                      name="password"
                      type={showPass ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
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

                <div className="auth-field">
                  <label htmlFor="signup-referral" className="auth-label">
                    Referral Code <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>REF</span>
                    <input
                      id="signup-referral"
                      name="referralCode"
                      type="text"
                      className="auth-input"
                      placeholder="e.g. ABC12345"
                      value={form.referralCode}
                      onChange={handleChange}
                      maxLength={8}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                </div>

                <button
                  id="signup-submit"
                  type="submit"
                  className="btn-auth-primary"
                  disabled={loading}
                >
                  {loading ? <span className="spinner-sm" /> : 'CREATE ACCOUNT'}
                </button>
              </form>

              <div className="auth-form-footer">
                <span>Already have an account?</span>
                <Link to="/login" className="auth-link">Sign In</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
