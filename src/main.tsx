import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { LanguageProvider } from "./i18n/LanguageContext";
import "./styles/global.css";

const redirectRoute = window.location.search.match(/^\?\/([^&]*)/);
if (redirectRoute) {
  const route = redirectRoute[1];
  const search = window.location.search.replace(/^\?\/[^&]*/, "").replace(/^&/, "?");
  window.history.replaceState(null, "", `${import.meta.env.BASE_URL}${route}${search}${window.location.hash}`);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
