import { getToken, clearToken } from "./auth";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
  });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      window.location.hash = "/signIn";
    }
    const detail = typeof payload === "object" && payload !== null ? payload.detail : payload;
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  return payload;
}

async function apiPost(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  
  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      window.location.hash = "/signIn";
    }
    const detail = typeof payload === "object" && payload !== null ? payload.detail : payload;
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  return payload;
}

// turn the transaction-history filters into a query string, skipping
// anything the user has not set
function buildQuery(filters = {}) {
  const params = new URLSearchParams();

  ["type", "category", "search", "from", "to"].forEach((key) => {
    if (filters[key]) {
      params.set(key, filters[key]);
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function getUserAccounts(userId) {
  return apiGet(`/api/users/${userId}/accounts`);
}

export function getAccount(accountId) {
  return apiGet(`/api/accounts/${accountId}`);
}

// filters are optional, so existing callers can keep passing only an id
export function getTransactions(accountId, filters) {
  return apiGet(`/api/accounts/${accountId}/transactions${buildQuery(filters)}`);
}

export function getTransactionSummary(accountId, filters) {
  const range = filters ? { from: filters.from, to: filters.to } : undefined;
  return apiGet(`/api/accounts/${accountId}/transactions/summary${buildQuery(range)}`);
}

export function getTransactionCategories(accountId) {
  return apiGet(`/api/accounts/${accountId}/transactions/categories`);
}

export function getInsights(accountId) {
  return apiGet(`/api/accounts/${accountId}/insights`);
}

export function depositToAccount(accountId, payload) {
  return apiPost(`/api/accounts/${accountId}/deposit`, payload);
}

export function withdrawFromAccount(accountId, payload) {
  return apiPost(`/api/accounts/${accountId}/withdraw`, payload);
}

export function signup(payload) {
  return apiPost("/signup", payload);
}

export function signIn(payload) {
  return apiPost("/signin", payload);
}

export function createAccount(payload) {
  return apiPost("/api/accounts", payload);
}

// The auth responses don't return a plain user_id field yet -- only a
// dashboard.account_details_path like "/api/users/7/accounts". Pull the id
// out of that path until the backend exposes it directly.
export function extractUserId(authResponse) {
  const path = authResponse?.dashboard?.account_details_path ?? "";
  const match = path.match(/\/api\/users\/(\d+)\/accounts/);
  return match ? Number(match[1]) : null;
}

export { API_BASE_URL };
