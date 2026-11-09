import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEvent, getTicketTypes } from '@/services/eventService';
import { purchaseTicket } from '@/services/ticketService';
import { useAuth } from '@/context/AuthContext';
import { applyRewardDiscount, getAvailableRewards, getRewardById } from '@/utils/rewards';
import type { EventRecord, TicketType } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function EventDetails() {
  const { eventId } = useParams<{ eventId: string }>();
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventRecord | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [selectedRewardId, setSelectedRewardId] = useState('');

  useEffect(() => {
    if (!eventId) return;
    Promise.all([getEvent(eventId), getTicketTypes(eventId)])
      .then(([eventData, types]) => {
        setEvent(eventData);
        setTicketTypes(types);
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  const availableRewards = userProfile ? getAvailableRewards(userProfile.points) : [];
  const selectedReward = getRewardById(selectedRewardId);

  async function handlePurchase(ticketType: TicketType) {
    if (!currentUser || !userProfile) {
      navigate('/login');
      return;
    }
    if (!eventId) return;

    setPurchasingId(ticketType.id);
    setMessage('');
    try {
      await purchaseTicket({
        eventId,
        ticketTypeId: ticketType.id,
        buyer: userProfile,
        rewardId: selectedRewardId || undefined,
      });
      setMessage(`Ticket purchased! Find it under "My Tickets".`);
      setSelectedRewardId('');
      const refreshed = await getTicketTypes(eventId);
      setTicketTypes(refreshed);
      await refreshProfile();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setPurchasingId(null);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!event) return <p>Event not found.</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{event.title}</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            {event.category} · {event.venue} · {new Date(event.startDate).toLocaleString()}
          </p>
        </div>
      </div>

      <p>{event.description}</p>

      <h2>Tickets</h2>
      {message && <p>{message}</p>}
      {ticketTypes.length === 0 && <p>No ticket types have been configured yet.</p>}

      <div className="grid">
        {ticketTypes.map((tt) => {
          const soldOut = tt.quantitySold >= tt.quantityTotal;
          const finalPrice = applyRewardDiscount(tt.price, selectedReward);
          const discounted = finalPrice !== tt.price;
          return (
            <div key={tt.id} className="card">
              <h3>{tt.name}</h3>
              {tt.description && <p>{tt.description}</p>}
              <p>
                {discounted && (
                  <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', marginRight: 8 }}>
                    {tt.currency} {tt.price.toFixed(2)}
                  </span>
                )}
                {finalPrice === 0 ? 'Free' : `${tt.currency} ${finalPrice.toFixed(2)}`}
              </p>
              <p style={{ color: 'var(--color-text-muted)' }}>
                {tt.quantityTotal - tt.quantitySold} left
              </p>
              <button
                className="btn"
                disabled={soldOut || purchasingId === tt.id}
                onClick={() => handlePurchase(tt)}
              >
                {soldOut ? 'Sold out' : purchasingId === tt.id ? 'Processing…' : 'Buy ticket'}
              </button>
            </div>
          );
        })}
      </div>

      {currentUser && userProfile && (
        <div className="card" style={{ marginTop: 16, maxWidth: 420 }}>
          <p style={{ margin: 0 }}>
            You have <strong>{userProfile.points}</strong> points.
          </p>
          <div className="form-field" style={{ marginTop: 10, marginBottom: 0 }}>
            <label htmlFor="rewardSelect">Apply a reward to your next purchase</label>
            <select
              id="rewardSelect"
              value={selectedRewardId}
              onChange={(e) => setSelectedRewardId(e.target.value)}
            >
              <option value="">No reward</option>
              {availableRewards.map((reward) => (
                <option key={reward.id} value={reward.id}>
                  {reward.label} ({reward.pointsCost} points)
                </option>
              ))}
            </select>
          </div>
          {availableRewards.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 8, marginBottom: 0 }}>
              Keep buying tickets to earn enough points for a reward.
            </p>
          )}
        </div>
      )}
    </div>
  );
}