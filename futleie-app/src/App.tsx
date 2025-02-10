import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/layout";
import Page from "./app/login/page";
import Signup from "./app/signup/page";
import Gallery from "./pages/gallery";
import Cookie from "js-cookie";

const App: React.FC<{}> = () => {
  const location = useLocation();
  const userCookie = Cookie.get("user");
  const isAuthenticated = userCookie && userCookie.length > 0;

  // Allow access to login and signup pages even when not authenticated
  if (!isAuthenticated && !['/login', '/signup'].includes(location.pathname)) {
    return <Navigate to="/login" replace />;
  }

  // Redirect authenticated users away from login/signup to gallery
  if (isAuthenticated && ['/login', '/signup'].includes(location.pathname)) {
    return <Navigate to="/gallery" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/gallery" replace />} />
      <Route path="/login" element={<Page />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
    </Routes>
  );
};  

export default App;
