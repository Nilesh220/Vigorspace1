import { useState, useEffect } from 'react';
import { Settings, Award, Target, CheckCircle, Users, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const tabs = ['Task Overview', 'Points History', 'Gift Cards Redeemed', 'My Booked Tickets'];

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [
        { data: subs },
        { data: txns },
        { data: reds },
        { data: bookedEvents },
        { data: rankData },
        { count: total },
        { count: refCount },
      ] = await Promise.all([
        supabase.from('task_submissions').select('*, tasks(title, points)').eq('user_id', user.id).order('submitted_at', { ascending: false }),
        supabase.from('point_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('redemptions').select('*, rewards(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('event_bookings').select('*, events(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('leaderboard').select('rank').eq('id', user.id).maybeSingle(),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', user.id),
      ]);
      setSubmissions(subs || []);
      setTransactions(txns || []);
      setRedemptions(reds || []);
      setBookings(bookedEvents || []);
      setMyRank(rankData?.rank ?? null);
      setTotalUsers(total || 0);
      setReferralCount(refCount || 0);
      setLoading(false);
    }
    load();
  }, [user]);

  const completedTasks = submissions.filter(s => s.status === 'approved').length;
  const totalPointsEarned = transactions.filter(t => t.delta > 0).reduce((sum, t) => sum + t.delta, 0);
  const availablePoints = profile?.total_points ?? 0;

  const stats = [
    { icon: Award,      value: totalPointsEarned.toLocaleString(), label: 'Total Points\nEarned',    color: '#E8576D' },
    { icon: Target,     value: availablePoints.toLocaleString(),   label: 'Available\nPoints',        color: '#4ECDC4' },
    { icon: CheckCircle,value: completedTasks,                     label: 'Completed\nTasks',          color: '#4CAF50' },
    { icon: Users,      value: referralCount,                      label: 'Users\nReferred',           color: '#F5C842' },
    { icon: CreditCard, value: redemptions.length,                 label: 'Gift Cards\nRedeemed',      color: '#9B59B6' },
  ];

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'You';
  const joinYear = profile?.created_at ? new Date(profile.created_at).getFullYear() : '';
  const avatarSeed = profile?.full_name || user?.id || 'me';
  const avatarUrl = profile?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`;

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="profile-page">
      <h1 className="profile-title">PROFILE</h1>

      <hr className="dashed-separator" style={{ marginBottom: 20 }} />

      <div className="profile-settings-link">
        <a href="#" onClick={handleSignOut}>
          <Settings size={16} />
          Sign Out
        </a>
      </div>

      {/* User Card */}
      <div className="profile-user-card">
        <div className="profile-user-info">
          <img src={avatarUrl} alt={displayName} />
          <div>
            <div className="profile-user-name">{displayName}</div>
            <div className="profile-user-joined">
              {joinYear ? `Joined since ${joinYear}` : 'Member'}
            </div>
            {user?.email && (
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                {user.email}
              </div>
            )}
          </div>
        </div>
        <div className="profile-rank-badge">
          {myRank ? `Rank: #${myRank}` : 'Unranked'}
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-card">
        <h3>Statistics</h3>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-item">
                <stat.icon size={20} style={{ color: stat.color }} />
                <div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label" style={{ whiteSpace: 'pre-line' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {tabs.map((tab, i) => (
          <button
            key={i}
            className={`profile-tab ${activeTab === i ? 'active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="profile-tab-content">
        {activeTab === 0 && (
          submissions.length === 0 ? (
            <div className="profile-empty">No task submissions yet. Go to Earn to get started!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {submissions.map(s => (
                <div key={s.id} style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.tasks?.title || 'Task'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                      {new Date(s.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#F5C842', fontWeight: 700 }}>{s.tasks?.points} pts</span>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '3px 10px',
                      borderRadius: 20,
                      background: s.status === 'approved' ? 'rgba(76,175,80,0.2)' : s.status === 'rejected' ? 'rgba(232,87,109,0.2)' : 'rgba(245,200,66,0.2)',
                      color: s.status === 'approved' ? '#4CAF50' : s.status === 'rejected' ? '#E8576D' : '#F5C842',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}>
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 1 && (
          transactions.length === 0 ? (
            <div className="profile-empty">No point transactions yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {transactions.map(t => (
                <div key={t.id} style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {t.reason.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{
                    fontWeight: 700,
                    color: t.delta > 0 ? '#4CAF50' : '#E8576D',
                  }}>
                    {t.delta > 0 ? '+' : ''}{t.delta} pts
                  </span>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 2 && (
          redemptions.length === 0 ? (
            <div className="profile-empty">No gift cards redeemed yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {redemptions.map(r => (
                <div key={r.id} style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.rewards?.name || 'Gift Card'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#E8576D', fontWeight: 700 }}>-{r.points_spent} pts</span>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '3px 10px',
                      borderRadius: 20,
                      background: r.status === 'fulfilled' ? 'rgba(76,175,80,0.2)' : 'rgba(245,200,66,0.2)',
                      color: r.status === 'fulfilled' ? '#4CAF50' : '#F5C842',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}>
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 3 && (
          bookings.length === 0 ? (
            <div className="profile-empty">No booked event tickets yet. Explore Events and book a spot!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {bookings.map(b => {
                const ev = b.events;
                if (!ev) return null;
                const eventDate = new Date(ev.event_date);
                const dateString = eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                const timeString = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={b.id} className="digital-ticket-stub">
                    {/* Left Part: Event Details */}
                    <div className="ticket-details-main">
                      <div className="ticket-header-pill font-bungee">VIGOR SQUAD PASS</div>
                      <h4 className="ticket-event-title font-bungee">{ev.title}</h4>
                      
                      <div className="ticket-info-grid">
                        <div>
                          <div className="ticket-info-label">DATE &amp; TIME</div>
                          <div className="ticket-info-value">{dateString} at {timeString}</div>
                        </div>
                        <div>
                          <div className="ticket-info-label">LOCATION</div>
                          <div className="ticket-info-value">{ev.location}</div>
                        </div>
                      </div>

                      <div className="ticket-footer-row">
                        <div>
                          <div className="ticket-info-label">ATTENDEE NAME</div>
                          <div className="ticket-info-value" style={{ textTransform: 'uppercase', color: '#fff' }}>{b.full_name}</div>
                        </div>
                        <div>
                          <div className="ticket-info-label">PASS ID</div>
                          <div className="ticket-info-value font-mono" style={{ fontSize: '0.65rem', color: 'var(--yellow)' }}>{b.id.substring(0, 13).toUpperCase()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Tear-off vertical line indicator */}
                    <div className="ticket-stub-divider">
                      <div className="divider-notch top" />
                      <div className="divider-dashed-line" />
                      <div className="divider-notch bottom" />
                    </div>

                    {/* Right Part: QR/Barcode Stub */}
                    <div className="ticket-details-stub">
                      <div className="ticket-stub-barcode-container">
                        {/* Real dynamic scannable QR Code */}
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${b.id}&color=e8576d&bgcolor=2a1b3d`} 
                          alt="QR Code Ticket" 
                          style={{ width: 65, height: 65, borderRadius: 8, border: '1.5px solid rgba(232, 87, 109, 0.3)' }}
                        />
                        <div className="barcode-num font-mono" style={{ marginTop: 4 }}>{b.id.substring(b.id.length - 8).toUpperCase()}</div>
                      </div>
                      <div className="ticket-stub-squad-logo font-bungee">VS</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      <hr className="dashed-separator" style={{ marginTop: 40, marginBottom: 0 }} />

      <Footer />
    </div>
  );
}
