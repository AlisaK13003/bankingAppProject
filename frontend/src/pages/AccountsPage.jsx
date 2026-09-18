import { useState } from "react";
import { depositToAccount, withdrawFromAccount } from "../api/bankingApi";
import {
  AccountDetailHero,
  AccountInformationCard,
  AccountSelector,
  BalanceOverviewCard,
  EmptyState,
  RecentTransactionsCard,
  SelectField,
  StatusPanel,
  TextField,
  TransactionMetricCards,
  TransactionTable,
} from "../playground/components";
import { formatAccountType, formatCurrency } from "../playground/formatters";

const WITHDRAWAL_CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Entertainment",
  "Transportation",
  "Bills",
  "Other",
];

export function AccountsPage({
  account,
  accounts,
  error,
  loading,
  onOpenAnotherAccount,
  selectedAccount,
  selectedAccountId,
  setSelectedAccountId,
  refreshData,
  setError,
  summary,
  transactions,
}) {
  const [movementType, setMovementType] = useState(null);

  return (
    <main className="page-shell accounts-page">
      <StatusPanel state="loading" message={loading ? "Loading account details..." : ""} />
      <StatusPanel state="error" message={error} />

      <section className="page-title-row">
        <div className="page-title-block">
          <h1>Your accounts</h1>
          <p>Review balances and account details, or move money in and out.</p>
        </div>
        <button className="button button-light" onClick={onOpenAnotherAccount} type="button">
          {accounts.length ? "Open another account" : "Open first account"}
        </button>
      </section>

      {accounts.length ? (
        <>
          <AccountSelector
            accounts={accounts}
            selectedAccountId={selectedAccountId}
            setSelectedAccountId={setSelectedAccountId}
          />

          <BalanceOverviewCard
            accounts={accounts}
            onDeposit={() => setMovementType("deposit")}
            onWithdraw={() => setMovementType("withdraw")}
            selectedAccount={selectedAccount}
          />

          <section className="two-column">
            <AccountDetailHero account={account} />
            <AccountInformationCard account={account} />
          </section>

          <TransactionMetricCards summary={summary} />
          <RecentTransactionsCard selectedAccount={selectedAccount} transactions={transactions} />
          <TransactionTable transactions={transactions} />
        </>
      ) : (
        <EmptyState
          title="No accounts yet"
          message="Open an account to see balances and account details here."
        />
      )}

      {movementType ? (
        <MoneyMovementModal
          account={selectedAccount}
          onClose={() => setMovementType(null)}
          onComplete={() => {
            setMovementType(null);
            refreshData();
          }}
          onError={setError}
          type={movementType}
        />
      ) : null}
    </main>
  );
}

// Local copy on purpose -- kept out of playground/components.jsx so this page
// doesn't touch the shared component file. Mirrors the same modal used on
// the Dashboard page in App.jsx.
function MoneyMovementModal({ account, onClose, onComplete, onError, type }) {
  const isDeposit = type === "deposit";
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(WITHDRAWAL_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError("Enter an amount greater than 0.");
      return;
    }

    setSubmitting(true);
    setFormError("");
    onError("");

    try {
      if (isDeposit) {
        await depositToAccount(account.account_id, {
          amount: numericAmount,
          description,
        });
      } else {
        await withdrawFromAccount(account.account_id, {
          amount: numericAmount,
          category,
          description,
        });
      }

      onComplete();
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!account) {
    return null;
  }

  return (
    <div className="modal-scrim" role="presentation">
      <form
        aria-label={isDeposit ? "Deposit money" : "Withdraw money"}
        className="money-modal-preview active-money-modal"
        onSubmit={handleSubmit}
      >
        <div className="modal-heading">
          <h3>{isDeposit ? "Deposit money" : "Withdraw money"}</h3>
          <p>{isDeposit ? "Add funds to your selected account." : "Move funds out of your selected account."}</p>
        </div>
        <div className="selected-account-preview">
          <span>{formatAccountType(account.account_type)} · Account ID {account.account_id}</span>
          <strong>{formatCurrency(account.balance)} available</strong>
        </div>
        <TextField
          label="Amount"
          onChange={setAmount}
          placeholder="0.00"
          type="number"
          value={amount}
        />
        {!isDeposit ? (
          <SelectField label="Category" onChange={setCategory} value={category}>
            {WITHDRAWAL_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>
        ) : null}
        <TextField
          label="Description (optional)"
          onChange={setDescription}
          placeholder={isDeposit ? "e.g. Cash deposit" : "e.g. Grocery Market"}
          value={description}
        />
        {formError ? <p className="modal-error">{formError}</p> : null}
        <p className="modal-note">
          {isDeposit
            ? "Deposits update the selected account balance and transaction history."
            : "Withdrawals require a positive amount and an available balance."}
        </p>
        <div className="modal-actions">
          <button className="button button-light" disabled={submitting} onClick={onClose} type="button">
            Cancel
          </button>
          <button className="button button-primary" disabled={submitting} type="submit">
            {submitting ? "Saving..." : isDeposit ? "Deposit" : "Withdraw"}
          </button>
        </div>
      </form>
    </div>
  );
}
