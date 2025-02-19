import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import supabaseClient from "@/supabaseClient";
import { useState } from "react";
import CryptoJS from "crypto-js";
import Cookie from "js-cookie";
import { useNavigate } from "react-router-dom";
import { User } from "@/Types";

const Signup: React.FC<{}> = () => {
    const [uname, setUname] = useState<string>("");
    const [mail, setMail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();

    const setCookie = async () => {
        const { data } = await supabaseClient
            .from("Users")
            .select("username,password_hash, id")
            .eq(
                "password_hash",
                CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex)
            )
            .eq("username", uname);
        let user;
        if (data) {
            user = data[0] as User;
            console.log(user);
            Cookie.set("user", JSON.stringify(user), { domain: "localhost" });
        }
        navigate("/");
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        const userExists = await usernameTaken();
        if(userExists) {
            return;
        }
        const { data, error } = await supabaseClient.from("Users").insert([
            {
                username: uname,
                email: mail,
                password_hash: CryptoJS.SHA256(password).toString(
                    CryptoJS.enc.Hex
                ),
            },
        ]);
        if (error) {
            console.error("Error inserting data:", error);
        } else {
            setCookie();
        }
    };

    const usernameTaken = async () => {
        const { data, error } = await supabaseClient.from("Users").select();
        if (data) {
            console.log(data);
            const existingUser = data.filter((user) => user.username === uname)
            if (existingUser[0]) {
                alert(`User with username \"${uname}\" already exists`)
                return true;
            }
        }
        else {
            return false;
        }
    }

    return (
        <div className={cn("flex flex-col gap-6")}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Opprett bruker</CardTitle>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="username">Brukernavn</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="JohnSmith"
                                    required
                                    onChange={(e) => {
                                        setUname(e.target.value);
                                    }}
                                    autoComplete="off"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">E-post</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john.smith@example.com"
                                    required
                                    onChange={(e) => {
                                        setMail(e.target.value);
                                    }}
                                    autoComplete="off"
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Passord</Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="***********"
                                    required
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                    }}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                onClick={(e) => handleSignup(e)}
                            >
                                Opprett
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Signup;
