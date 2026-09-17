import { ROUTES } from "../routes";

const PUBLIC_NAV_ITEMS = [
  { label: "Home", route: ROUTES.home },
  { label: "Create Profile", route: ROUTES.createProfile },
  { label: "Sign In", route: ROUTES.signIn },
];

const APP_NAV_ITEMS = [
  { label: "Dashboard", route: ROUTES.dashboard, enabled: true },
  { label: "Accounts", route: ROUTES.accounts, enabled: true },
  { label: "Transactions", route: ROUTES.transactions, enabled: true },
  { label: "Insights", route: ROUTES.insights, enabled: true },
];

export function AppHeader({ activeRoute, isPublic = false, onRouteChange, onSignOut }) {
  const navItems = isPublic ? PUBLIC_NAV_ITEMS : APP_NAV_ITEMS;

  return (
    <header className="app-header">
      <div className="brand-preview">
        <span className="brand-mark" />
        <strong>POLARIS BANK</strong>
      </div>
      <nav className="app-nav" aria-label="Application navigation">
        {navItems.map((item) => (
          <button
            aria-current={activeRoute === item.route ? "page" : undefined}
            className={`app-nav-item ${activeRoute === item.route ? "app-nav-item-active" : ""}`}
            disabled={item.enabled === false}
            key={item.label}
            onClick={() => onRouteChange(item.route)}
            type="button"
          >
            {item.label}
          </button>
        ))}
        {!isPublic ? (
          <button className="sign-out-button" onClick={onSignOut} type="button">
            Sign out
          </button>
        ) : null}
      </nav>
    </header>
  );
}
