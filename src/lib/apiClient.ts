import { unwrapList, type Paginated } from './apiTypes';

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

// ---- Token storage (sessionStorage, centralized) ----

export function getAccessToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string): void {
  sessionStorage.setItem(TOKEN_KEY, access);
  sessionStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}

export function hasTokens(): boolean {
  return !!getAccessToken() && !!getRefreshToken();
}

// ---- Config ----

function getBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
}

// ---- Error type ----

export type ApiError = {
  status: number;
  message: string;
  detail?: unknown;
  aborted?: boolean;
};

export function isApiError(e: unknown): e is ApiError {
  return typeof e === 'object' && e !== null && 'status' in e;
}

export function isAbortError(e: unknown): boolean {
  if (isApiError(e)) return e.aborted === true;
  if (e instanceof DOMException) return e.name === 'AbortError';
  return false;
}

// ---- Refresh lock (prevent multiple simultaneous refreshes) ----

let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refresh = getRefreshToken();
    if (!refresh) return false;

    try {
      const res = await fetch(`${getBaseUrl()}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      // Token rotation: replace both tokens
      setTokens(data.access, data.refresh);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ---- Auth event listeners (for redirecting to login on auth failure) ----

type AuthListener = () => void;
const authListeners: AuthListener[] = [];

export function onAuthFailure(listener: AuthListener): () => void {
  authListeners.push(listener);
  return () => {
    const i = authListeners.indexOf(listener);
    if (i >= 0) authListeners.splice(i, 1);
  };
}

function notifyAuthFailure() {
  clearTokens();
  authListeners.forEach((l) => l());
}

// ---- In-flight request deduplication for GET requests ----
// When two components (or StrictMode) fire the same GET URL simultaneously,
// they share the same Promise instead of making two network requests.

const inflight = new Map<string, Promise<unknown>>();

function dedupeKey(method: string, url: string): string | null {
  // Only deduplicate read-only requests
  if (method !== 'GET') return null;
  return `${method} ${url}`;
}

// ---- Core request function ----

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  formData?: FormData;
  skipAuth?: boolean;
  skipRetry?: boolean;
  signal?: AbortSignal;
};

async function request<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, params, formData, skipAuth, skipRetry, signal } = opts;

  const url = new URL(`${getBaseUrl()}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    });
  }

  const headers: Record<string, string> = {};
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let reqBody: BodyInit | undefined;
  if (formData) {
    reqBody = formData;
    // Do NOT set Content-Type for FormData — browser sets it with boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    reqBody = JSON.stringify(body);
  }

  const fullUrl = url.toString();

  // Check for in-flight deduplication (GET only, no custom signal)
  const dKey = dedupeKey(method, fullUrl);
  if (dKey && !signal) {
    const existing = inflight.get(dKey);
    if (existing) {
      return existing as Promise<T>;
    }
  }

  const doFetch = async (): Promise<T> => {
    const res = await fetch(fullUrl, { method, headers, body: reqBody, signal });

    if (res.status === 401 && !skipAuth && !skipRetry) {
      // Attempt token refresh once, then retry
      const refreshed = await attemptRefresh();
      if (refreshed) {
        return request<T>(path, { ...opts, skipRetry: true });
      }
      notifyAuthFailure();
      const err: ApiError = { status: 401, message: 'Session expired. Please log in again.' };
      throw err;
    }

    if (res.status === 401 && skipRetry) {
      notifyAuthFailure();
      const err: ApiError = { status: 401, message: 'Authentication required.' };
      throw err;
    }

    if (res.status >= 400) {
      let detail: unknown;
      let message = 'An error occurred';
      try {
        detail = await res.json();
        if (typeof detail === 'object' && detail !== null) {
          if ('detail' in detail && typeof detail.detail === 'string') {
            message = detail.detail;
          } else if ('message' in detail && typeof detail.message === 'string') {
            message = detail.message;
          } else if ('non_field_errors' in detail && Array.isArray(detail.non_field_errors)) {
            message = detail.non_field_errors.join(', ');
          } else {
            const entries = Object.entries(detail as Record<string, unknown>);
            if (entries.length > 0) {
              const [field, val] = entries[0];
              const valStr = Array.isArray(val) ? val.join(', ') : String(val);
              message = field === 'non_field_errors' ? valStr : `${field}: ${valStr}`;
            }
          }
        }
      } catch {
        message = res.statusText || `HTTP ${res.status}`;
      }

      const err: ApiError = { status: res.status, message, detail };
      throw err;
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return res.json() as Promise<T>;
  };

  // For deduped GETs, track the in-flight promise
  if (dKey && !signal) {
    const promise = doFetch().finally(() => {
      inflight.delete(dKey);
    });
    inflight.set(dKey, promise);
    return promise as Promise<T>;
  }

  return doFetch();
}

// ---- Convenience methods that unwrap pagination ----

export async function getList<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  signal?: AbortSignal,
): Promise<T[]> {
  const data = await request<T[] | Paginated<T>>(path, { params, signal });
  return unwrapList(data);
}

export async function getOne<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  signal?: AbortSignal,
): Promise<T> {
  return request<T>(path, { params, signal });
}

export async function postOne<T>(
  path: string,
  body?: unknown,
  formData?: FormData,
  skipAuth?: boolean,
): Promise<T> {
  return request<T>(path, { method: 'POST', body, formData, skipAuth });
}

export async function putOne<T>(path: string, body?: unknown, formData?: FormData): Promise<T> {
  return request<T>(path, { method: 'PUT', body, formData });
}

export async function patchOne<T>(path: string, body?: unknown, formData?: FormData): Promise<T> {
  return request<T>(path, { method: 'PATCH', body, formData });
}

export async function deleteOne(path: string): Promise<void> {
  await request<void>(path, { method: 'DELETE' });
}

export { request };
