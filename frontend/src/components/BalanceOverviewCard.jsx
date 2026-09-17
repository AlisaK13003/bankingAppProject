import { formatAccountType, formatCurrency } from "../playground/formatters";
import { Button } from "./Button";

export function BalanceOverviewCard({ accounts, selectedAccount, onDeposit, onWithdraw }) {
  const totalBalance = accounts.reduce((total, account) => total + Number(account.balance ?? 0), 0);

  return (
    <section className="balance-overview">
      <div className="balance-summary">
        <span>Total balance</span>
        <strong>{formatCurrency(totalBalance)}</strong>
        <span>Across all accounts</span>
        <span className="pill">{accounts.length} {accounts.length === 1 ? "account" : "accounts"}</span>
      </div>
      <div className="selected-actions">
        <span>Selected account</span>
        <strong>
          {selectedAccount
            ? `${formatAccountType(selectedAccount.account_type)} · Account ID ${selectedAccount.account_id}`
            : "No account selected"}
        </strong>
        <div className="quick-actions">
          <Button disabled={!selectedAccount} onClick={onDeposit} variant="light">Deposit</Button>
          <Button disabled={!selectedAccount} onClick={onWithdraw} variant="light">Withdraw</Button>
        </div>
      </div>
    </section>
  );
}
