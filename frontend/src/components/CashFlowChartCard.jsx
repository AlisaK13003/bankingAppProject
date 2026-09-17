import { formatCurrency } from "../playground/formatters";

export function CashFlowChartCard({ cashFlow }) {
  const maxValue = Math.max(
    1,
    ...cashFlow.flatMap((month) => [Number(month.deposits ?? 0), Number(month.withdrawals ?? 0)]),
  );

  return (
    <section className="card cash-flow-card">
      <div className="card-heading">
        <div>
          <h2>Monthly cash flow</h2>
          <span>Last 6 months · deposits vs. withdrawals</span>
        </div>
        <div className="legend">
          <span><i className="legend-deposit" />Deposits</span>
          <span><i className="legend-withdrawal" />Withdrawals</span>
        </div>
      </div>
      <div className="cash-flow-plot">
        {cashFlow.map((month) => (
          <div className="month-group" key={month.month}>
            <div className="bars">
              <span
                className="bar deposit-bar"
                tabIndex="0"
                aria-label={`${month.month} deposits ${formatCurrency(month.deposits)}`}
                style={{ height: `${Math.max(8, (Number(month.deposits) / maxValue) * 164)}px` }}
              >
                <span className="bar-tooltip">
                  <strong>{month.month} deposits</strong>
                  {formatCurrency(month.deposits)}
                </span>
              </span>
              <span
                className="bar withdrawal-bar"
                tabIndex="0"
                aria-label={`${month.month} withdrawals ${formatCurrency(month.withdrawals)}`}
                style={{ height: `${Math.max(8, (Number(month.withdrawals) / maxValue) * 164)}px` }}
              >
                <span className="bar-tooltip">
                  <strong>{month.month} withdrawals</strong>
                  {formatCurrency(month.withdrawals)}
                </span>
              </span>
            </div>
            <small>{month.month}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
