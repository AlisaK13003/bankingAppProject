import { useState } from "react";
import { AccountSelector } from "../components/AccountSelector";
import {
  BalanceOverviewCard,
  MoneyMovementModal,
  RecentTransactionsCard,
  StatusPanel,
  SummaryCard,
} from "../components";
import { formatAccountType, formatCurrency } from "../playground/formatters";

export function DashboardPage({
  accounts,
  error,
  loading,
  selectedAccount,
  selectedAccountId,
  setSelectedAccountId,
  refreshData,
  setError,
  summary,
  transactions,
  user,
}) {
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const [movementType, setMovementType] = useState(null);

  return (
    <main className="page-shell dashboard-page">
      <StatusPanel state="loading" message={loading ? "Loading banking data..." : ""} />
      <StatusPanel state="error" message={error} />

      <section className="page-title-block">
        <h1>Welcome back, {firstName.toLowerCase()}</h1>
        <p>Here&apos;s a snapshot of your accounts and recent activity.</p>
      </section>

      <section className="dashboard-overview-row">
        <BalanceOverviewCard
          accounts={accounts}
          onDeposit={() => setMovementType("deposit")}
          onWithdraw={() => setMovementType("withdraw")}
          selectedAccount={selectedAccount}
        />
        <DashboardSummaryCard selectedAccount={selectedAccount} summary={summary} />
      </section>

      <AccountSelector
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        setSelectedAccountId={setSelectedAccountId}
      />

      <RecentTransactionsCard selectedAccount={selectedAccount} transactions={transactions} />
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

function DashboardSummaryCard({ selectedAccount, summary }) {
  if (!selectedAccount) {
    return (
      <SummaryCard
        detail="Open an account to begin tracking activity."
        title="Account summary"
        value="$0.00"
      />
    );
  }

  return (
    <section className="summary-card dashboard-summary-card">
      <div className="dashboard-summary-heading">
        <h2>{formatAccountType(selectedAccount.account_type)} summary</h2>
        <span>This month · Account ID {selectedAccount.account_id}</span>
      </div>
      <div className="dashboard-summary-stats">
        <SummaryStat label="Deposits" tone="positive" value={`+${formatCurrency(summary?.deposits)}`} />
        <SummaryStat label="Withdrawals" value={`-${formatCurrency(summary?.withdrawals)}`} />
        <SummaryStat
          label="Net change"
          tone="accent"
          value={formatSignedCurrency(summary?.net_change)}
        />
      </div>
    </section>
  );
}

function SummaryStat({ label, value, tone = "" }) {
  return (
    <div className="summary-stat">
      <span>{label}</span>
      <strong className={tone ? `amount-${tone}` : ""}>{value}</strong>
    </div>
  );
}

function formatSignedCurrency(value) {
  const numberValue = Number(value ?? 0);
  const prefix = numberValue >= 0 ? "+" : "-";
  return `${prefix}${formatCurrency(Math.abs(numberValue))}`;
}
