import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/context/AuthContext';
import { getMyTickets } from '@/services/ticketService';
import type { Ticket } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function MyTickets() {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    getMyTickets(currentUser.uid)
      .then(setTickets)
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1>My Tickets</h1>
      {tickets.length === 0 && <p>You haven't purchased any tickets yet.</p>}

      <div className="grid">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="card">
            <span className={`status-pill ${ticket.status}`}>{ticket.status}</span>
            <p>Ticket #{ticket.id.slice(0, 8)}</p>
            <p>
              {ticket.price === 0 ? 'Free' : `${ticket.currency} ${ticket.price.toFixed(2)}`}
            </p>






           {(ticket.status === 'valid' || ticket.status === 'used') && (   


 //hayde lets the qr show even when it was used. hek deyman el qr mbayne
              <div style={{ background: 'white', padding: 12, borderRadius: 8, width: 'fit-content' }}>
                <QRCodeSVG value={ticket.qrCodeValue} size={140} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
