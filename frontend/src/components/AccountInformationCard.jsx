import { formatAccountType, formatDate } from "../playground/formatters";

export function AccountInformationCard({ account }) {
  return (
    <section className="card info-card">
      <h2>Account information</h2>
      <InfoRow label="Account ID" value={account?.account_id ?? "-"} />
      <InfoRow label="Type" value={account ? formatAccountType(account.account_type) : "-"} />
      <InfoRow label="Opened" value={account ? formatDate(account.created_at) : "-"} />
      <InfoRow label="Owner" value={account?.user?.name ?? "-"} />
      <InfoRow label="Email" value={account?.user?.email ?? "-"} />
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
