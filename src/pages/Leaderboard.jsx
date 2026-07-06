import { useEffect, useState } from 'react';
import Footer from '../components/layout/Footer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
  const { user, profile } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Fetch top 15
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(15);

      if (!error && data) {
        setLeaders(data);
        const myEntry = user ? data.find(r => r.id === user.id) : null;
        setMyRank(myEntry?.rank || profile?.total_points ? null : null);
      }

      // Get own rank (may be outside top 15)
      if (user) {
        const { data: rankData } = await supabase
          .from('leaderboard')
          .select('rank')
          .eq('id', user.id)
          .single();
        if (rankData) setMyRank(rankData.rank);
      }

      // Total user count
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      setTotal(count || 0);

      setLoading(false);
    }
    load();
  }, [user]);

  const top3Order = leaders.slice(0, 3);
  // Display podium in [2nd, 1st, 3rd] visual order
  const podiumOrder = top3Order.length >= 3
    ? [top3Order[1], top3Order[0], top3Order[2]]
    : top3Order;
  const restOfList = leaders.slice(3);
  const myProfile = profile;

  if (loading) {
    return (
      <div className="leaderboard-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <h1 className="leaderboard-title font-bungee">LEADERBOARD</h1>

      {/* Top 3 Podium */}
      {podiumOrder.length >= 3 && (
        <div className="podium">
          {podiumOrder.map((person, i) => {
            const isMe = user && person.id === user.id;
            const avatarSeed = person.full_name || person.id;
            const avatarUrl = person.avatar_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`;
            return (
              <div key={person.id} className={`podium-item${isMe ? ' podium-me' : ''}`}>
                <div className="rank-badge">{Number(person.rank)}</div>
                <img src={avatarUrl} alt={person.full_name} />
                <div className="name">{person.full_name || 'User'}</div>
                <div className="points">{person.total_points} pts</div>
              </div>
            );
          })}
        </div>
      )}

      {/* User rank banner */}
      <div className="user-rank-banner">
        <img
          src={myProfile?.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(myProfile?.full_name || 'me')}`}
          alt="You"
        />
        <span>
          {myRank
            ? `You are ranked #${myRank} out of ${total.toLocaleString()} users. You have earned ${myProfile?.total_points || 0} points.`
            : `You haven't appeared on the leaderboard yet. Complete tasks to earn points!`}
        </span>
      </div>

      {/* Rankings Table */}
      <div className="leaderboard-table">
        {restOfList.map(person => {
          const isMe = user && person.id === user.id;
          return (
            <div
              key={person.id}
              className={`leaderboard-row${isMe ? ' leaderboard-row-me' : ''}`}
              style={isMe ? { background: 'rgba(245,200,66,0.08)', borderRadius: 8 } : {}}
            >
              <span className="leaderboard-rank">{Number(person.rank)}</span>
              <span className="leaderboard-name">{person.full_name || 'User'}</span>
              <span className="leaderboard-pts">{person.total_points} pts</span>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="leaderboard-bottom">
        <p>Ready for more challenges?</p>
        <div className="hint">Explore tasks now and climb the leaderboard!</div>
        <button className="btn-explore-more" onClick={() => window.location.href = '/earn'}>EXPLORE</button>
      </div>

      <div style={{ marginTop: 60 }}>
        <Footer />
      </div>
    </div>
  );
}
