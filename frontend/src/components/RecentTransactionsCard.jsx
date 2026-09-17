import { formatAccountType } from "../playground/formatters";
import { EmptyState } from "./EmptyState";
import { TransactionRow } from "./TransactionRow";

export function RecentTransactionsCard({ selectedAccount, transactions }) {
  const recentTransactions = transactions.slice(0, 4);

  return (
    <section className="card wide-card">
      <div className="card-heading">
        <div>
          <h2>Recent transactions</h2>
          <span>
            {selectedAccount
              ? `${formatAccountType(selectedAccount.account_type)} · Account ID ${selectedAccount.account_id}`
              : `${transactions.length} total`}
          </span>
        </div>
        {transactions.length ? <strong className="card-link">View all</strong> : null}
      </div>
      {recentTransactions.length ? (
        <div className="transaction-list">
          {recentTransactions.map((transaction) => (
            <TransactionRow key={transaction.txn_id} transaction={transaction} />
          ))}
        </div>
      ) : (
        <EmptyState title="No transactions" message="This account has no transaction history." />
      )}
    </section>
  );
}
