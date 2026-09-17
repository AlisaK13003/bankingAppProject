import { formatShortDate, signedTransactionAmount } from "../playground/formatters";

export function TransactionRow({ transaction }) {
  const isDeposit = transaction.txn_type === "DEPOSIT";
  const metadata = isDeposit
    ? `Deposit · ${formatShortDate(transaction.date)}`
    : `${transaction.category ?? "Withdrawal"} · ${formatShortDate(transaction.date)}`;

  return (
    <div className="transaction-row">
      <span>
        <strong>{transaction.description || transaction.display_id}</strong>
        <small>{metadata}</small>
      </span>
      <strong className={isDeposit ? "amount-positive" : "amount-negative"}>
        {signedTransactionAmount(transaction)}
      </strong>
    </div>
  );
}
