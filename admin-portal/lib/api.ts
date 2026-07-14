/**
 * Admin Portal API client
 * Communicates exclusively with the Django REST API backend.
 * All business logic stays in Django — this is a thin HTTP client only.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Token management (localStorage in browser only)
// ---------------------------------------------------------------------------

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mabel_access_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mabel_refresh_token");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("mabel_access_token", access);
  localStorage.setItem("mabel_refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("mabel_access_token");
  localStorage.removeItem("mabel_refresh_token");
}

// ---------------------------------------------------------------------------
// Core fetch wrapper with JWT auto-refresh
// ---------------------------------------------------------------------------

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

let isRefreshing = false;
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: Error) => void }> = [];

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();
    const newAccess = data.access;
    if (data.refresh) {
      setTokens(newAccess, data.refresh);
    } else {
      localStorage.setItem("mabel_access_token", newAccess);
    }
    return newAccess;
  } catch {
    clearTokens();
    return null;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Attach Authorization header for authenticated requests
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(fetchOptions.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  // Set up 15-second abort timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let res: Response;
  try {
    res = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please check the network connection.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  // Handle 401 — attempt token refresh once
  if (res.status === 401 && !skipAuth) {
    if (!isRefreshing) {
      isRefreshing = true;
      let newToken: string | null = null;
      try {
        newToken = await refreshAccessToken();
      } catch (err) {
        console.error("Token refresh failed with exception:", err);
      } finally {
        isRefreshing = false;
        // Resolve or reject all queued requests
        if (newToken) {
          refreshQueue.forEach((item) => item.resolve(newToken as string));
        } else {
          refreshQueue.forEach((item) =>
            item.reject(new Error("Session expired. Please log in again."))
          );
        }
        refreshQueue = [];
      }

      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        // Re-attempt request with 15s timeout
        const retryController = new AbortController();
        const retryTimeoutId = setTimeout(() => retryController.abort(), 15000);
        try {
          res = await fetch(url, {
            ...fetchOptions,
            headers,
            signal: retryController.signal,
          });
        } catch (err: any) {
          if (err.name === "AbortError") {
            throw new Error("Request timed out. Please check the network connection.");
          }
          throw err;
        } finally {
          clearTimeout(retryTimeoutId);
        }
      } else {
        // Token refresh failed — redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Session expired. Please log in again.");
      }
    } else {
      // Queue additional requests while refresh is in progress
      const token = await new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      });

      headers["Authorization"] = `Bearer ${token}`;

      const retryController = new AbortController();
      const retryTimeoutId = setTimeout(() => retryController.abort(), 15000);
      try {
        res = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: retryController.signal,
        });
      } catch (err: any) {
        if (err.name === "AbortError") {
          throw new Error("Request timed out. Please check the network connection.");
        }
        throw err;
      } finally {
        clearTimeout(retryTimeoutId);
      }
    }
  }

  if (!res.ok) {
    let errorData: any = {};
    try {
      errorData = await res.json();
    } catch {}
    const message =
      errorData?.detail ||
      errorData?.error ||
      errorData?.non_field_errors?.[0] ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  // Return empty object for 204 No Content
  if (res.status === 204) return {} as T;

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Convenience methods
// ---------------------------------------------------------------------------

export const api = {
  get: <T = unknown>(path: string, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: "GET", ...opts }),

  post: <T = unknown>(path: string, body?: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...opts,
    }),

  patch: <T = unknown>(path: string, body?: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...opts,
    }),

  put: <T = unknown>(path: string, body?: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...opts,
    }),

  delete: <T = unknown>(path: string, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: "DELETE", ...opts }),
};

export { API_BASE_URL };
