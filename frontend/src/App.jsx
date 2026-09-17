import { useState } from "react";
import { AppHeader } from "./components";
import { clearToken, getUserIdFromToken } from "./api/auth";
import { useAppRoute } from "./hooks/useAppRoute";
import { useBankingData } from "./hooks/useBankingData";
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

  function handleProfileCreated(newUserId) {
    setPendingUserId(newUserId);
    handleRouteChange(ROUTES.openAccount);
  }

  function handleAccountOpened(newUserId) {
    setUserId(String(newUserId));
    setSignupDraft(EMPTY_SIGNUP_DRAFT);
    setPendingUserId(null);
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

  return (
    <div className="app-shell">
      <AppHeader
        activeRoute={route}
        isPublic={isPublicRoute}
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
            pendingUserId={pendingUserId}
            onOpened={handleAccountOpened}
            onBackToProfile={() => handleRouteChange(ROUTES.createProfile)}
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
      case ROUTES.insights:
        return <InsightsPage {...bankingData} />;
      case ROUTES.dashboard:
        return <DashboardPage {...bankingData} />;
      default:
        return <HomePage />;
    }
  }
}