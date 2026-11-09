//Hayda trying el rewards feature


import { useAuth } from '@/context/AuthContext';
import { REWARD_TIERS } from '@/utils/rewards';

export default function Rewards() {
  const { userProfile } = useAuth();
  const points = userProfile?.points ?? 0;

  return (
    <div>
      <div className="page-header">
        <h1>My Rewards</h1>
      </div>

      <div className="card" style={{ maxWidth: 420, marginBottom: 24 }}>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Your points balance</p>
        <p style={{ margin: '4px 0 0', fontSize: '2rem', fontWeight: 700 }}>{points}</p>
      </div>

      <p style={{ color: 'var(--color-text-muted)', maxWidth: 560 }}>
        You earn 1 point for every $1 you spend on a ticket. Once you have enough points,
        you can apply a reward at checkout on any event's page to get a discount on that
        ticket.
      </p>

      <h2 style={{ marginTop: 24 }}>Reward tiers</h2>
      <div className="grid">
        {REWARD_TIERS.map((tier) => {
          const unlocked = points >= tier.pointsCost;
          return (
            <div key={tier.id} className="card">
              <h3>{tier.label}</h3>
              <p>{tier.pointsCost} points</p>
              {unlocked ? (
                <span className="status-pill valid">Available now</span>
              ) : (
                <span className="status-pill draft">
                  Need {tier.pointsCost - points} more points
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}