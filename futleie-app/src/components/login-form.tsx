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
import { useState } from "react";
import supabaseClient from "@/supabaseClient";
import { User } from "@/Types";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";

const LoginForm: React.FC<{}> = () => {
  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();
  const navigate = useNavigate();

  /**
   * Håndterer innlogging av bruker
   * @param e
   * @returns
   */
  const logIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      const { data } = await supabaseClient
        .from("Users")
        .select("username, password_hash, id")
        .eq("username", username)
        .eq(
          "password_hash",
          CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex)
        );
      console.log(data);
      if (data) {
        const user = data[0] as User;
        if (user === undefined) {
          alert("Feil brukernavn eller passord");
          return;
        }
        Cookies.set("user", JSON.stringify(user), {
          domain: "localhost",
        });
        navigate("/gallery");
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Logg inn</CardTitle>
          <CardDescription>
            Skriv inn brukernavnet ditt nedenfor for å logge inn på kontoen din
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Brukernavn</Label>
                <Input
                  id="username"
                  type="username"
                  placeholder="brukernavn"
                  required
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Passord</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    {/* Glemt passord? */}
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="***********"
                  required
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  autoComplete="off"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                onClick={(e) => logIn(e)}
              >
                Logg inn
              </Button>
              {/* <Button variant="outline" className="w-full">
                Logg inn med Google
              </Button> */}
            </div>
            <div className="mt-4 text-center text-sm">
              Har du ikke bruker?{" "}
              <a href="/signup" className="underline underline-offset-4">
                Registrer deg
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
