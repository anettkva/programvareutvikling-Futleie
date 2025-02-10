import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout";
import { UserProfile } from "./components/user-profile";
import Page from "./app/login/page";
import Signup from "./app/signup/page";
import Gallery from "./pages/gallery";

const HomePage = () => (
  <div className="flex flex-col gap-8">
    <UserProfile />
  </div>
);

const App: React.FC<{}> = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Page />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
    </Routes>
  );
};  

export default App;
