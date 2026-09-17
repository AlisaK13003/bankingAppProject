import { AccountSelector } from "../components/AccountSelector";
import {
  CashFlowChartCard,
  EmptyState,
  SpendingByCategoryCard,
  StatusPanel,
  SummaryCard,
  TrendsCard,
} from "../components";
import { formatCurrency } from "../playground/formatters";

export function InsightsPage({
  accounts,
  error,
  insights,
  loading,
  selectedAccountId,
  setSelectedAccountId,
  summary,
}) {
  const insightSummary = insights?.summary;
  const metrics = insightSummary
    ? {
        deposits: insightSummary.total_deposits,
        withdrawals: insightSummary.total_withdrawals,
        net_change: insightSummary.net_change,
      }
    : summary;

  return (
    <main className="page-shell insights-page">
      <StatusPanel state="loading" message={loading ? "Loading banking insights..." : ""} />
      <StatusPanel state="error" message={error} />

      <section className="heading-row">
        <div className="page-title-block">
          <h1>Banking insights</h1>
          <p>Select an account to view its activity and trends.</p>
        </div>
        <span className="back-link">← Account details</span>
      </section>

      <AccountSelector
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        setSelectedAccountId={setSelectedAccountId}
      />

      <section className="last-30-days">
        <h2>Last 30 days</h2>
        <InsightsMetricCards summary={metrics} />
      </section>

      {accounts.length ? (
        <section className="insights-grid app-insights-grid">
          <SpendingByCategoryCard categories={insights?.spending_by_category ?? []} />
          <div className="insights-stack">
            <CashFlowChartCard cashFlow={insights?.monthly_cash_flow ?? []} />
            <TrendsCard trends={insights?.trends} />
          </div>
        </section>
      ) : (
        <EmptyState title="No accounts yet" message="Open an account to populate banking insights." />
      )}
    </main>
  );
}

function InsightsMetricCards({ summary }) {
  return (
    <div className="metric-grid insights-metric-grid">
      <SummaryCard
        detail=""
        title="Deposits"
        tone="positive"
        value={`+${formatCurrency(summary?.deposits)}`}
      />
      <SummaryCard
        detail=""
        title="Withdrawals"
        tone="neutral"
        value={`-${formatCurrency(summary?.withdrawals)}`}
      />
      <SummaryCard
        detail=""
        title="Net change"
        tone="accent"
        value={formatSignedCurrency(summary?.net_change)}
      />
    </div>
  );
}

function formatSignedCurrency(value) {
  const numberValue = Number(value ?? 0);
  const prefix = numberValue >= 0 ? "+" : "-";
  return `${prefix}${formatCurrency(Math.abs(numberValue))}`;
}
