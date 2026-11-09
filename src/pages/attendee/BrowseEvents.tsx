import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvent, getPublishedEvents } from '@/services/eventService';
import { getMyTickets } from '@/services/ticketService';
import { useAuth } from '@/context/AuthContext';
import type { EventRecord } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { sortByPurchasedCategories } from '@/utils/recommendations';

export default function BrowseEvents() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEvents() {
      try {
        const published = await getPublishedEvents();







        // isa signed in? categorize based on his purchases w el guests
        // just see the normak list.
        if (currentUser) {
          const categoryCounts = await getPurchasedCategoryCounts(currentUser.uid);
          setEvents(sortByPurchasedCategories(published, categoryCounts));
        } else {
          setEvents(published);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [currentUser]);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Upcoming Events</h1>
      </div>

      {events.length === 0 && <p>No published events yet. Check back soon!</p>}

      <div className="grid">
        {events.map((event) => (
          <Link key={event.id} to={`/events/${event.id}`} className="card">
            <h3>{event.title}</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>{event.category}</p>
            <p>{event.venue}</p>
            <p>{new Date(event.startDate).toLocaleString()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}






/** hayde it Looks at every ticket this user has ever bought, finds which category
 each one belongs to, and counts tickets bought per category.
 masalan isa he baught 3 music w 1 sport = 3 music tickets, 1 sports ticket. */

async function getPurchasedCategoryCounts(uid: string): Promise<Record<string, number>> {
  const tickets = await getMyTickets(uid);
  const uniqueEventIds = [...new Set(tickets.map((t) => t.eventId))];
  const purchasedEvents = await Promise.all(uniqueEventIds.map((id) => getEvent(id)));




  // hon zabatet el meshekle fa we map eventId -> category so we don't have to look up the same event
  // twice if he bought more than one ticket to it
  const categoryByEventId: Record<string, string> = {};
  for (const event of purchasedEvents) {
    if (event) categoryByEventId[event.id] = event.category;
  }

  const counts: Record<string, number> = {};
  for (const ticket of tickets) {
    const category = categoryByEventId[ticket.eventId];
    if (!category) continue;
    counts[category] = (counts[category] ?? 0) + 1;
  }
  return counts;
}

