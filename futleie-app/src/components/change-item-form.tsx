import { useState, useEffect, ChangeEvent } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { url } from "inspector";

const formSchema = z.object({
    title: z.string().nonempty({ message: "Tittel kreves" }),
    description: z.string().nonempty({ message: "Beskrivelse kreves" }),
    image: z.string(),
});

type ItemImage = {
    id: number;
    image_url: string;
};

function ChangeItemForm() {
    const { itemId } = useParams<{ itemId: string }>();
    const navigate = useNavigate();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            image: "",
        },
    });

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [images, setImages] = useState<ItemImage[]>([]);

    // Henter eksisterende data for annonsen
    useEffect(() => {
        async function fetchItem() {
            // Hent info fra Items
            const { data, error } = await supabaseClient
                .from("Items")
                .select("title, description")
                .eq("id", itemId)
                .single();

            if (error) {
                console.error("Feil ved henting av annonse:", error);
                return;
            }

            if (data) {
                form.reset({
                    title: data.title || "",
                    description: data.description || "",
                    image: "",
                });
            }
        }

        // Hent tilknyttede bilder
        async function fetchImages() {
            const { data, error } = await supabaseClient
                .from("Item_images")
                .select("id, image_url")
                .eq("item_id", itemId);

            if (error) {
                console.error("Feil ved henting av bilder:", error);
                return;
            }

            if (data) {
                setImages(data as ItemImage[]);
            }
        }

        if (itemId) {
            fetchItem();
            fetchImages();
        }
    }, [itemId, form]);

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const image = e.target.files?.[0];
        if (image) {
            setUploadedImage(image);
        }
    };

    const uploadImageToSupabase = async (image: File) => {
        const imageName = `${Date.now()}-${image.name}`;
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

    const handleDeleteImage = async (imageId: number) => {
        const { error } = await supabaseClient
            .from("Item_images")
            .delete()
            .eq("id", imageId);

        if (error) {
            console.error("Feil ved sletting av bilde:", error);
            return;
        }

        // Fjern bildet fra state
        setImages((prev) => prev.filter((img) => img.id !== imageId));
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const userCookie = Cookies.get("user");
        if (!userCookie || userCookie.length === 0) {
            console.error("User not logged in");
            return;
        }

        // Oppdaterer selve annonsen
        const { data: itemData, error: itemError } = await supabaseClient
            .from("Items")
            .update({
                title: values.title,
                description: values.description,
            })
            .eq("id", itemId)
            .select()
            .single();

        if (itemError) {
            console.error("Feil ved oppdatering av annonse:", itemError);
            return;
        }

        // Laster opp eventuelt nytt bilde
        if (uploadedImage) {
            const imageUrl = await uploadImageToSupabase(uploadedImage);
            if (imageUrl) {
                const { error: imageError } = await supabaseClient
                    .from("Item_images")
                    .insert([{ item_id: itemId, image_url: imageUrl }]);

                if (imageError) {
                    console.error("Feil ved oppdatering av bilde:", imageError);
                    return;
                }
            }
        }

        console.log("Annonse oppdatert:", itemData);
        navigate("/");
    }

    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                >
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
                                <FormLabel>Nytt bilde</FormLabel>
                                <FormControl>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Endre annonse</Button>
                </form>
            </Form>

            {/* Viser eksisterende bilder med mulighet for sletting */}
            <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">
                    Eksisterende bilder
                </h2>
                {images.length === 0 ? (
                    <p>Ingen bilder å vise</p>
                ) : (
                    images.map((img) => (
                        <div
                            key={img.id}
                            className="flex items-center gap-2 mt-2"
                        >
                            <img
                                src={img.image_url}
                                alt="Item"
                                className="w-32 h-32 object-cover"
                            />
                            <Button
                                variant="destructive"
                                onClick={() => handleDeleteImage(img.id)}
                            >
                                Slett
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}

export default ChangeItemForm;
