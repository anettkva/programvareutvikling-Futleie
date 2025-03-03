import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import Supabase from "../supabaseClient.ts";
import { User } from "../Types/User.ts";
import CryptoJS from "crypto-js";

const Profile: React.FC = () => {
    const [userId, setUserId] = useState<Number | undefined>(undefined);
    const [username, setUsername] = useState("[Brukernavn]");
    const [email, setEmail] = useState("epost@example.com");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        async function getUser() {
            const userCookie = Cookies.get("user");

            if (!userCookie || userCookie.length === 0) {
                console.error("User not logged in");
            }

            const user = JSON.parse(userCookie as string);

            const { data, error } = await Supabase.from("Users")
                .select("id, username, email")
                .eq("username", user.username);

            if (data) {
                setUserId(data[0].id as Number);
                setUsername(data[0].username as string);
                setEmail(data[0].email as string);
            }
            if (error) {
                console.error("Error fetching user id:", error);
            }
        }
        getUser();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        async function uploadToSupabase() {
            const requestBody: any = {
                username,
                email,
            };
            // Oppdater kun passord hvis nye felt matcher og ikke er tomme
            if (
                newPassword &&
                confirmPassword &&
                newPassword === confirmPassword
            ) {
                requestBody.password_hash = CryptoJS.SHA256(
                    newPassword
                ).toString(CryptoJS.enc.Hex);
            }

            const { data, error } = await Supabase.from("Users")
                .update([requestBody])
                .eq("id", userId)
                .select("id, username, password_hash");

            if (error) {
            } else {
                const user = data[0] as User;
                if (user === undefined) {
                    alert("Feil brukernavn eller passord");
                    return;
                }
                Cookies.set("user", JSON.stringify(user), {
                    domain: "localhost",
                });
                window.location.reload();
            }
        }

        uploadToSupabase();
    };

    return (
        <Card className="max-w-xl ml-0 mt-4 p-4">
            <form onSubmit={handleSubmit}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">Profil</CardTitle>
                    <CardDescription>
                        Her kan du se og endre profildetaljer
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="w-full">
                            <Label className="block text-sm font-medium mb-1">
                                Brukernavn
                            </Label>
                            <Input
                                type="text"
                                name="username"
                                className="max-w-md border rounded-md px-3 py-2 mb-2"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <Label className="block text-sm font-medium mb-1">
                                E-post
                            </Label>
                            <Input
                                type="email"
                                name="email"
                                className="max-w-md border rounded-md px-3 py-2 mb-4"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Label className="block text-sm font-medium mb-1">
                                Nytt passord
                            </Label>
                            <Input
                                type="password"
                                className="max-w-md border rounded-md px-3 py-2 mb-2"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <Label className="block text-sm font-medium mb-1">
                                Bekreft passord
                            </Label>
                            <Input
                                type="password"
                                className="max-w-md border rounded-md px-3 py-2 mb-4"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                            />
                            <Button
                                type="submit"
                            >
                                Oppdater
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </form>
        </Card>
    );
};

export default Profile;
