import { formatCurrency } from "../playground/formatters";
import { EmptyState } from "./EmptyState";

export function SpendingByCategoryCard({ categories }) {
  const total = categories.reduce((sum, category) => sum + Number(category.amount ?? 0), 0);
  const gradient = categories.length
    ? buildDonutGradient(categories)
    : "conic-gradient(var(--border-subtle) 0 100%)";

  return (
    <section className="card spending-card">
      <div className="card-heading stacked">
        <h2>Spending by category</h2>
        <span>Last 30 days</span>
      </div>
      {categories.length ? (
        <>
          <div className="donut-wrap">
            <div className="donut" style={{ background: gradient }}>
              <div>
                <strong>{formatCurrency(total)}</strong>
                <span>spent</span>
              </div>
            </div>
          </div>
          <div className="category-list">
            {categories.map((category, index) => (
              <div className="category-row" key={category.category}>
                <span>
                  <i style={{ backgroundColor: categoryColor(index) }} />
                  {category.category}
                </span>
                <strong>{formatCurrency(category.amount)}</strong>
                <small>{Math.round(category.percentage)}%</small>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState title="No recent spending" message="Withdrawals from the last 30 days will populate this card." />
      )}
    </section>
  );
}

function buildDonutGradient(categories) {
  let current = 0;
  const segments = categories.map((category, index) => {
    const start = current;
    current += Number(category.percentage ?? 0);
    return `${categoryColor(index)} ${start}% ${current}%`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

function categoryColor(index) {
  return ["#183b66", "#2fa8a0", "#f8efe0", "#eef3f8", "#64748b", "#1fa971"][index % 6];
}
