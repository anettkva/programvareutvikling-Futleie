import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import supabaseClient from './supabaseClient'
import {User} from './Types'


function App() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsers();
  }, []);

  async function getUsers() {
    const { data } = await supabaseClient.from("Users").select();
    if (data) {
      setUsers(data as User[]);
    }
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
      </div>
    </div>
  )
}
export default App
