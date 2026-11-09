import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { createEvent } from '@/services/eventService';

export default function CreateEvent() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!currentUser) return;

    setSubmitting(true);
    setError('');
    try {
      const eventId = await createEvent({
        title,
        category,
        description,
        venue,
        address,
        startDate: new Date(startDate).getTime(),
        endDate: new Date(endDate).getTime(),
        organizerId: currentUser.uid,
        status: 'draft',
      });
      navigate(`/organizer/events/${eventId}/manage`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  }




  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <h1>Create Event</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="title">Title</label>
          <input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="category">Category</label>
          <input
            id="category"
            placeholder="music, tech, sports, ..."
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>


        <div className="form-field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>


        <div className="form-field">
          <label htmlFor="venue">Venue</label>
          <input id="venue" required value={venue} onChange={(e) => setVenue(e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="address">Address</label>
          <input
            id="address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>


        <div className="form-field">
          <label htmlFor="startDate">Start date &amp; time</label>
          <input
            id="startDate"
            type="datetime-local"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>


        <div className="form-field">
          <label htmlFor="endDate">End date &amp; time</label>
          <input
            id="endDate"
            type="datetime-local"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>


        {error && <p className="error-text">{error}</p>}
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create event (as draft)'}
        </button>
      </form>
    </div>
  );
}
