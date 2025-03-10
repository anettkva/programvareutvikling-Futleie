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


const formSchema = z.object({
  name: z.string().nonempty({ message: "Navn er påkrevd" }),
  description: z.string().nonempty({ message: "Beskrivelse er påkrevd" }),

});

// Function to generate a random 8-letter code
function generateRandomCode(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Generate a new code if needed
    if (!groupCode) {
      setGroupCode(generateRandomCode());
    }
    
    const userCookie = Cookies.get("user");
    if (!userCookie || userCookie.length === 0) {
      console.error("User not logged in");
      return;
    }

    const userId = JSON.parse(userCookie).id;

    try {
      // Insert the new group into the database
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

      // Navigate back to the groups page
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
            <p><strong>Gruppekode:</strong> {groupCode}</p>
            <p className="text-sm mt-1">Denne koden vil bli brukt for å invitere andre til gruppen.</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Navn</FormLabel>
                    <FormControl>
                      <Input placeholder="Gruppenavn" {...field} />
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
