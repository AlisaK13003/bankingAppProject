import { useEffect, useMemo, useState } from "react";
import {
  getAccount,
  getInsights,
  getTransactionSummary,
  getTransactions,
  getUserAccounts,
} from "./api/bankingApi";
import {
  AccountCard,
  BalanceOverviewCard,
  EmptyState,
  RecentTransactionsCard,
  SelectField,
  SpendingByCategoryCard,
  StatusPanel,
  SummaryCard,
  CashFlowChartCard,
  TrendsCard,
} from "./playground/components";
import { formatAccountType, formatCurrency } from "./playground/formatters";

const ROUTES = {
  dashboard: "dashboard",
  insights: "insights",
};

function getInitialRoute() {
  const hashRoute = window.location.hash.replace(/^#\/?/, "");
  return Object.values(ROUTES).includes(hashRoute) ? hashRoute : ROUTES.dashboard;
}

function getInitialUserId() {
  return new URLSearchParams(window.location.search).get("userId") || "1";
}

export function App() {
  const [route, setRoute] = useState(getInitialRoute);
  const bankingData = useBankingData(getInitialUserId());

  useEffect(() => {
    function handleHashChange() {
      setRoute(getInitialRoute());
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function handleRouteChange(nextRoute) {
    if (!Object.values(ROUTES).includes(nextRoute)) {
      return;
    }

    window.location.hash = `/${nextRoute}`;
    setRoute(nextRoute);
  }

  return (
    <div className="app-shell">
      <AppHeader activeRoute={route} onRouteChange={handleRouteChange} />
      {route === ROUTES.insights ? (
        <InsightsPage {...bankingData} />
      ) : (
        <DashboardPage {...bankingData} />
      )}
    </div>
  );
}

function useBankingData(userId) {
  const [accountsPayload, setAccountsPayload] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAccounts() {
      setLoading(true);
      setError("");

      try {
        const payload = await getUserAccounts(userId);
        if (!active) {
          return;
        }

        setAccountsPayload(payload);
        const firstAccountId = payload.accounts[0]?.account_id;
        setSelectedAccountId((currentAccountId) => {
          const currentStillExists = payload.accounts.some(
            (item) => String(item.account_id) === String(currentAccountId),
          );
          return currentStillExists ? currentAccountId : firstAccountId ? String(firstAccountId) : "";
        });
      } catch (requestError) {
        if (!active) {
          return;
        }

        setAccountsPayload(null);
        setSelectedAccountId("");
        setError(requestError.message);
        setLoading(false);
      }
    }

    loadAccounts();

    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    let active = true;

    async function loadSelectedAccount() {
      if (!selectedAccountId) {
        setAccount(null);
        setTransactions([]);
        setSummary(null);
        setInsights(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [accountPayload, transactionsPayload, summaryPayload, insightsPayload] = await Promise.all([
          getAccount(selectedAccountId),
          getTransactions(selectedAccountId),
          getTransactionSummary(selectedAccountId),
          getInsights(selectedAccountId),
        ]);

        if (!active) {
          return;
        }

        setAccount(accountPayload);
        setTransactions(transactionsPayload.transactions ?? []);
        setSummary(summaryPayload);
        setInsights(insightsPayload);
      } catch (requestError) {
        if (!active) {
          return;
        }

        setAccount(null);
        setTransactions([]);
        setSummary(null);
        setInsights(null);
        setError(requestError.message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSelectedAccount();

    return () => {
      active = false;
    };
  }, [selectedAccountId]);

  const accounts = accountsPayload?.accounts ?? [];
  const user = accountsPayload?.user ?? account?.user ?? null;
  const selectedAccount = useMemo(
    () => accounts.find((item) => String(item.account_id) === String(selectedAccountId)) ?? account,
    [account, accounts, selectedAccountId],
  );

  return {
    account,
    accounts,
    error,
    insights,
    loading,
    selectedAccount,
    selectedAccountId,
    setSelectedAccountId,
    summary,
    transactions,
    user,
    userId,
  };
}

function AppHeader({ activeRoute, onRouteChange }) {
  const navItems = [
    { label: "Dashboard", route: ROUTES.dashboard, enabled: true },
    { label: "Transactions", route: "transactions", enabled: false },
    { label: "Insights", route: ROUTES.insights, enabled: true },
    { label: "Accounts", route: "accounts", enabled: false },
  ];

  return (
    <header className="app-header">
      <div className="brand-preview">
        <span className="brand-mark" />
        <strong>POLARIS BANK</strong>
      </div>
      <nav className="app-nav" aria-label="Application navigation">
        {navItems.map((item) => (
          <button
            aria-current={activeRoute === item.route ? "page" : undefined}
            className={`app-nav-item ${activeRoute === item.route ? "app-nav-item-active" : ""}`}
            disabled={!item.enabled}
            key={item.label}
            onClick={() => onRouteChange(item.route)}
            type="button"
          >
            {item.label}
          </button>
        ))}
        <button className="sign-out-button" disabled type="button">
          Sign out
        </button>
      </nav>
    </header>
  );
}

function DashboardPage({
  accounts,
  error,
  loading,
  selectedAccount,
  selectedAccountId,
  setSelectedAccountId,
  summary,
  transactions,
  user,
}) {
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <main className="page-shell dashboard-page">
      <StatusPanel state="loading" message={loading ? "Loading banking data..." : ""} />
      <StatusPanel state="error" message={error} />

      <section className="page-title-block">
        <h1>Welcome back, {firstName.toLowerCase()}</h1>
        <p>Here&apos;s a snapshot of your accounts and recent activity.</p>
      </section>

      <section className="dashboard-overview-row">
        <BalanceOverviewCard accounts={accounts} selectedAccount={selectedAccount} />
        <DashboardSummaryCard selectedAccount={selectedAccount} summary={summary} />
      </section>

      <AccountSelector
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        setSelectedAccountId={setSelectedAccountId}
      />

      <RecentTransactionsCard selectedAccount={selectedAccount} transactions={transactions} />
    </main>
  );
}

function InsightsPage({
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

function SummaryStat({ label, value, tone = "" }) {
  return (
    <div className="summary-stat">
      <span>{label}</span>
      <strong className={tone ? `amount-${tone}` : ""}>{value}</strong>
    </div>
  );
}

function AccountSelector({ accounts, selectedAccountId, setSelectedAccountId }) {
  const selectedAccount = accounts.find((item) => String(item.account_id) === String(selectedAccountId));

  if (!accounts.length) {
    return <EmptyState title="No accounts yet" message="Create an account to see balances, activity, and insights." />;
  }

  if (accounts.length > 2) {
    return (
      <section className="account-selector-stack">
        <SelectField label="Account" value={selectedAccountId} onChange={setSelectedAccountId}>
          {accounts.map((account) => (
            <option key={account.account_id} value={account.account_id}>
              {formatAccountType(account.account_type)} · Account ID {account.account_id}
            </option>
          ))}
        </SelectField>
        <AccountCard account={selectedAccount} selected />
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

function formatSignedCurrency(value) {
  const numberValue = Number(value ?? 0);
  const prefix = numberValue >= 0 ? "+" : "-";
  return `${prefix}${formatCurrency(Math.abs(numberValue))}`;
}
