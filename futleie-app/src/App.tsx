import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import { createClient } from '@supabase/supabase-js'
import {User} from './Types'
const supabaseUrl = 'https://wcudjrwfxpqnytjdmojb.supabase.co'
const supabaseKey = process.env.SUPABASE_DEV_KEY as string
const supabase = createClient(supabaseUrl, supabaseKey)

function App() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsers();
  }, []);

  async function getUsers() {
    const { data } = await supabase.from("Users").select();
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
