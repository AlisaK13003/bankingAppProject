import {
  formatAccountType,
  formatCurrency,
  formatDate,
  formatShortDate,
  signedTransactionAmount,
} from "./formatters";

export function Button({ children, variant = "primary", ...props }) {
  return (
    <button className={`button button-${variant}`} type="button" {...props}>
      {children}
    </button>
  );
}

export function TextField({ label, value, onChange, error, type = "text", placeholder, readOnly = false }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        className={`field-control ${error ? "field-control-error" : ""}`}
        type={type}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
      />
      {error ? <span className="field-help">{error}</span> : null}
    </label>
  );
}

export function SelectField({ label, value, onChange, children, disabled }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <select
        className="field-control"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        disabled={disabled}
      >
        {children}
      </select>
    </label>
  );
}

export function SearchField({ value = "Search transactions", readOnly = true }) {
  return (
    <label className="search-field">
      <span className="search-icon" aria-hidden="true" />
      <input aria-label="Search" readOnly={readOnly} value={value} />
    </label>
  );
}

export function ComponentPrimitivesPreview() {
  return (
    <div className="primitive-stack">
      <div className="specimen-card">
        <h3>Buttons</h3>
        <div className="specimen-row">
          <Button>Primary LG</Button>
          <Button variant="light">Outline LG</Button>
          <Button className="button button-primary button-md">Primary MD</Button>
          <Button className="button button-light button-md">Outline MD</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>

      <div className="specimen-card">
        <h3>Form controls</h3>
        <div className="form-specimen-grid">
          <TextField label="Text field" value="Enter value" readOnly />
          <TextField label="Error state" value="abc" error="Enter a valid amount." readOnly />
          <SelectField label="Select" value="checking" disabled>
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
          </SelectField>
          <SearchField />
        </div>
      </div>

      <div className="specimen-card">
        <h3>Navigation</h3>
        <div className="nav-specimen">
          <NavItem label="Home" active />
          <NavItem label="Create Account" />
          <NavItem label="Sign In" />
        </div>
        <AppHeaderPreview />
      </div>

      <div className="marketing-specimen-grid">
        <HomeHeroPreview />
        <HomeOverviewPreview />
      </div>

      <div className="specimen-card">
        <h3>Feature steps</h3>
        <div className="feature-step-list">
          <FeatureStep number="01" label="Open an account in a few fields" />
          <FeatureStep number="02" label="Deposit or withdraw money" />
          <FeatureStep number="03" label="Review balances and transaction history" />
        </div>
      </div>

      <div className="modal-specimen-grid">
        <MoneyMovementModalPreview type="deposit" />
        <MoneyMovementModalPreview type="withdrawal" />
      </div>
    </div>
  );
}

function NavItem({ label, active = false }) {
  return (
    <span className={`nav-item-preview ${active ? "nav-item-active" : ""}`}>
      {label}
    </span>
  );
}

function AppHeaderPreview() {
  return (
    <div className="app-header-preview" aria-label="App header preview">
      <div className="brand-preview">
        <span className="brand-mark" />
        <strong>POLARIS BANK</strong>
      </div>
      <nav className="app-nav-preview" aria-label="Application navigation preview">
        <NavItem label="Dashboard" active />
        <NavItem label="Transactions" />
        <NavItem label="Insights" />
        <NavItem label="Accounts" />
        <span className="sign-out-preview">Sign out</span>
      </nav>
    </div>
  );
}

function FeatureStep({ number, label }) {
  return (
    <div className="feature-step">
      <span>{number}</span>
      <p>{label}</p>
    </div>
  );
}

function HomeHeroPreview() {
  return (
    <section className="home-hero-preview">
      <p className="hero-eyebrow">SIMPLE • SECURE • CLEAR</p>
      <h3>Banking that keeps the essentials simple.</h3>
      <p>Create an account, check your balance, move money, and review every transaction from one clean workspace.</p>
      <div className="hero-actions">
        <Button>Create Account</Button>
        <Button variant="light">View Account</Button>
      </div>
      <small>Protected by secure account access and transaction tracking.</small>
    </section>
  );
}

function HomeOverviewPreview() {
  return (
    <section className="home-overview-preview">
      <h3>Everything needed for basic banking flows</h3>
      <div className="overview-list">
        <FeatureStep number="01" label="Create an account" />
        <FeatureStep number="02" label="View account details" />
        <FeatureStep number="03" label="Move money safely" />
      </div>
    </section>
  );
}

function MoneyMovementModalPreview({ type }) {
  const isDeposit = type === "deposit";

  return (
    <section className="money-modal-preview" aria-label={`${isDeposit ? "Deposit" : "Withdrawal"} modal preview`}>
      <div className="modal-heading">
        <h3>{isDeposit ? "Deposit money" : "Withdraw money"}</h3>
        <p>{isDeposit ? "Add funds to your selected account." : "Move funds out of your selected account."}</p>
      </div>
      <div className="selected-account-preview">
        <span>Checking · Account ID 1024</span>
        <strong>$2,184.20 available</strong>
      </div>
      <TextField label="Amount" value="$0.00" readOnly />
      {!isDeposit ? (
        <SelectField label="Category" value="food" disabled>
          <option value="food">Food & Dining</option>
        </SelectField>
      ) : null}
      <TextField label="Description (optional)" value={isDeposit ? "e.g. Cash deposit" : "e.g. Grocery Market"} readOnly />
      <p className="modal-note">
        {isDeposit
          ? "Deposits update the selected account balance and transaction history."
          : "Withdrawals require a positive amount and an available balance."}
      </p>
      <div className="modal-actions">
        <Button variant="light">Cancel</Button>
        <Button>{isDeposit ? "Deposit" : "Withdraw"}</Button>
      </div>
    </section>
  );
}

export function AccountCard({ account, selected, onSelect }) {
  if (!account) {
    return (
      <div className="account-empty">
        <strong>No accounts loaded</strong>
        <span>Enter a user ID with seeded accounts or type an account ID manually.</span>
      </div>
    );
  }

  return (
    <button
      className={`account-card ${selected ? "account-card-selected" : ""}`}
      type="button"
      onClick={() => onSelect?.(account.account_id)}
    >
      <span className="account-meta">
        <span className="account-type">{formatAccountType(account.account_type)}</span>
        <span className="muted">Account ID {account.account_id}</span>
      </span>
      <span className="account-balance">
        <span>{formatCurrency(account.balance)}</span>
        <span className="muted">Available balance</span>
      </span>
    </button>
  );
}

export function BalanceOverviewCard({ accounts, selectedAccount }) {
  const totalBalance = accounts.reduce((total, account) => total + Number(account.balance ?? 0), 0);

  return (
    <section className="balance-overview">
      <div className="balance-summary">
        <span>Total balance</span>
        <strong>{formatCurrency(totalBalance)}</strong>
        <span>Across all accounts</span>
        <span className="pill">{accounts.length} {accounts.length === 1 ? "account" : "accounts"}</span>
      </div>
      <div className="selected-actions">
        <span>Selected account</span>
        <strong>
          {selectedAccount
            ? `${formatAccountType(selectedAccount.account_type)} · Account ID ${selectedAccount.account_id}`
            : "No account selected"}
        </strong>
        <div className="quick-actions">
          <Button variant="light">Deposit</Button>
          <Button variant="light">Withdraw</Button>
        </div>
      </div>
    </section>
  );
}

export function SummaryCard({ title, value, detail, tone = "default" }) {
  return (
    <article className={`summary-card summary-${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export function RecentTransactionsCard({ transactions }) {
  const recentTransactions = transactions.slice(0, 5);

  return (
    <section className="card wide-card">
      <div className="card-heading">
        <h2>Recent transactions</h2>
        <span>{transactions.length} total</span>
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

export function AccountDetailHero({ account }) {
  return (
    <section className="account-hero">
      <span>{account ? formatAccountType(account.account_type) : "Account details"}</span>
      <strong>{account ? formatCurrency(account.balance) : "$0.00"}</strong>
      <small>{account ? `Account ID ${account.account_id}` : "Select an account to preview details"}</small>
    </section>
  );
}

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

export function StatusPanel({ state, message }) {
  if (!message) {
    return null;
  }

  return <div className={`status-panel ${state}`}>{message}</div>;
}

export function EmptyState({ title, message }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
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
