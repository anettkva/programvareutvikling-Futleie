import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import Page from "./app/login/page.tsx";
import Signup from "./app/signup/page.tsx";
import ItemInfo from "./components/item-info"; // Import ItemInfo component

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}></Route>
        <Route path="/login" element={<Page />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/item/:itemId" element={<ItemInfo />}></Route>
      </Routes>
    </Router>
  </StrictMode>
);
