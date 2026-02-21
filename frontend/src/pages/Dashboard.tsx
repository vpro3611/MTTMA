import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { routes } from '../config/routes';

export function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="page dashboard">
      <h1>Dashboard</h1>
      {user && (
        <div className="dashboard-user">
          <p>Signed in as <strong>{user.email}</strong></p>
          <p><small>User ID: {user.id}</small></p>
          <Link to={routes.profile(user.id)}>View profile</Link>
          <Link to={routes.organizations}>Organizations</Link>
          <Link to={routes.invitations}>Invitations</Link>
        </div>
      )}
      <nav>
        <Link to={routes.home}>Home</Link>
        <button type="button" onClick={() => logout()}>
          Log out
        </button>
      </nav>
    </div>
  );
}
