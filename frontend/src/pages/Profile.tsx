import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { routes } from '../config/routes';
import * as meApi from '../api/me';
import type { User } from '../types/user';

export function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, loading: authLoading, updateUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changePassError, setChangePassError] = useState<string | null>(null);
  const [changeEmailError, setChangeEmailError] = useState<string | null>(null);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [submittingPass, setSubmittingPass] = useState(false);
  const [submittingEmail, setSubmittingEmail] = useState(false);

  const isSelf = currentUser && userId === currentUser.id;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    meApi
      .getProfile(userId)
      .then((data) => {
        if (!cancelled) {
          setProfile(data);
          if (isSelf && data.email) setNewEmail(data.email);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load profile');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, isSelf]);

  useEffect(() => {
    if (profile?.email && isSelf) setNewEmail(profile.email);
  }, [profile?.email, isSelf]);

  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePassError(null);
    setSubmittingPass(true);
    try {
      const updated = await meApi.changePassword({ old_pass: oldPass, new_pass: newPass });
      setProfile(updated);
      setOldPass('');
      setNewPass('');
    } catch (e) {
      setChangePassError(e instanceof Error ? e.message : 'Change password failed');
    } finally {
      setSubmittingPass(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeEmailError(null);
    setSubmittingEmail(true);
    try {
      const updated = await meApi.changeEmail({ new_email: newEmail });
      setProfile(updated);
      setChangeEmailError(null);
      if (currentUser?.id === updated.id) updateUser(updated);
    } catch (e) {
      setChangeEmailError(e instanceof Error ? e.message : 'Change email failed');
    } finally {
      setSubmittingEmail(false);
    }
  };

  if (authLoading || !userId) {
    return (
      <div className="page">
        <p>Loading…</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <p>Loading profile…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="page">
        <p className="auth-error">{error ?? 'Profile not found'}</p>
        <Link to={routes.dashboard}>Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="page profile-page">
      <nav className="page-nav">
        <Link to={routes.dashboard}>Dashboard</Link>
        <Link to={routes.home}>Home</Link>
      </nav>
      <h1>Profile</h1>
      <dl className="profile-dl">
        <dt>Email</dt>
        <dd>{profile.email}</dd>
        <dt>Status</dt>
        <dd>{profile.status}</dd>
        <dt>User ID</dt>
        <dd><code>{profile.id}</code></dd>
      </dl>

      {isSelf && (
        <>
          <section className="profile-section">
            <h2>Change password</h2>
            <form onSubmit={handleChangePass} className="auth-form">
              {changePassError && <div className="auth-error">{changePassError}</div>}
              <label>
                Current password
                <input
                  type="password"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  required
                  minLength={10}
                  maxLength={255}
                  autoComplete="current-password"
                />
              </label>
              <label>
                New password (min 10 characters)
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  required
                  minLength={10}
                  maxLength={255}
                  autoComplete="new-password"
                />
              </label>
              <button type="submit" disabled={submittingPass}>
                {submittingPass ? 'Saving…' : 'Change password'}
              </button>
            </form>
          </section>
          <section className="profile-section">
            <h2>Change email</h2>
            <form onSubmit={handleChangeEmail} className="auth-form">
              {changeEmailError && <div className="auth-error">{changeEmailError}</div>}
              <label>
                New email
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  minLength={5}
                  maxLength={255}
                  autoComplete="email"
                />
              </label>
              <button type="submit" disabled={submittingEmail}>
                {submittingEmail ? 'Saving…' : 'Change email'}
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
