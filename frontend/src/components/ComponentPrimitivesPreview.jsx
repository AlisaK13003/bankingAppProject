import { Button } from "./Button";
import { SearchField } from "./SearchField";
import { SelectField } from "./SelectField";
import { TextField } from "./TextField";

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
