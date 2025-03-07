import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/layout";
import Page from "./app/login/page";
import Signup from "./app/signup/page";
import Gallery from "./pages/gallery";
import SearchPage from "./pages/search";
import CreateAdPage from "./pages/create-ad";
import Cookie from "js-cookie";
import ProfilePage from "./pages/profile-page";
import ItemInfo from "./components/item-info";
import ChangeItemForm from "./components/change-item-form";
import Messages from "./pages/messages";
import Historikk from "./pages/historikk";
import AdminDashboard from "./components/admin-dashboard";
import ManageRentals from "./pages/manage-rentals";

const App: React.FC<{}> = () => {
    const location = useLocation();
    const userCookie = Cookie.get("user");
    const isAuthenticated = userCookie && userCookie.length > 0;

    // Allow access to login and signup pages even when not authenticated
    if (
        !isAuthenticated &&
        !["/login", "/signup"].includes(location.pathname)
    ) {
        return <Navigate to="/login" replace />;
    }

    // Redirect authenticated users away from login/signup to gallery
    if (isAuthenticated && ["/login", "/signup"].includes(location.pathname)) {
        return <Navigate to="/gallery" replace />;
    }

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/gallery" replace />} />
            <Route
                path="/search"
                element={
                    <Layout>
                        <SearchPage />
                    </Layout>
                }
            />
            <Route path="/login" element={<Page />} />
            <Route path="/signup" element={<Signup />} />
            <Route
                path="/gallery"
                element={
                    <Layout>
                        <Gallery />
                    </Layout>
                }
            />
            <Route path="/create-ad" element={<CreateAdPage />} />
            <Route
                path="/profile"
                element={
                    <Layout>
                        <ProfilePage />
                    </Layout>
                }
            />
            <Route
                path="/item/:itemId"
                element={
                    <Layout>
                        <ItemInfo />
                    </Layout>
                }
            />
            <Route
                path="/change-ad/:itemId"
                element={
                    <Layout>
                        <ChangeItemForm />
                    </Layout>
                }
            />
            <Route
                path="/messages"
                element={
                    <Layout>
                        <Messages />
                    </Layout>
                }
            />
            <Route
                path="/historikk"
                element={
                    <Layout>
                        <Historikk />
                    </Layout>
                }
            />

            <Route
                path="/manage-rentals"
                element={
                    <Layout>
                        <ManageRentals />
                    </Layout>
                }
            />
        </Routes>
    );
};

export default App;
