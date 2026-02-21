import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../config/routes';
import * as meApi from '../api/me';
import type { InvitationView } from '../types/invitation';

export function Invitations() {
  const [list, setList] = useState<InvitationView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = () => {
    setError(null);
    setLoading(true);
    meApi
      .getMyInvitations()
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load invitations'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAccept = async (invitationId: string) => {
    setActingId(invitationId);
    try {
      await meApi.acceptInvitation(invitationId);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Accept failed');
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (invitationId: string) => {
    setActingId(invitationId);
    try {
      await meApi.rejectInvitation(invitationId);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reject failed');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="page invitations-page">
      <nav className="page-nav">
        <Link to={routes.dashboard}>Dashboard</Link>
        <Link to={routes.home}>Home</Link>
      </nav>
      <h1>Invitations</h1>
      {error && <div className="auth-error">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : list.length === 0 ? (
        <p>You have no pending invitations.</p>
      ) : (
        <ul className="invitations-list">
          {list.map((inv) => (
            <li key={inv.id} className="invitation-item">
              <div>
                <strong>{inv.organizationName}</strong>
                <span className="inv-meta"> · {inv.membersCount} members · role: {inv.role} · {inv.status}</span>
              </div>
              <div className="inv-actions">
                <button
                  type="button"
                  onClick={() => handleAccept(inv.id)}
                  disabled={actingId !== null}
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(inv.id)}
                  disabled={actingId !== null}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
