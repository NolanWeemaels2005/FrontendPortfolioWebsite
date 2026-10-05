import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { App } from "./App";
import { LanguageProvider } from "./i18n/LanguageContext";
import { preloadProjectData } from "./data/projectQueries";
import "./styles/global.css";
import "./styles/blog.css";

const redirectRoute = window.location.search.match(/^\?\/([^&]*)/);
if (redirectRoute) {
  const route = redirectRoute[1];
  const search = window.location.search.replace(/^\?\/[^&]*/, "").replace(/^&/, "?");
  window.history.replaceState(null, "", `${import.meta.env.BASE_URL}${route}${search}${window.location.hash}`);
}

if (window.location.pathname.startsWith("/portfolio")) {
  void preloadProjectData();
}

const router = createBrowserRouter([
  { path: "*", element: <LanguageProvider><App /></LanguageProvider> },
], { basename: import.meta.env.BASE_URL });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
