import { createRoot } from "react-dom/client";
import { setAuthFailureHandler, setAuthTokenGetter } from "@workspace/api-client-react";
import App from "./App";
import { useAuthStore } from "./lib/store";
import "./index.css";

setAuthTokenGetter(() => useAuthStore.getState().token);
setAuthFailureHandler(() => useAuthStore.getState().logout());

createRoot(document.getElementById("root")!).render(<App />);
