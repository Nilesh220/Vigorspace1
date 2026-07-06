import { useState } from 'react';
import { MapPin, Phone, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Footer from '../components/layout/Footer';
import telephoneSticker from '../assets/Group 285.png'; // smiley as phone placeholder

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (supabase) {
        const { error: dbErr } = await supabase
          .from('contact_messages')
          .insert([{ name: form.name, email: form.email, phone: form.phone, message: form.message }]);
        if (dbErr) throw dbErr;
      }
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <div className="contact-hero">
        <h1 className="font-bungee contact-hero-title">CONTACT US</h1>
      </div>

      {/* Body */}
      <section className="contact-body">
        <div className="contact-left">
          <h2 className="contact-talk-title font-caveat">Talk with us!</h2>
          <p className="contact-talk-desc">
            Questions, comments, or suggestions? Simply fill in the form and we'll be in touch shortly.
          </p>

          <div className="contact-info-list">
            <div className="contact-info-item">
              <MapPin size={18} color="#E8576D" />
              <span>Vigor LaunchPad, Suit 3, 4th Floor,<br />Samruddhi Venture Park, MIDC Central<br />Road, Andheri East, Mumbai - 400053.</span>
            </div>
            <div className="contact-info-item">
              <Phone size={18} color="#E8576D" />
              <span>9964785157</span>
            </div>
            <div className="contact-info-item">
              <Mail size={18} color="#E8576D" />
              <span>info@vigorspace.com</span>
            </div>
          </div>

          <div className="contact-sticker">
            <img src={telephoneSticker} alt="contact sticker" />
          </div>
        </div>

        <div className="contact-right">
          {success ? (
            <div className="contact-success">
              <CheckCircle size={52} color="#4CAF50" />
              <h3 className="font-bungee" style={{ color: '#F5C842', marginTop: 16 }}>MESSAGE SENT!</h3>
              <p>We'll get back to you very soon 🚀</p>
              <button className="contact-submit-btn" onClick={() => setSuccess(false)} style={{ marginTop: 20 }}>
                SEND ANOTHER
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              {error && <div className="contact-error">{error}</div>}

              <div className="contact-field">
                <label className="contact-label">NAME <span style={{ color: '#E8576D' }}>*</span></label>
                <input
                  className="contact-input"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="contact-field">
                <label className="contact-label">EMAIL ADDRESS <span style={{ color: '#E8576D' }}>*</span></label>
                <input
                  className="contact-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="contact-field">
                <label className="contact-label">PHONE NUMBER</label>
                <input
                  className="contact-input"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 00000 00000"
                />
              </div>

              <div className="contact-field">
                <label className="contact-label">YOUR MESSAGE <span style={{ color: '#E8576D' }}>*</span></label>
                <textarea
                  className="contact-input contact-textarea"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  rows={5}
                  required
                />
              </div>

              <button className="contact-submit-btn" type="submit" disabled={loading}>
                {loading ? <span className="spinner-sm" /> : 'SUBMIT'}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
