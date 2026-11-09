import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { roleCanManageEvent, roleCanScanTickets, roleIsAdmin } from '@/utils/roles';
import ChatWidget from '@/components/ChatWidget';

export default function Home() {
  const { currentUser, userProfile } = useAuth();

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '48px 0 24px' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: 4 }}>Welcome to Elite Ticketing</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', margin: '0 0 20px' }}>
          By Zuhair Tinawi
        </p>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: 520, margin: '0 auto' }}>
          Browse events, buy tickets with a scannable QR code, and earn points — all in one place, no third-party fees, full control.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: 96,
        }}
      >
        <Link to="/events" className="btn">
          Browse Events
        </Link>

        {currentUser ? (
          <>
            <Link to="/my-tickets" className="btn secondary">
              My Tickets
            </Link>
            <Link to="/rewards" className="btn secondary">
              My Rewards
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" className="btn secondary">
              Log in
            </Link>
            <Link to="/register" className="btn secondary">
              Sign up
            </Link>
          </>
        )}

        {roleCanManageEvent(userProfile?.role) && (
          <Link to="/organizer" className="btn secondary">
            Organizer Dashboard
          </Link>
        )}

        {roleCanScanTickets(userProfile?.role) && (
          <Link to="/staff/scan" className="btn secondary">
            Scan Tickets
          </Link>
        )}

        {roleIsAdmin(userProfile?.role) && (
          <Link to="/admin" className="btn secondary">
            Admin Dashboard
          </Link>
        )}
      </div>




      {/* hay el link badal ma tkun a full button.el Fixed position keeps it pinned to the corner of
          the screen even if this page's content grows. hek azbat shi deyman tdal bel corner 

bas halaa left is as a comment maybe baaden baamela 
      <Link
        to="/private-events"
        style={{
          position: 'fixed',
          bottom: 70,
          right: 20,
          padding: '8px 14px',
          borderRadius: 999,
          background: 'var(--color-surface-alt)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-muted)',
          fontSize: '0.85rem',
        }}
  
>
  🔒 Private Events
</Link>
*/}




      {/* hay el chatbot bubble */}
      <ChatWidget />
    </div>
  );
}