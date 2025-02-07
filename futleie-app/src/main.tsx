import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import Page from "./app/login/page.tsx";
import Signup from "./components/signup-form.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Router>
            <Routes>
                <Route path="/" element={<App/>}></Route>
                <Route path="/login" element={<Page/>}></Route>
                <Route path="/signup" element={<Signup/>}></Route>
            </Routes>
        </Router>
    </StrictMode>
);
