import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  createTicketType,
  getEvent,
  getTicketTypes,
  updateEvent,
} from '@/services/eventService';
import type { EventRecord, EventStatus, TicketType } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ManageEvents() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('0');
  const [quantity, setQuantity] = useState('100');
  const [savingTicketType, setSavingTicketType] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  async function refresh() {
    if (!eventId) return;
    const [eventData, types] = await Promise.all([getEvent(eventId), getTicketTypes(eventId)]);
    setEvent(eventData);
    setTicketTypes(types);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [eventId]);

  async function handleAddTicketType(e: FormEvent) {
    e.preventDefault();
    if (!eventId) return;
    setSavingTicketType(true);
    try {
      await createTicketType(eventId, {
        name,
        price: Number(price),
        currency: 'USD',
        quantityTotal: Number(quantity),
      });
      setName('');
      setPrice('0');
      setQuantity('100');
      await refresh();
    } finally {
      setSavingTicketType(false);
    }
  }

  async function handleStatusChange(status: EventStatus) {
    if (!eventId) return;
    setStatusSaving(true);
    try {
      await updateEvent(eventId, { status });
      await refresh();
    } finally {
      setStatusSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!event) return <p>Event not found.</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{event.title}</h1>
          <span className={`status-pill ${event.status}`}>{event.status}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {event.status !== 'published' && (
            <button className="btn" disabled={statusSaving} onClick={() => handleStatusChange('published')}>
              Publish
            </button>
          )}
          {event.status === 'published' && (
            <button
              className="btn secondary"
              disabled={statusSaving}
              onClick={() => handleStatusChange('draft')}
            >
              Unpublish
            </button>
          )}
          <button
            className="btn danger"
            disabled={statusSaving}
            onClick={() => handleStatusChange('cancelled')}
          >
            Cancel event
          </button>
        </div>
      </div>

      <h2>Ticket types</h2>
      <div className="grid">
        {ticketTypes.map((tt) => (
          <div key={tt.id} className="card">
            <h3>{tt.name}</h3>
            <p>{tt.currency} {tt.price.toFixed(2)}</p>
            <p style={{ color: 'var(--color-text-muted)' }}>
              {tt.quantitySold} sold / {tt.quantityTotal} total
            </p>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 24 }}>Add a ticket type</h3>
      <form onSubmit={handleAddTicketType} className="card" style={{ maxWidth: 420 }}>
        <div className="form-field">
          <label htmlFor="ttName">Name</label>
          <input
            id="ttName"
            placeholder="General Admission"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="ttPrice">Price (USD)</label>
          <input
            id="ttPrice"
            type="number"
            min="0"
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="ttQty">Quantity available</label>
          <input
            id="ttQty"
            type="number"
            min="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <button className="btn" type="submit" disabled={savingTicketType}>
          {savingTicketType ? 'Adding…' : 'Add ticket type'}
        </button>
      </form>
    </div>
  );
}
