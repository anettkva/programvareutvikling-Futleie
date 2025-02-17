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

    const [uploadedImages, setUploadedImages] = useState<File[] | null>([]);
    const [images, setImages] = useState<ItemImage[]>([]);

    // Henter eksisterende data for annonsen
    useEffect(() => {
        async function fetchItem() {
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
        if (e.target.files && e.target.files.length > 0) {
            setUploadedImages((prevFiles) => [...prevFiles || [], ...e.target.files || []]);
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

        setImages((prev) => prev.filter((img) => img.id !== imageId));
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const userCookie = Cookies.get("user");
        if (!userCookie || userCookie.length === 0) {
            console.error("User not logged in");
            return;
        }

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

        if (uploadedImages) {
            const imageUrls = await Promise.all(uploadedImages.map((image) => {
                return uploadImageToSupabase(image);
            } ));
            if (imageUrls) {
                imageUrls.map(async (url) => {
                    const { error: imageError } = await supabaseClient
                        .from("Item_images")
                        .insert([{ item_id: itemId, image_url: url }]);
    
                    if (imageError) {
                        console.error("Error uploading image data:", imageError);
                        return;
                    }
                })
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
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => {handleImageUpload(e); console.log(uploadedImages)}}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Endre annonse</Button>
                </form>
            </Form>

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
