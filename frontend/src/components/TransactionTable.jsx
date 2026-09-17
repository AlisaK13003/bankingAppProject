import {
  formatAccountType,
  formatDate,
  signedTransactionAmount,
} from "../playground/formatters";
import { EmptyState } from "./EmptyState";

export function TransactionTable({ transactions }) {
  if (!transactions.length) {
    return <EmptyState title="No table rows" message="Transactions from the selected account will render here." />;
  }

  return (
    <div className="table-card">
      <div className="transaction-table header">
        <strong>Transaction ID</strong>
        <strong>Type</strong>
        <strong>Description</strong>
        <strong>Category</strong>
        <strong>Amount</strong>
        <strong>Date</strong>
      </div>
      {transactions.map((transaction) => (
        <div className="transaction-table" key={transaction.txn_id}>
          <span>{transaction.display_id}</span>
          <span>{formatAccountType(transaction.txn_type)}</span>
          <span>{transaction.description || "-"}</span>
          <span>{transaction.category ?? "-"}</span>
          <strong className={transaction.txn_type === "DEPOSIT" ? "amount-positive" : "amount-negative"}>
            {signedTransactionAmount(transaction)}
          </strong>
          <span>{formatDate(transaction.date)}</span>
        </div>
      ))}
    </div>
  );
}
