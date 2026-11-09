
 {/*Hay lal error isa hada fet 3a an old ticket link aw katab typo bel url. If I ever want
          to fix it, either change this text to "Back to home", or change
          the link below to "/events" so it actually goes to Browse Events. */}




import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/" className="btn">
        Back to events
      </Link>
    </div>
  );
}
