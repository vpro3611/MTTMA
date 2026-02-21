import { apiFetch, setAccessToken } from './client';
import { apiPaths } from '../config/api';
import type { AuthResponse, LoginInput, RegisterInput } from '../types/user';

export async function register(body: RegisterInput): Promise<AuthResponse> {
  const res = await apiFetch(apiPaths.pub.register, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Register failed: ${res.status}`);
  }
  const data: AuthResponse = await res.json();
  setAccessToken(data.accessToken);
  return data;
}

export async function login(body: LoginInput): Promise<AuthResponse> {
  const res = await apiFetch(apiPaths.pub.login, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Login failed: ${res.status}`);
  }
  const data: AuthResponse = await res.json();
  setAccessToken(data.accessToken);
  return data;
}

export async function refresh(): Promise<{ accessToken: string }> {
  const res = await apiFetch(apiPaths.pub.refresh, { method: 'POST' });
  if (!res.ok) {
    setAccessToken(null);
    throw new Error('Session expired');
  }
  const data = await res.json();
  setAccessToken(data.accessToken);
  return data;
}

export async function logout(): Promise<void> {
  const res = await apiFetch(apiPaths.me.logout, { method: 'POST' });
  setAccessToken(null);
  if (!res.ok && res.status !== 401) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Logout failed');
  }
}
