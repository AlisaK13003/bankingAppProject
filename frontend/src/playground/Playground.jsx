import { useEffect, useMemo, useState } from "react";
import {
  API_BASE_URL,
  getAccount,
  getInsights,
  getTransactionSummary,
  getTransactions,
  getUserAccounts,
} from "../api/bankingApi";
import {
  AccountCard,
  AccountDetailHero,
  AccountInformationCard,
  BalanceOverviewCard,
  Button,
  CashFlowChartCard,
  ComponentPrimitivesPreview,
  RecentTransactionsCard,
  SelectField,
  SpendingByCategoryCard,
  StatusPanel,
  TextField,
  TransactionMetricCards,
  TransactionTable,
  TrendsCard,
} from "./components";

export function Playground() {
  const [userId, setUserId] = useState("1");
  const [accountId, setAccountId] = useState("1");
  const [userAccounts, setUserAccounts] = useState(null);
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadUserAccounts() {
      if (!userId) {
        setUserAccounts(null);
        return;
      }

      try {
        const payload = await getUserAccounts(userId);
        if (!active) {
          return;
        }

        setUserAccounts(payload);
        if (payload.accounts.length && !payload.accounts.some((item) => String(item.account_id) === String(accountId))) {
          setAccountId(String(payload.accounts[0].account_id));
        }
      } catch (requestError) {
        if (!active) {
          return;
        }
        setUserAccounts(null);
        setError(`User accounts: ${requestError.message}`);
      }
    }

    loadUserAccounts();

    return () => {
      active = false;
    };
  }, [userId, refreshKey]);

  useEffect(() => {
    let active = true;

    async function loadAccountData() {
      if (!accountId) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [accountPayload, transactionPayload, summaryPayload, insightsPayload] = await Promise.all([
          getAccount(accountId),
          getTransactions(accountId),
          getTransactionSummary(accountId),
          getInsights(accountId),
        ]);

        if (!active) {
          return;
        }

        setAccount(accountPayload);
        setTransactions(transactionPayload);
        setSummary(summaryPayload);
        setInsights(insightsPayload);
      } catch (requestError) {
        if (!active) {
          return;
        }

        setAccount(null);
        setTransactions(null);
        setSummary(null);
        setInsights(null);
        setError(requestError.message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAccountData();

    return () => {
      active = false;
    };
  }, [accountId, refreshKey]);

  const accounts = userAccounts?.accounts ?? [];
  const transactionRows = transactions?.transactions ?? [];
  const selectedAccount = useMemo(
    () => accounts.find((item) => String(item.account_id) === String(accountId)) ?? account,
    [accounts, account, accountId],
  );

  return (
    <main className="playground-shell">
      <header className="playground-header">
        <div>
          <p className="eyebrow">Frontend development playground</p>
          <h1>Banking components</h1>
          <p>
            Figma-inspired React components wired to the existing FastAPI endpoints at {API_BASE_URL}.
          </p>
        </div>
        <Button onClick={() => setRefreshKey((key) => key + 1)}>Refresh data</Button>
      </header>

      <section className="controls-panel">
        <TextField label="User ID" value={userId} onChange={setUserId} type="number" />
        {accounts.length ? (
          <SelectField label="Account / Account ID" value={accountId} onChange={setAccountId}>
            {accounts.map((item) => (
              <option key={item.account_id} value={item.account_id}>
                {item.account_type} · {item.account_id}
              </option>
            ))}
          </SelectField>
        ) : (
          <TextField label="Account / Account ID" value={accountId} onChange={setAccountId} type="number" />
        )}
      </section>

      <StatusPanel state="loading" message={loading ? "Loading backend data..." : ""} />
      <StatusPanel state="error" message={error} />

      <PlaygroundSection title="Component Primitives">
        <ComponentPrimitivesPreview />
      </PlaygroundSection>

      <PlaygroundSection title="Account">
        <div className="account-card-grid">
          {accounts.length ? (
            accounts.map((item) => (
              <AccountCard
                account={item}
                key={item.account_id}
                onSelect={(nextAccountId) => setAccountId(String(nextAccountId))}
                selected={String(item.account_id) === String(accountId)}
              />
            ))
          ) : (
            <AccountCard />
          )}
        </div>
        <BalanceOverviewCard accounts={accounts} selectedAccount={selectedAccount} />
        <div className="two-column">
          <AccountDetailHero account={account} />
          <AccountInformationCard account={account} />
        </div>
      </PlaygroundSection>

      <PlaygroundSection title="Transactions">
        <TransactionMetricCards summary={summary} />
        <RecentTransactionsCard transactions={transactionRows} />
        <TransactionTable transactions={transactionRows} />
      </PlaygroundSection>

      <PlaygroundSection title="Banking Insights">
        <div className="insights-grid">
          <SpendingByCategoryCard categories={insights?.spending_by_category ?? []} />
          <div className="insights-stack">
            <CashFlowChartCard cashFlow={insights?.monthly_cash_flow ?? []} />
            <TrendsCard trends={insights?.trends} />
          </div>
        </div>
      </PlaygroundSection>
    </main>
  );
}

function PlaygroundSection({ title, children }) {
  return (
    <section className="playground-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
