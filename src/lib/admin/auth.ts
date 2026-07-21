/**
 * Authentication utilities for the Admin Portal (merged into main frontend).
 * Handles login, logout, token storage and verification.
 */

import { api, setTokens, clearTokens, getAccessToken } from "./api";

export interface AuthUser {
  user_id: number;
  username: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

/**
 * Attempts login with username and password.
 * Stores JWT tokens in localStorage on success.
 * Returns the decoded user info.
 */
export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const data = await api.post<TokenResponse>(
    "/api/auth/token/",
    credentials,
    { skipAuth: true }
  );

  setTokens(data.access, data.refresh);

  const user = decodeJwtPayload(data.access);
  if (!user) throw new Error("Invalid token received from server.");
  return user;
}

/**
 * Verifies the current access token is still valid.
 * Returns user info from the token payload, or null if invalid.
 */
export async function verifySession(): Promise<AuthUser | null> {
  const token = getAccessToken();
  if (!token) return null;

  try {
    await api.post("/api/auth/token/verify/", { token }, { skipAuth: true });
    return decodeJwtPayload(token);
  } catch {
    clearTokens();
    return null;
  }
}

/**
 * Logs out by clearing all stored tokens and redirecting to admin login.
 */
export function logout(): void {
  clearTokens();
  if (typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }
}

/**
 * Returns true if there is a stored access token (best-effort check).
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Decodes the JWT payload without verification (for display only).
 * Server-side verification is always done via the verify endpoint.
 */
function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return {
      user_id: payload.user_id,
      username: payload.username || "",
      is_staff: payload.is_staff ?? false,
      is_superuser: payload.is_superuser ?? false,
    };
  } catch {
    return null;
  }
}

/**
 * Checks if the current user profile contains a given permission string.
 * Automatically grants access for superusers.
 */
export function hasPermission(permission: string): boolean {
  if (typeof window === "undefined") return false;
  const profileStr = sessionStorage.getItem("mabel_user_profile");
  if (!profileStr) return false;
  try {
    const profile = JSON.parse(profileStr);
    if (profile.is_superuser || profile.is_staff) return true;
    const userPerms: string[] = profile.permissions || [];
    return userPerms.includes(permission) || userPerms.includes("*");
  } catch {
    return false;
  }
}
