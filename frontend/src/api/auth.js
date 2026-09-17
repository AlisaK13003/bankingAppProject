const TOKEN_KEY = "banking_app_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Reads the user id out of the stored token's own payload, without
// verifying its signature -- this is purely so the UI can rehydrate
// `userId` after a page refresh. The backend is what actually verifies the
// token; nothing security-sensitive should ever rely on this.
export function getUserIdFromToken() {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const [, payload] = token.split(".");
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}