"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Supabase from "../supabaseClient.ts";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    image: z.string().url({
        message: "Please enter a valid image URL.",
    }),
});

function CreateItemForm() {
    const navigate = useNavigate();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            image: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values
        console.log(values);

        const userCookie = Cookies.get("user");
        if (!userCookie || userCookie.length === 0) {
            console.error("User not logged in");
            return;
        }

        const user = JSON.parse(userCookie);

        let userId: Number | undefined = undefined;
        const { data, error } = await Supabase.from("Users")
            .select("id")
            .eq("username", user.username);

        if (data) {
            userId = data[0].id as Number;
        }
        if (error) {
            console.error("Error fetching user id:", error);
            return;
        }

        console.log(user);
        console.log(userId);
        async function uploadToSupabase(values: z.infer<typeof formSchema>) {
            const { data, error } = await Supabase.from("Items").insert([
                {
                    title: values.title,
                    description: values.description,
                    image: values.image,
                    owner_id: userId,
                },
            ]);

            if (error) {
                console.error("Error uploading data:", error);
            } else {
                console.log("Data uploaded successfully:", data);
                navigate('/');
            }
        }

        uploadToSupabase(values);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tittel</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Skriv inn tiitel"
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
                                    placeholder="Forklar litt om tingen du vil leie ut"
                                    className="min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bilde</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Skriv inn bilde-URL"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Opprett annonse</Button>
            </form>
        </Form>
    );
}

export { CreateItemForm };
