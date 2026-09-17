export function formatCurrency(value) {
  const numberValue = Number(value ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numberValue);
}

export function formatAccountType(value) {
  if (!value) {
    return "Account";
  }

  return value.toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}

export function formatDate(value) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function formatShortDate(value) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function signedTransactionAmount(transaction) {
  const prefix = transaction.txn_type === "DEPOSIT" ? "+" : "-";
  return `${prefix}${formatCurrency(transaction.amount)}`;
}
