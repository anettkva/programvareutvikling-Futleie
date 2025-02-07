import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Page from "./pages/page.tsx";
import Items from "./pages/items.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Page />
    <Items />
  </StrictMode>
);
