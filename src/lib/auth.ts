/**
 * Toutes les opérations Neon Auth passent par le serveur Express (/api/auth/*)
 * pour éviter le blocage HTTP→HTTPS (403 Forbidden depuis un origin non-HTTPS).
 */

// ── Helpers stockage token ────────────────────────────────────────────────────

export function getStoredToken(): string | null {
  return sessionStorage.getItem('neon_auth_token');
}

function storeToken(token: string) {
  sessionStorage.setItem('neon_auth_token', token);
}

function clearToken() {
  sessionStorage.removeItem('neon_auth_token');
}

// ── API proxy toutes les requêtes auth passent par /api/auth/* ───────────────

async function authPost(path: string, body: object): Promise<any> {
  const r = await fetch(`/api/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const rawText = await r.text().catch(() => '');
  let data: any = {};
  try { data = JSON.parse(rawText); } catch {}
  if (!r.ok) {
    const msg = data?.error || data?.message || rawText || `Erreur ${r.status}`;
    const err = new Error(msg);
    (err as any).status = r.status;
    (err as any).raw = rawText;
    throw err;
  }
  return data;
}

// ── Fonctions publiques ───────────────────────────────────────────────────────

/** Inscription le serveur appelle Neon Auth en HTTPS */
export async function signUpNeon(email: string, password: string, name: string) {
  const data = await authPost('register', { email, password, name });
  if (data?.token) storeToken(data.token);
  return data;
}

/** Connexion le serveur appelle Neon Auth en HTTPS */
export async function signInNeon(email: string, password: string) {
  const data = await authPost('signin', { email, password });
  if (data?.token) storeToken(data.token);
  return data;
}

/** Déconnexion */
export async function signOutNeon() {
  clearToken();
  localStorage.removeItem('is_admin');
  localStorage.removeItem('parent_session');
  try { await authPost('signout', {}); } catch {}
}

/** Demande de reset password */
export async function forgotPasswordNeon(email: string) {
  return authPost('forgot-password', { email });
}

/** Vérifie si une session valide existe au démarrage de l'app */
export async function checkSession(): Promise<boolean> {
  const token = getStoredToken();
  if (!token) return false;
  try {
    const r = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return r.ok;
  } catch {
    return false;
  }
}

/** fetch authentifié vers l'API Express ajoute automatiquement le Bearer */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();
  const isFormData = options.body instanceof FormData;
  return fetch(path, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}

// Alias conservé pour compatibilité
export const getAuthToken = getStoredToken;
