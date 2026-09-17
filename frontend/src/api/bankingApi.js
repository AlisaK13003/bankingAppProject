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

async function apiPost(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
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

export { API_BASE_URL };
