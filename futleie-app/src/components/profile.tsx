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
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import ItemGrid from "./item-grid.tsx";
import Cookies from "js-cookie";
import Supabase from "../supabaseClient.ts";
import { z } from "zod";

const formSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Description must be at least 10 characters.",
    }),
});

const Profile: React.FC = () => {
    const [userId, setUserId] = useState<Number | undefined>(undefined);
    const [username, setUsername] = useState("[Brukernavn]");
    const [email, setEmail] = useState("epost@example.com");
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

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: username,
            email: email,
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        async function uploadToSupabase(values: z.infer<typeof formSchema>) {
            const { data, error } = await Supabase.from("Users")
                .update([
                    {
                        username: username,
                        email: email,
                    },
                ])
                .eq("id", userId);

            if (error) {
                console.error("Error uploading data:", error);
            } else {
                console.log("Data uploaded successfully:", data);
            }
        }

        uploadToSupabase(values);
    };

    return (
        <Card className="max-w-xl ml-0 mt-4 p-4">
            <form onSubmit={form.handleSubmit(onSubmit)}>
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
                            <Button
                                type="submit"
                                variant="outline"
                                className="md:mt-2 bg-black text-white"
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
