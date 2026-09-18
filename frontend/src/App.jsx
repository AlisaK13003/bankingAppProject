import { useState } from "react";
import { AppHeader } from "./components";
import { clearToken, getUserIdFromToken } from "./api/auth";
import { useAppRoute } from "./hooks/useAppRoute";
import { useBankingData } from "./hooks/useBankingData";
import { AccountsPage } from "./pages/AccountsPage";
import { CreateProfilePage } from "./pages/CreateProfilePage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { InsightsPage } from "./pages/InsightsPage";
import { OpenAccountPage } from "./pages/OpenAccountPage";
import { SignInPage } from "./pages/SignInPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { ROUTES } from "./routes";

const EMPTY_SIGNUP_DRAFT = { username: "", name: "", email: "", password: "" };

function getInitialUserId() {
  const fromUrl = new URLSearchParams(window.location.search).get("userId");
  return fromUrl || getUserIdFromToken() || "";
}

export function App() {
  const { route, isPublicRoute, navigate: handleRouteChange } = useAppRoute();
  const [userId, setUserId] = useState(getInitialUserId);
  const [signupDraft, setSignupDraft] = useState(EMPTY_SIGNUP_DRAFT);
  const [pendingUserId, setPendingUserId] = useState(null);
  const bankingData = useBankingData(userId);
  const openAccountUserId = pendingUserId ?? userId;
  const headerIsPublic = isPublicRoute && !(route === ROUTES.openAccount && userId);

  function handleProfileCreated(newUserId) {
    setPendingUserId(newUserId);
    handleRouteChange(ROUTES.openAccount);
  }

  function handleAccountOpened(newUserId) {
    setUserId(String(newUserId));
    setSignupDraft(EMPTY_SIGNUP_DRAFT);
    setPendingUserId(null);
    bankingData.refreshData();
    handleRouteChange(ROUTES.dashboard);
  }

  function handleSignedIn(newUserId) {
    setUserId(String(newUserId));
    handleRouteChange(ROUTES.dashboard);
  }

  function handleSignOut() {
    clearToken();
    setUserId("");
    handleRouteChange(ROUTES.home);
  }

  function handleOpenAnotherAccount() {
    setPendingUserId(null);
    handleRouteChange(ROUTES.openAccount);
  }

  return (
    <div className="app-shell">
      <AppHeader
        activeRoute={route}
        isPublic={headerIsPublic}
        onRouteChange={handleRouteChange}
        onSignOut={handleSignOut}
      />
      {renderRoute()}
    </div>
  );

  function renderRoute() {
    switch (route) {
      case ROUTES.createProfile:
        return (
          <CreateProfilePage
            draft={signupDraft}
            onDraftChange={setSignupDraft}
            onContinue={handleProfileCreated}
            onBackHome={() => handleRouteChange(ROUTES.home)}
          />
        );
      case ROUTES.openAccount:
        return (
          <OpenAccountPage
            pendingUserId={openAccountUserId}
            onOpened={handleAccountOpened}
            onBackToProfile={() => handleRouteChange(userId ? ROUTES.accounts : ROUTES.createProfile)}
          />
        );
      case ROUTES.signIn:
        return (
          <SignInPage
            onSignedIn={handleSignedIn}
            onCreateAccount={() => handleRouteChange(ROUTES.createProfile)}
            onBackHome={() => handleRouteChange(ROUTES.home)}
          />
        );
      case ROUTES.transactions:
        return (
          <TransactionsPage
            {...bankingData}
            onBackToAccount={() => handleRouteChange(ROUTES.dashboard)}
            onOpenFirstAccount={() => handleRouteChange(ROUTES.createProfile)}
          />
        );
      case ROUTES.accounts:
        return <AccountsPage {...bankingData} onOpenAnotherAccount={handleOpenAnotherAccount} />;
      case ROUTES.insights:
        return <InsightsPage {...bankingData} />;
      case ROUTES.dashboard:
        return <DashboardPage {...bankingData} />;
      default:
        return <HomePage />;
    }
  }
}
