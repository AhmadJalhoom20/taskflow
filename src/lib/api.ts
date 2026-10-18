import { UserProfile, Project, Task, DashboardMetrics } from '@/types';

export const PRODUCTION_API_URL = 'https://taskflow-taqat.apps.taqat.academy/api';
export const LOCAL_API_URL = 'http://localhost:5001/api';

/**
 * Resolves the active backend API base URL in order of precedence:
 * 1. Runtime override from localStorage ('taskflow_api_url')
 * 2. Environment variable NEXT_PUBLIC_BACKEND_API_URL
 * 3. User production endpoint: https://taskflow-taqat.apps.taqat.academy/api
 * 4. Local development service: http://localhost:5001/api
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('taskflow_api_url');
    if (override && override.trim().length > 0) {
      return override.trim().replace(/\/+$/, '');
    }
  }

  if (process.env.NEXT_PUBLIC_BACKEND_API_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_API_URL.replace(/\/+$/, '');
  }

  // Default to production endpoint
  return PRODUCTION_API_URL;
}

export function setApiBaseUrl(url: string | null): void {
  if (typeof window === 'undefined') return;
  if (!url || url.trim().length === 0) {
    localStorage.removeItem('taskflow_api_url');
  } else {
    localStorage.setItem('taskflow_api_url', url.trim().replace(/\/+$/, ''));
  }
}

function getEndpointScope(): string {
  const base = getApiBaseUrl();
  return base.includes('5001') || base.includes('localhost') ? 'local' : 'cloud';
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const scoped = localStorage.getItem(`taskflow_auth_token_${getEndpointScope()}`);
  return scoped || localStorage.getItem('taskflow_auth_token');
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`taskflow_auth_token_${getEndpointScope()}`, token);
  localStorage.setItem('taskflow_auth_token', token);
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`taskflow_auth_token_${getEndpointScope()}`);
  localStorage.removeItem('taskflow_auth_token');
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const scoped = localStorage.getItem(`taskflow_auth_user_${getEndpointScope()}`);
    const raw = scoped || localStorage.getItem('taskflow_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserProfile | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(`taskflow_auth_user_${getEndpointScope()}`);
    localStorage.removeItem('taskflow_auth_user');
  } else {
    localStorage.setItem(`taskflow_auth_user_${getEndpointScope()}`, JSON.stringify(user));
    localStorage.setItem('taskflow_auth_user', JSON.stringify(user));
  }
}

let activeRequestCount = 0;

function notifyRequestStart() {
  activeRequestCount++;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('taskflow-request-start', { detail: { active: activeRequestCount } }));
  }
}

function notifyRequestEnd() {
  activeRequestCount = Math.max(0, activeRequestCount - 1);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('taskflow-request-end', { detail: { active: activeRequestCount } }));
  }
}

/**
 * Robust API Client with automatic failover between target domain and local service.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const primaryBase = getApiBaseUrl();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Client-Version': '3.0.0',
    'X-Request-Source': 'TaskFlow-Enterprise-Client',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const isMutation = Boolean(options.method && options.method !== 'GET');
  const timeoutMs = isMutation ? 15000 : 5000;

  // Function to execute fetch with timeout
  const executeFetch = async (baseUrl: string): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const url = `${baseUrl}${normalizedPath}`;
      const response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timer);
      return response;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  };

  notifyRequestStart();
  let res: Response;
  try {
    try {
      res = await executeFetch(primaryBase);
    } catch (primaryErr: any) {
      // If primary cloud endpoint fails (e.g. DNS unresolvable / offline), fallback to local endpoint
      if (primaryBase !== LOCAL_API_URL) {
        console.warn(`[TaskFlow API] Primary endpoint ${primaryBase} unreachable. Failing over to ${LOCAL_API_URL}...`);
        try {
          res = await executeFetch(LOCAL_API_URL);
        } catch {
          throw new Error(`Unable to connect to TaskFlow Backend (${primaryBase} or ${LOCAL_API_URL}). Please verify your network connection.`);
        }
      } else {
        throw primaryErr;
      }
    }
  } finally {
    notifyRequestEnd();
  }

  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.error) errorDetail = body.error;
      else if (body.detail) errorDetail = body.detail;
      else if (body.message) errorDetail = body.message;
    } catch {
      // response body was not JSON
    }
    throw new Error(errorDetail);
  }

  return (await res.json()) as T;
}
