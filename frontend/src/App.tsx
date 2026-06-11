import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import { useEffect } from "react";
import { trackPageView } from "./lib/analytics";

const router = getRouter();

function AnalyticsTracker() {
  useEffect(() => {
    trackPageView(window.location.pathname);

    const handleRouteChange = () => {
      trackPageView(window.location.pathname);
    };

    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  return null;
}

export default function App() {
  return (
    <>
      <AnalyticsTracker />
      <RouterProvider router={router} />
    </>
  );
}
