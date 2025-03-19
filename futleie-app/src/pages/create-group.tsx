import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useState } from "react";
import supabaseClient from "@/supabaseClient";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Definerer hva slags input formen forventer
const formSchema = z.object({
    name: z.string().nonempty({ message: "Navn er påkrevd" }),
    description: z.string().nonempty({ message: "Beskrivelse er påkrevd" }),
});

// Funksjon for å generere en tilfeldig kode for annonsen.
// Standard er 8 tegn lang kode
function generateRandomCode(length = 8) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }
    return result;
}

// Komponenten som tillater opprettelse av nye gruppe.
export default function CreateGroup() {
    const navigate = useNavigate();
    const [groupCode, setGroupCode] = useState(generateRandomCode());
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    // Funksjon som kjører når skjemaet blir sendt inn
    // Oppretter en ny gruppe i databasen
    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Generer en gruppekode hvis den ikke allerede er satt
        if (!groupCode) {
            setGroupCode(generateRandomCode());
        }

        // Hente brukeren sin ID fra cookien
        const userCookie = Cookies.get("user");
        if (!userCookie || userCookie.length === 0) {
            console.error("User not logged in");
            return;
        }

        const userId = JSON.parse(userCookie).id;

        try {
            // Insert den nye gruppen i databasen
            const { error } = await supabaseClient
                .from("Groups")
                .insert([
                    {
                        name: values.name,
                        description: values.description,
                        owner_id: userId,
                        code: groupCode,
                    },
                ])
                .select()
                .single();

            if (error) {
                console.error("Error creating group:", error);
                return;
            }

            // Naviger tilbake til gruppesiden
            navigate("/grupper");
        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <div className="container mx-auto py-6">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Opprett ny gruppe</h1>
                <div className="bg-[#FDEDE7] border border-[#F26416] text-[#F26416] px-4 py-3 rounded mb-4">
                    <p>
                        <strong>Gruppekode:</strong> {groupCode}
                    </p>
                    <p className="text-sm mt-1">
                        Denne koden vil bli brukt for å invitere andre til
                        gruppen.
                    </p>
                </div>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Navn</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Gruppenavn"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Beskrivelse</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Skriv en beskrivelse av gruppen..."
                                            className="min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full">
                            Opprett gruppe
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
