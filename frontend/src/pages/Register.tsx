import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { routes } from '../config/routes';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await register(email, password);
      navigate(routes.dashboard, { replace: true });
    } catch {
      // error set in context
    }
  };

  return (
    <div className="page auth-page">
      <h1>Register</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error">{error}</div>}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            minLength={5}
            maxLength={255}
            autoComplete="email"
          />
        </label>
        <label>
          Password (min 10 characters)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={10}
            maxLength={255}
            autoComplete="new-password"
          />
        </label>
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to={routes.login}>Log in</Link>
      </p>
    </div>
  );
}
