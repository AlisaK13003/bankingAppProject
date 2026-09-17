export function SummaryCard({ title, value, detail, tone = "default" }) {
  return (
    <article className={`summary-card summary-${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
