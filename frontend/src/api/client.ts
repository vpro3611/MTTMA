const getBaseUrl = () => {
  if (import.meta.env.DEV) return ''; // use Vite proxy in dev
  return import.meta.env.VITE_API_URL ?? '';
};

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const base = getBaseUrl();
  const url = path.startsWith('http') ? path : `${base}${path}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });
  return res;
}
