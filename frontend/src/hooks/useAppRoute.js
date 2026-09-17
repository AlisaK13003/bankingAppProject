import { useCallback, useEffect, useState } from "react";
import { getToken } from "../api/auth";
import { isKnownRoute, PUBLIC_ROUTES, ROUTES } from "../routes";

function readRouteFromHash() {
  const hashRoute = window.location.hash.replace(/^#\/?/, "");
  return isKnownRoute(hashRoute) ? hashRoute : ROUTES.home;
}

// Owns the current route, keeps it in sync with the URL hash, and redirects
// to Sign In whenever a private route is visited without a token.
export function useAppRoute() {
  const [route, setRoute] = useState(readRouteFromHash);
  const isPublicRoute = PUBLIC_ROUTES.has(route);

  const navigate = useCallback((nextRoute) => {
    if (!isKnownRoute(nextRoute)) {
      return;
    }

    window.location.hash = `/${nextRoute}`;
    setRoute(nextRoute);
  }, []);

  useEffect(() => {
    function handleHashChange() {
      setRoute(readRouteFromHash());
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (!isPublicRoute && !getToken()) {
      navigate(ROUTES.signIn);
    }
  }, [route, isPublicRoute, navigate]);

  return { route, isPublicRoute, navigate };
}
