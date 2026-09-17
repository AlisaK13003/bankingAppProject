import { formatCurrency } from "../playground/formatters";

export function TrendsCard({ trends }) {
  const change = trends?.spending_change_percent;
  const comparison = change === null || change === undefined
    ? "No previous month spending"
    : `Spending is ${change <= 0 ? "down" : "up"} ${Math.abs(change)}%`;

  return (
    <section className="card trends-card">
      <h2>Trends</h2>
      <div className="trend-stats">
        <InfoStat
          label="Top spending category"
          value={
            trends?.top_spending_category
              ? `${trends.top_spending_category} · ${formatCurrency(trends.top_spending_amount)}`
              : "No spending yet"
          }
        />
        <InfoStat label="Compared with previous month" value={comparison} tone={change > 0 ? "negative" : "positive"} />
        <InfoStat label="Average weekly spend" value={formatCurrency(trends?.average_weekly_spend)} />
      </div>
    </section>
  );
}

function InfoStat({ label, value, tone }) {
  return (
    <div className="info-stat">
      <span>{label}</span>
      <strong className={tone ? `amount-${tone}` : ""}>{value}</strong>
    </div>
  );
}
