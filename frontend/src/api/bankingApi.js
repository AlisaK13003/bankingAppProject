const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const detail = typeof payload === "object" && payload !== null ? payload.detail : payload;
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  return payload;
}

export function getUserAccounts(userId) {
  return apiGet(`/api/users/${userId}/accounts`);
}

export function getAccount(accountId) {
  return apiGet(`/api/accounts/${accountId}`);
}

export function getTransactions(accountId) {
  return apiGet(`/api/accounts/${accountId}/transactions`);
}

export function getTransactionSummary(accountId) {
  return apiGet(`/api/accounts/${accountId}/transactions/summary`);
}

export function getInsights(accountId) {
  return apiGet(`/api/accounts/${accountId}/insights`);
}

export { API_BASE_URL };
