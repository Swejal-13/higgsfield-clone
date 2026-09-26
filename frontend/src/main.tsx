import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import { applyPreferencesToDocument, loadPreferences } from "./utils/preferences";
import "./index.css";

// Apply theme/density/motion before first paint so there's no flash of the
// wrong theme on load or refresh.
applyPreferencesToDocument(loadPreferences());

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PreferencesProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </PreferencesProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
