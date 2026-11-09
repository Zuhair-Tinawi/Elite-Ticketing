import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS, roleCanManageEvent, roleCanScanTickets, roleIsAdmin } from '@/utils/roles';
export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  // Tracks whether the mobile dropdown menu is open. On desktop this value
  // is never even looked at by the CSS, so it has zero effect there.
  const [menuOpen, setMenuOpen] = useState(false);
  function closeMenu() {
    setMenuOpen(false);
  }
  async function handleLogout() {
    closeMenu();
    await logout();
    navigate('/');
  }
  return (
    <header className="navbar">
      <Link to="/" className="brand" onClick={closeMenu}>
        🎟️ {isHome ? 'Elite Ticketing' : 'Home'}





      </Link>
      {/* hay el hamburger 3melna hidden by css aal desktop la tbayen aal phones only */}
      <button
        className="navbar-toggle"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Toggle menu"
      >
        {menuOpen ? '✕' : '☰'}
      </button>
      <nav className={menuOpen ? 'open' : ''}>
        {!isHome && (
          <>
            <Link to="/events" onClick={closeMenu}>
              Browse Events
            </Link>
            {currentUser && (
              <Link to="/my-tickets" onClick={closeMenu}>
                My Tickets
              </Link>
            )}
            {currentUser && (
              <Link to="/rewards" onClick={closeMenu}>
                My Rewards
              </Link>
            )}
            {roleCanManageEvent(userProfile?.role) && (
              <Link to="/organizer" onClick={closeMenu}>
                Organizer
              </Link>
            )}
            {roleCanScanTickets(userProfile?.role) && (
              <Link to="/staff/scan" onClick={closeMenu}>
                Scan Tickets
              </Link>
            )}
            {roleIsAdmin(userProfile?.role) && (
              <Link to="/admin" onClick={closeMenu}>
                Admin
              </Link>
            )}
          </>
        )}
        {currentUser ? (
          <>
            {userProfile && (
              <span className="role-badge">{ROLE_LABELS[userProfile.role]}</span>
            )}
            <button className="btn secondary" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={closeMenu}>
              Log in
            </Link>
            <Link to="/register" className="btn" onClick={closeMenu}>
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}