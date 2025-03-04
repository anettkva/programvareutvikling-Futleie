import supabaseClient from "@/supabaseClient";
import { User } from "@/Types/User";
import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import Cookies from "js-cookie";

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        async function fetchUsers() {
            const { data, error } = await supabaseClient
                .from("Users")
                .select()
                .neq("admin", true);
            if (error) {
                console.log("Error fetching users");
            } else {
                setUsers(data as User[]);
            }
        }
        fetchUsers();
    }, []);

    useEffect(() => {
        async function fetchIsAdmin() {
            const userCookie = Cookies.get("user");
            const user = userCookie ? JSON.parse(userCookie) : null;
            if (user) {
                const { data, error } = await supabaseClient
                    .from("Users")
                    .select()
                    .eq("id", user.id)
                    .single();
                if (error) {
                    console.log("Error fetching user");
                } else {
                    setIsAdmin(data.admin);
                }
            }
        }
    }, []);

    function handleDeleteUser(id: number) {
        console.log("Sletter: ", id);

        async function deleteUser() {
            const { error } = await supabaseClient
                .from("Users")
                .delete()
                .eq("id", id);
            if (error) {
                console.log("Error deleting user");
            } else {
                setUsers(users.filter((user) => user.id !== id));
            }
        }
        deleteUser();
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Admin dashboard</h1>
            {users ? (
                <Table>
                    <TableCaption>Alle brukere</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Id</TableHead>
                            <TableHead>Brukernavn</TableHead>
                            <TableHead>E-post</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Slett</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => {
                            return (
                                <TableRow key={user.id}>
                                    <TableCell className="max-w-[100px]">
                                        <div className="font-bold truncate">
                                            {user.id}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[150px]">
                                        <div className="truncate">
                                            {user.username}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px]">
                                        <div className="truncate">
                                            {user.email}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[80px]">
                                        <div className="truncate">{null}</div>
                                    </TableCell>
                                    <TableCell className="max-w-[80px]">
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                handleDeleteUser(
                                                    user.id as number
                                                );
                                            }}
                                        >
                                            Slett bruker
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            ) : (
                <p>No users found</p>
            )}
        </div>
    );
};

export default AdminDashboard;
