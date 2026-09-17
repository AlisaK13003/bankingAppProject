import { formatAccountType, formatCurrency } from "../playground/formatters";

export function AccountCard({ account, selected, onSelect }) {
  if (!account) {
    return (
      <div className="account-empty">
        <strong>No accounts loaded</strong>
        <span>Enter a user ID with seeded accounts or type an account ID manually.</span>
      </div>
    );
  }

  return (
    <button
      className={`account-card ${selected ? "account-card-selected" : ""}`}
      type="button"
      onClick={() => onSelect?.(account.account_id)}
    >
      <span className="account-meta">
        <span className="account-card-heading">
          <span className="account-type">{formatAccountType(account.account_type)}</span>
          {selected ? <strong>Selected</strong> : null}
        </span>
        <span className="muted">Account ID {account.account_id}</span>
      </span>
      <span className="account-balance">
        <span>{formatCurrency(account.balance)}</span>
        <span className="muted">Available balance</span>
      </span>
    </button>
  );
}
