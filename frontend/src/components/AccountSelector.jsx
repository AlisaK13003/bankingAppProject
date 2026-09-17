import { AccountCard } from "./AccountCard";
import { EmptyState } from "./EmptyState";
import { SelectField } from "./SelectField";
import { formatAccountType } from "../playground/formatters";

// Shared by the dashboard, insights and transactions pages: up to two
// accounts show as selectable cards, more than that switches to a dropdown.
export function AccountSelector({
  accounts,
  selectedAccountId,
  setSelectedAccountId,
  emptyState,
  showSelectedCard = true,
}) {
  const selectedAccount = accounts.find(
    (item) => String(item.account_id) === String(selectedAccountId),
  );

  if (!accounts.length) {
    return (
      emptyState ?? (
        <EmptyState
          title="No accounts yet"
          message="Create an account to see balances, activity, and insights."
        />
      )
    );
  }

  if (accounts.length > 2) {
    return (
      <section className="account-selector-stack">
        <SelectField label="Selected account" value={selectedAccountId} onChange={setSelectedAccountId}>
          {accounts.map((account) => (
            <option key={account.account_id} value={account.account_id}>
              {formatAccountType(account.account_type)} · Account ID {account.account_id}
            </option>
          ))}
        </SelectField>
        {showSelectedCard ? <AccountCard account={selectedAccount} selected /> : null}
      </section>
    );
  }

  return (
    <section className={`account-card-grid app-account-grid account-count-${accounts.length}`}>
      {accounts.map((account) => (
        <AccountCard
          account={account}
          key={account.account_id}
          onSelect={(nextAccountId) => setSelectedAccountId(String(nextAccountId))}
          selected={String(account.account_id) === String(selectedAccountId)}
        />
      ))}
    </section>
  );
}
