import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getEventsByOrganizer } from '@/services/eventService';
import type { EventRecord } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function OrganizerDashboard() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    getEventsByOrganizer(currentUser.uid)
      .then(setEvents)
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>My Events</h1>
        <Link to="/organizer/events/new" className="btn">
          + Create event
        </Link>
      </div>

      {events.length === 0 && <p>You haven't created any events yet.</p>}

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Starts</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>
                  <span className={`status-pill ${event.status}`}>{event.status}</span>
                </td>
                <td>{new Date(event.startDate).toLocaleDateString()}</td>
                <td>
                  <Link to={`/organizer/events/${event.id}/manage`}>Manage</Link>
                  {' · '}
                  <Link to={`/organizer/events/${event.id}/analytics`}>Analytics</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
