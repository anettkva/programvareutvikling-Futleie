import { useState, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const formSchema = z.object({
    title: z.string().nonempty({ message: "Title is required" }),
    description: z.string().nonempty({ message: "Description is required" }),
    image: z.string(),
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

    const [uploadedImages, setuploadedImages] = useState<File[] | null>([]);

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setuploadedImages((prevFiles) => [
                ...(prevFiles || []),
                ...(e.target.files || []),
            ]);
        }
    };

    const uploadImageToSupabase = async (image: File) => {
        const imageName = `${Date.now()}-${image.name.replace(
            /[æøåÆØÅ]/g,
            ""
        )}`;

        const { error } = await supabaseClient.storage
            .from("images")
            .upload(imageName, image);

        if (error) {
            console.error("Upload failed:", error.message);
            return null;
        }

        const { data: urlData } = await supabaseClient.storage
            .from("images")
            .getPublicUrl(imageName);
        const imageUrl = urlData.publicUrl;

        return imageUrl;
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const submitButton = document.getElementById("submitButton") as HTMLButtonElement;
        if (submitButton) {
            submitButton.disabled = true;
        } 
        const userCookie = Cookies.get("user");
        if (!userCookie || userCookie.length === 0) {
            console.error("User not logged in");
            return;
        }

        const userId = JSON.parse(userCookie).id;

        const { data: itemData, error: itemError } = await supabaseClient
            .from("Items")
            .insert([
                {
                    title: values.title,
                    description: values.description,
                    owner_id: userId,
                },
            ])
            .select()
            .single();

        if (itemError) {
            console.error("Error uploading data:", itemError);
            return;
        }

        const itemId = itemData.id;

        if (uploadedImages) {
            const imageUrls = await Promise.all(
                uploadedImages.map((image) => {
                    return uploadImageToSupabase(image);
                })
            );
            if (imageUrls) {
                imageUrls.map(async (url) => {
                    const { error: imageError } = await supabaseClient
                        .from("Item_images")
                        .insert([{ item_id: itemId, image_url: url }]);

                    if (imageError) {
                        console.error(
                            "Error uploading image data:",
                            imageError
                        );
                        return;
                    }
                });
            }
        }

        console.log("Data uploaded successfully:", itemData);
        navigate("/");
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
                                    placeholder="Skriv inn tittel"
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
                                <Input
                                    placeholder="Beskriv gjenstanden..."
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
                    render={() => (
                        <FormItem>
                            <FormLabel>Bilde</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => {
                                        handleImageUpload(e);
                                        console.log(uploadedImages);
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button id="submitButton" type="submit">Lag annonse</Button>
            </form>
        </Form>
    );
}

export default CreateItemForm;
