import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getEvent, getTicketTypes } from '@/services/eventService';
import { getTicketsForEvent } from '@/services/ticketService';
import type { EventRecord, Ticket, TicketType } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function EventAnalytics() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    Promise.all([getEvent(eventId), getTicketTypes(eventId), getTicketsForEvent(eventId)])
      .then(([eventData, types, ticketData]) => {
        setEvent(eventData);
        setTicketTypes(types);
        setTickets(ticketData);
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  const chartData = useMemo(
    () =>
      ticketTypes.map((tt) => ({
        name: tt.name,
        sold: tt.quantitySold,
        remaining: Math.max(tt.quantityTotal - tt.quantitySold, 0),
      })),
    [ticketTypes]
  );

  const totalRevenue = useMemo(
    () => tickets.filter((t) => t.status !== 'cancelled' && t.status !== 'refunded')
      .reduce((sum, t) => sum + t.price, 0),
    [tickets]
  );

  const checkedInCount = useMemo(
    () => tickets.filter((t) => t.status === 'used').length,
    [tickets]
  );

  if (loading) return <LoadingSpinner />;
  if (!event) return <p>Event not found.</p>;

  return (
    <div>
      <h1>{event.title} — Analytics</h1>

      <div className="grid">
        <div className="card">
          <p style={{ color: 'var(--color-text-muted)' }}>Tickets sold</p>
          <h2>{tickets.length}</h2>
        </div>
        <div className="card">
          <p style={{ color: 'var(--color-text-muted)' }}>Checked in</p>
          <h2>{checkedInCount}</h2>
        </div>
        <div className="card">
          <p style={{ color: 'var(--color-text-muted)' }}>Revenue</p>
          <h2>${totalRevenue.toFixed(2)}</h2>
        </div>
      </div>

      <h2 style={{ marginTop: 24 }}>Sales by ticket type</h2>
      <div className="card" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3448" />
            <XAxis dataKey="name" stroke="#97a2b8" />
            <YAxis stroke="#97a2b8" allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#161d2e', border: '1px solid #2a3448' }} />
            <Bar dataKey="sold" fill="#4f7cff" name="Sold" />
            <Bar dataKey="remaining" fill="#2a3448" name="Remaining" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
