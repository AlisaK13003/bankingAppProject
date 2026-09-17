export const ROUTES = {
  home: "home",
  createProfile: "createProfile",
  openAccount: "openAccount",
  signIn: "signIn",
  dashboard: "dashboard",
  transactions: "transactions",
  insights: "insights",
};

export const PUBLIC_ROUTES = new Set([
  ROUTES.home,
  ROUTES.createProfile,
  ROUTES.openAccount,
  ROUTES.signIn,
]);

export function isKnownRoute(route) {
  return Object.values(ROUTES).includes(route);
}
