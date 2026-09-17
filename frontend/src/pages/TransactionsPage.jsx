import { useEffect, useMemo, useState } from "react";
import { getTransactionCategories, getTransactions } from "../api/bankingApi";
import { AccountSelector } from "../components/AccountSelector";
import { StatusPanel } from "../components";
import {
  formatAccountType,
  formatCurrency,
  formatDate,
  signedTransactionAmount,
} from "../playground/formatters";

const MONTH_COUNT = 6;
const SEARCH_DEBOUNCE_MS = 300;

export function TransactionsPage({
  accounts,
  error,
  onBackToAccount,
  onOpenFirstAccount,
  selectedAccount,
  selectedAccountId,
  setSelectedAccountId,
}) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const monthOptions = useMemo(() => buildMonthOptions(MONTH_COUNT), []);
  const [month, setMonth] = useState(monthOptions[0].value);

  const [loadingRows, setLoadingRows] = useState(false);
  const [rowsError, setRowsError] = useState("");

  const selectedMonth = monthOptions.find((option) => option.value === month) ?? monthOptions[0];

  // the category dropdown is per account
  useEffect(() => {
    if (!selectedAccountId) {
      setCategories([]);
      return undefined;
    }

    let active = true;

    getTransactionCategories(selectedAccountId)
      .then((payload) => active && setCategories(payload))
      .catch(() => active && setCategories([]));

    return () => {
      active = false;
    };
  }, [selectedAccountId]);

  // the table and the totals above it move together, and typing in the search
  // box waits a moment so every keystroke is not a request
  useEffect(() => {
    if (!selectedAccountId) {
      setTransactions([]);
      setSummary(null);
      return undefined;
    }

    let active = true;
    const filters = {
      type,
      category,
      search,
      from: selectedMonth.from,
      to: selectedMonth.to,
    };

    const timer = setTimeout(
      () => {
        setLoadingRows(true);
        setRowsError("");

        getTransactions(selectedAccountId, filters)
          .then((historyPayload) => {
            if (!active) {
              return;
            }
            const filteredTransactions = historyPayload.transactions ?? [];
            setTransactions(filteredTransactions);
            setSummary(summarizeTransactions(filteredTransactions));
          })
          .catch((requestError) => {
            if (!active) {
              return;
            }
            setTransactions([]);
            setSummary(null);
            setRowsError(requestError.message);
          })
          .finally(() => {
            if (active) {
              setLoadingRows(false);
            }
          });
      },
      search ? SEARCH_DEBOUNCE_MS : 0,
    );

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [selectedAccountId, type, category, search, selectedMonth.from, selectedMonth.to]);

  const hasAccounts = accounts.length > 0;

  return (
    <main className="page-shell transactions-page">
      <StatusPanel state="error" message={error || rowsError} />

      <section className="heading-row">
        <div className="page-title-block">
          <h1>Transaction history</h1>
          <p>{buildSubtitle(accounts, selectedAccount)}</p>
        </div>
        {hasAccounts ? (
          <button className="back-link link-button" onClick={onBackToAccount} type="button">
            ← Account details
          </button>
        ) : (
          <button className="button button-primary open-first-account" onClick={onOpenFirstAccount} type="button">
            Open first account
          </button>
        )}
      </section>

      <AccountSelector
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        setSelectedAccountId={setSelectedAccountId}
        showSelectedCard={false}
        emptyState={
          <section className="notice-card">
            <strong>No accounts yet</strong>
            <span>Open your first checking or savings account to get started.</span>
          </section>
        }
      />

      {hasAccounts ? (
        <>
          <div className="summary-tiles">
            <SummaryTile
              label={monthLabel("Deposits", selectedMonth)}
              value={signedAmount(summary?.deposits)}
              tone="positive"
            />
            <SummaryTile
              label={monthLabel("Withdrawals", selectedMonth)}
              value={signedAmount(-Number(summary?.withdrawals ?? 0))}
            />
            <SummaryTile label="Net change" value={signedAmount(summary?.net_change)} />
          </div>

          <div className="filter-bar">
            <label className="search-field">
              <span className="search-icon" aria-hidden="true" />
              <input
                aria-label="Search transactions"
                id="transaction-search"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search transactions"
                value={search}
              />
            </label>

            <select
              aria-label="Transaction type"
              className="field-control filter-select"
              id="filter-type"
              onChange={(event) => setType(event.target.value)}
              value={type}
            >
              <option value="">All types</option>
              <option value="DEPOSIT">Deposits</option>
              <option value="WITHDRAWAL">Withdrawals</option>
            </select>

            <select
              aria-label="Category"
              className="field-control filter-select"
              id="filter-category"
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              aria-label="Date range"
              className="field-control filter-select"
              id="filter-month"
              onChange={(event) => setMonth(event.target.value)}
              value={month}
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <TransactionsTable loading={loadingRows} transactions={transactions} />
        </>
      ) : null}
    </main>
  );
}

function SummaryTile({ label, value, tone }) {
  return (
    <article className="summary-tile">
      <span className="summary-tile-label">{label}</span>
      <strong className={tone === "positive" ? "summary-tile-value amount-positive" : "summary-tile-value"}>
        {value}
      </strong>
    </article>
  );
}

function TransactionsTable({ transactions, loading }) {
  return (
    <div className="txn-table-card">
      <div className="txn-table txn-table-head">
        <span>Transaction ID</span>
        <span>Type</span>
        <span>Description</span>
        <span>Category</span>
        <span>Amount</span>
        <span>Date</span>
      </div>

      {transactions.length ? (
        transactions.map((transaction) => (
          <div className="txn-table txn-table-row" key={transaction.txn_id}>
            <span className="txn-id">{transaction.display_id}</span>
            <span>{formatAccountType(transaction.txn_type)}</span>
            <span>{transaction.description || "-"}</span>
            <span>{transaction.category ?? "—"}</span>
            <span
              className={
                transaction.txn_type === "DEPOSIT" ? "txn-amount amount-positive" : "txn-amount"
              }
            >
              {signedTransactionAmount(transaction)}
            </span>
            <span>{formatDate(transaction.date)}</span>
          </div>
        ))
      ) : (
        <p className="txn-table-empty">
          {loading ? "Loading transactions..." : "No transactions match these filters."}
        </p>
      )}
    </div>
  );
}

function summarizeTransactions(transactions) {
  let deposits = 0;
  let withdrawals = 0;

  transactions.forEach((transaction) => {
    if (transaction.txn_type === "DEPOSIT") {
      deposits += Number(transaction.amount ?? 0);
    } else if (transaction.txn_type === "WITHDRAWAL") {
      withdrawals += Number(transaction.amount ?? 0);
    }
  });

  deposits = roundCurrency(deposits);
  withdrawals = roundCurrency(withdrawals);

  return {
    deposit_count: transactions.filter((transaction) => transaction.txn_type === "DEPOSIT").length,
    withdrawal_count: transactions.filter((transaction) => transaction.txn_type === "WITHDRAWAL").length,
    deposits,
    withdrawals,
    net_change: roundCurrency(deposits - withdrawals),
    transaction_count: transactions.length,
  };
}

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

// "+$4,890.00" / "-$734.00", and a plain "$0.00" when there is nothing to sign
function signedAmount(value) {
  const amount = Number(value ?? 0);

  if (amount === 0) {
    return formatCurrency(0);
  }

  return `${amount > 0 ? "+" : "-"}${formatCurrency(Math.abs(amount))}`;
}

// "Checking · Account ID 1024" when there is one account, otherwise a prompt
function buildSubtitle(accounts, selectedAccount) {
  if (!accounts.length) {
    return "Open an account to start moving and tracking transactions.";
  }

  if (accounts.length > 2) {
    return "Choose an account to update the transaction history below.";
  }

  if (accounts.length === 1 && selectedAccount) {
    return `${formatAccountType(selectedAccount.account_type)} · Account ID ${selectedAccount.account_id}`;
  }

  return "Select an account to view its transaction history.";
}

// "Deposits this month" while the current month is selected, so the wording
// stays true when someone picks an earlier one
function monthLabel(word, selectedMonth) {
  return selectedMonth.isCurrent ? `${word} this month` : `${word} in ${selectedMonth.name}`;
}

// the last few months, each as a "Sep 1-30" option carrying its own date range
function buildMonthOptions(count) {
  const today = new Date();
  const options = [];

  for (let offset = 0; offset < count; offset += 1) {
    const start = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    const name = start.toLocaleString("en-US", { month: "short" });

    options.push({
      value: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
      label: `${name} ${start.getDate()}–${end.getDate()}`,
      name,
      from: toIsoDate(start),
      to: toIsoDate(end),
      isCurrent: offset === 0,
    });
  }

  return options;
}

// local date as YYYY-MM-DD, so the range does not shift by a timezone
function toIsoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
