import { formatCurrency } from "../playground/formatters";
import { SummaryCard } from "./SummaryCard";

export function TransactionMetricCards({ summary }) {
  return (
    <div className="metric-grid">
      <SummaryCard
        title="Deposits"
        value={formatCurrency(summary?.deposits)}
        detail={`${summary?.deposit_count ?? 0} deposits this month`}
        tone="positive"
      />
      <SummaryCard
        title="Withdrawals"
        value={formatCurrency(summary?.withdrawals)}
        detail={`${summary?.withdrawal_count ?? 0} withdrawals this month`}
        tone="neutral"
      />
      <SummaryCard
        title="Net change"
        value={formatCurrency(summary?.net_change)}
        detail={`${summary?.transaction_count ?? 0} transactions this month`}
        tone="accent"
      />
    </div>
  );
}
