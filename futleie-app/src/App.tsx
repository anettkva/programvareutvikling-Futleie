import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import supabaseClient from "./supabaseClient";
import { User } from "./Types";
import Cookie from "js-cookie";
import { Button } from "./components/ui/button";
import { useNavigate } from "react-router-dom";

const App: React.FC<{}> = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getUsers();
    checkLogin();
  }, []);

  async function getUsers() {
    const { data } = await supabaseClient.from("Users").select();
    if (data) {
      setUsers(data as User[]);
    }
  }
  async function checkLogin() {
    const userCookie = Cookie.get("user");
    if (userCookie != undefined && userCookie.length != 0) {
      const cookie = userCookie ? JSON.parse(userCookie) : null;
      const { data } = await supabaseClient
        .from("Users")
        .select("username, password_hash")
        .eq("username", cookie.username)
        .eq("password_hash", cookie.password_hash);
      if (data) {
        if (data[0]) {
          setLoggedIn(true);
          return;
        }
        setLoggedIn(false);
      }
    }
  }
  function logOut() {
    Cookie.remove("user");
    window.location.reload();
  }
  function logIn() {
    navigate("/login");
  }

  return (
    <div className="mt-4 p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
      <div className="flex-shrink-0">
        <img className="h-12 w-12" src={reactLogo} alt="React logo" />
      </div>
      <div>
        <div className="text-xl font-medium text-black">Users</div>
        <ul>
          {users.map((user) => (
            <li key={user.username}>{user.username}</li>
          ))}
        </ul>
        {loggedIn && (
          <>
            <div className="text-green-500 mt-4">Du er innlogget</div>
            <Button onClick={logOut}>Logg ut</Button>
          </>
        )}
        {!loggedIn && (
          <>
            <div className="text-red-500 mt-4">Du er ikke innlogget</div>
            <Button onClick={logIn}>Logg in</Button>
          </>
        )}
      </div>
    </div>
  );
};
export default App;
