const DEFAULT_BACKEND_PORT = "8000";

/**
 * Resolves the backend base URL.
 *
 * When VITE_BACKEND_IP is configured at build time it is used as-is. Otherwise
 * we fall back to the host the app was actually served from (instead of
 * "localhost"), so the app keeps working when opened from another device on the
 * network. Using "localhost" as a fallback would make a remote browser try to
 * reach its own machine.
 */
export function getApiBase(): string {
  const configured = import.meta.env.VITE_BACKEND_IP?.trim();
  const rawBase =
    configured || `${window.location.protocol}//${window.location.hostname}:${DEFAULT_BACKEND_PORT}`;

  const normalizedBase = rawBase.match(/^https?:\/\//)
    ? rawBase
    : `http://${rawBase}`;

  return normalizedBase.endsWith("/")
    ? normalizedBase.slice(0, -1)
    : normalizedBase;
}

/**
 * Resolves the backend WebSocket base URL (ws:// or wss://) derived from the
 * API base, so it follows the same host/protocol rules.
 */
export function getWsBase(): string {
  const url = new URL(getApiBase());
  const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
  return `${wsProtocol}//${url.host}`;
}
