import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { App } from "./App";
import { RouteErrorPage } from "./components/RouteErrorPage";
import { LanguageProvider } from "./i18n/LanguageContext";
import { preloadProjectData } from "./data/projectQueries";
import "./styles/global.css";
import "./styles/blog.css";
import "./styles/hall-of-fame.css";
import "./styles/layout-alignment.css";
import "./styles/hero-shared.css";

// Disable browser restoration before the router or lazy pages mount.
window.history.scrollRestoration = "manual";
window.addEventListener("pageshow", (event) => {
  if (event.persisted) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
});

const redirectRoute = window.location.search.match(/^\?\/([^&]*)/);
if (redirectRoute) {
  const route = redirectRoute[1];
  const search = window.location.search.replace(/^\?\/[^&]*/, "").replace(/^&/, "?");
  window.history.replaceState(null, "", `${import.meta.env.BASE_URL}${route}${search}${window.location.hash}`);
}

// Reloading an in-page anchor should also reopen the page at its beginning.
if (window.location.hash) {
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}`);
}

if (window.location.pathname.startsWith("/portfolio")) {
  void preloadProjectData();
}

const router = createBrowserRouter([
  { path: "*", element: <LanguageProvider><App /></LanguageProvider>, errorElement: <RouteErrorPage /> },
], { basename: import.meta.env.BASE_URL });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
