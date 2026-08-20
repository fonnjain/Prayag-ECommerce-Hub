import { useAuthStore } from "./store";

export function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Adds the current bearer token to direct API calls and clears an expired,
 * deleted, or deactivated account session after a 401 response.
 */
export async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = useAuthStore.getState().token;
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, { ...init, headers });
  if (response.status === 401 && token) {
    useAuthStore.getState().logout();
  }
  return response;
}