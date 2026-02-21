import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { routes } from '../config/routes';

export function Home() {
  const { user } = useAuth();

  return (
    <div className="page home">
      <h1>Org Project</h1>
      {user ? (
        <p>
          Welcome, <strong>{user.email}</strong>.{' '}
          <Link to={routes.dashboard}>Go to Dashboard</Link>
        </p>
      ) : (
        <p>
          <Link to={routes.login}>Log in</Link> or <Link to={routes.register}>Register</Link>
        </p>
      )}
    </div>
  );
}
