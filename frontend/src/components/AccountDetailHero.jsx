import { formatAccountType, formatCurrency } from "../playground/formatters";

export function AccountDetailHero({ account }) {
  return (
    <section className="account-hero">
      <span>{account ? formatAccountType(account.account_type) : "Account details"}</span>
      <strong>{account ? formatCurrency(account.balance) : "$0.00"}</strong>
      <small>{account ? `Account ID ${account.account_id}` : "Select an account to preview details"}</small>
    </section>
  );
}
