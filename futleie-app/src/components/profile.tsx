import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import Supabase from "../supabaseClient.ts";
import { User } from "../Types/User.ts";
import CryptoJS from "crypto-js";

const Profile: React.FC = () => {
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [username, setUsername] = useState("[Brukernavn]");
  const [email, setEmail] = useState("epost@example.com");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingCounter, setRatingCounter] = useState<number>(0);

  // Hent brukerinformasjon fra Supabase
  useEffect(() => {
    async function getUser() {
      const userCookie = Cookies.get("user");

      if (!userCookie || userCookie.length === 0) {
        console.error("User not logged in");
      }

      const user = JSON.parse(userCookie as string);

      const { data, error } = await Supabase.from("Users")
        .select("id, username, email, tot_rating, rating_counter")
        .eq("username", user.username);

      if (data) {
        setUserId(data[0].id as number);
        setUsername(data[0].username as string);
        setEmail(data[0].email as string);
        setUserRating(data[0].tot_rating);
        setRatingCounter(data[0].rating_counter || 0);
      }
      if (error) {
        console.error("Error fetching user id:", error);
      }
    }
    getUser();
  }, []);

  /**
   * Håndterer oppdatering av brukerinformasjon
   * @param e
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    async function uploadToSupabase() {
      const requestBody: {
        username: string;
        email: string;
        password_hash?: string;
      } = {
        username,
        email,
      };
      // Oppdater kun passord hvis nye felt matcher og ikke er tomme
      if (newPassword && confirmPassword && newPassword === confirmPassword) {
        requestBody.password_hash = CryptoJS.SHA256(newPassword).toString(
          CryptoJS.enc.Hex
        );
      }

      const { data, error } = await Supabase.from("Users")
        .update([requestBody])
        .eq("id", userId)
        .select("id, username, password_hash");

      if (error) {
        console.error("Error updating user:", error);
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
              <Label className="block text-sm font-medium mb-1">E-post</Label>
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
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button type="submit">Oppdater</Button>
            </div>
          </div>
        </CardContent>
      </form>
      <CardFooter className="flex flex-col items-start pt-4 border-t">
        <CardTitle className="text-xl mb-2">Min vurdering</CardTitle>
        <div className="flex items-center">
          {userRating !== null && ratingCounter > 0 ? (
            <>
              <span className="text-2xl font-bold mr-2">
                {(userRating / ratingCounter).toFixed(1)}
              </span>
              <span className="text-2xl text-yellow-500">★</span>
              <span className="ml-2 text-sm text-gray-500">
                ({ratingCounter}{" "}
                {ratingCounter === 1 ? "vurdering" : "vurderinger"})
              </span>
            </>
          ) : (
            <span className="text-gray-500">Ingen vurderinger ennå</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default Profile;
