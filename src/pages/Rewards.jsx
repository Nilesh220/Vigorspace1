import { useState, useEffect } from 'react';
import Footer from '../components/layout/Footer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const streakSchedule = [10, 15, 20, 30, 35, 40, 50]; // points per day 1-7

export default function Rewards() {
  const { user, profile, refetchProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('rewards');
  const [giftCards, setGiftCards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null); // reward id being redeemed
  const [redeemError, setRedeemError] = useState('');

  const totalPoints = profile?.total_points ?? 0;
  const streakDay = profile?.streak_days ?? 0;
  // Current position in 7-day cycle
  const streakCycleDay = ((streakDay - 1) % 7) + 1;

  useEffect(() => {
    async function load() {
      const [{ data: cards }, { data: myRedemptions }] = await Promise.all([
        supabase.from('rewards').select('*').eq('is_active', true),
        user
          ? supabase.from('redemptions').select('*, rewards(name)').eq('user_id', user.id).order('created_at', { ascending: false })
          : { data: [] },
      ]);
      setGiftCards(cards || []);
      setRedemptions(myRedemptions || []);
      setLoading(false);
    }
    load();
  }, [user]);

  async function handleRedeem(card) {
    setRedeemError('');
    if (totalPoints < card.cost_points) {
      setRedeemError(`Not enough points. You need ${card.cost_points} pts but have ${totalPoints}.`);
      return;
    }
    setRedeeming(card.id);
    const { error } = await supabase.from('redemptions').insert({
      user_id: user.id,
      reward_id: card.id,
      points_spent: card.cost_points,
    });
    if (error) {
      setRedeemError(error.message);
    } else {
      await refetchProfile();
      // Refresh redemptions list
      const { data: myRedemptions } = await supabase
        .from('redemptions')
        .select('*, rewards(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setRedemptions(myRedemptions || []);
    }
    setRedeeming(null);
  }

  return (
    <div>
      {/* Hero with points */}
      <div className="rewards-page-hero" style={{ background: activeTab === 'rewards' ? 'var(--pink)' : 'var(--dark)' }}>
        <h1 className="rewards-points-display font-bungee">
          TOTAL POINTS: {loading ? '…' : totalPoints.toLocaleString()}
        </h1>

        <div className="rewards-tabs">
          <button
            className={`rewards-tab ${activeTab === 'rewards' ? 'active' : ''}`}
            onClick={() => setActiveTab('rewards')}
          >
            Rewards
          </button>
          <button
            className={`rewards-tab ${activeTab === 'redeem' ? 'active' : ''}`}
            onClick={() => setActiveTab('redeem')}
          >
            Redeem
          </button>
        </div>

        {activeTab === 'rewards' ? (
          <p className="rewards-tab-desc">
            Make every visit count. Log in daily to unlock exclusive benefits and earn rewards effortlessly.
          </p>
        ) : (
          <p className="rewards-tab-desc">
            Use your earned points to withdraw Cash, Steam, Google Play, Amazon &amp; much more!
          </p>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'rewards' ? (
        <div style={{ background: 'var(--pink)', padding: '0 60px 80px' }}>
          <div className="streak-card">
            <h3>7 Day Streak Rewards</h3>
            <p>
              Current streak: <strong>{streakDay} day{streakDay !== 1 ? 's' : ''}</strong>
              {streakDay > 0 && ` — keep it up!`}
            </p>
            <div className="streak-days">
              {streakSchedule.map((pts, i) => {
                const dayNum = i + 1;
                const isActive = dayNum <= streakCycleDay && streakDay > 0;
                const isCurrent = dayNum === streakCycleDay && streakDay > 0;
                return (
                  <div key={i} className={`streak-day${isActive ? ' active' : ''}${isCurrent ? ' current' : ''}`}>
                    <div className="day-label">Day {dayNum}</div>
                    <div className="coin-icon">🪙</div>
                    <div className="day-points">{pts} points</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--dark)', padding: '40px 60px 80px' }}>
          {redeemError && (
            <div style={{ color: '#E8576D', marginBottom: 16, fontSize: '0.9rem' }}>
              {redeemError}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div className="spinner" />
            </div>
          ) : (
            <>
              {/* Withdraw Giftcards */}
              <div className="withdraw-section">
                <h3>Withdraw Gift Cards</h3>
                <div className="withdraw-grid">
                  {giftCards.map(card => {
                    const canAfford = totalPoints >= card.cost_points;
                    const isRedeeming = redeeming === card.id;
                    return (
                      <div
                        key={card.id}
                        className={`withdraw-card${card.bg_color === '#111' ? ' dark' : ''}`}
                        style={{
                          background: card.bg_color,
                          opacity: canAfford ? 1 : 0.5,
                          position: 'relative',
                        }}
                      >
                        <div style={{ textAlign: 'center' }}>
                          <span style={{
                            fontSize: card.name === 'Amazon' ? '3rem' : '2rem',
                            fontWeight: 700,
                            color: card.logo_color,
                          }}>
                            {card.logo_char}
                          </span>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: card.text_color, marginTop: 4 }}>
                            {card.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: card.text_color, opacity: 0.7, marginTop: 2 }}>
                            {card.cost_points} pts
                          </div>
                        </div>
                        <button
                          style={{
                            marginTop: 10,
                            width: '100%',
                            padding: '6px 0',
                            borderRadius: 6,
                            border: 'none',
                            background: canAfford ? '#F5C842' : 'rgba(255,255,255,0.15)',
                            color: canAfford ? '#1B1B2F' : 'rgba(255,255,255,0.4)',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            cursor: canAfford ? 'pointer' : 'not-allowed',
                          }}
                          disabled={!canAfford || !!redeeming}
                          onClick={() => canAfford && handleRedeem(card)}
                        >
                          {isRedeeming ? '…' : canAfford ? 'REDEEM' : 'NEED MORE PTS'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Redemption History */}
              {redemptions.length > 0 && (
                <div className="withdraw-section" style={{ marginTop: 40 }}>
                  <h3>Redemption History</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {redemptions.map(r => (
                      <div key={r.id} style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 10,
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <span style={{ fontWeight: 600 }}>{r.rewards?.name || 'Reward'}</span>
                        <span style={{ color: '#E8576D', fontWeight: 700 }}>-{r.points_spent} pts</span>
                        <span style={{
                          fontSize: '0.72rem',
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
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
