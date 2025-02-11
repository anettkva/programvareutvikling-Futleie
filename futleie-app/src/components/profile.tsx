import React, { useState } from "react";
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ItemGrid from "./item-grid.tsx";

const Profile: React.FC = () => {
    const [username, setUsername] = useState("[Brukernavn]");
    const [email, setEmail] = useState("[epost@example.com]");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Example of updating user info in the database
        // await fetch("/api/update-profile", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ username, email }),
        // })
    };

    return (
        <Card className="max-w-md mx-auto mt-4 p-4">
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
                            <label className="block text-sm font-medium mb-1">
                                Brukernavn
                            </label>
                            <input
                                type="text"
                                className="w-full border rounded-md px-3 py-2 mb-2"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <label className="block text-sm font-medium mb-1">
                                E-post
                            </label>
                            <input
                                type="email"
                                className="w-full border rounded-md px-3 py-2 mb-4"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Button
                                type="submit"
                                variant="outline"
                                className="md:mt-2"
                            >
                                Oppdater
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </form>
            <ItemGrid />
        </Card>
    );
};

export default Profile;
