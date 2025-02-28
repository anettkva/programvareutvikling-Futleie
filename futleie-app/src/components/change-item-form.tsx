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
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";

const categories = ["Teknologi", "Verktøy", "Sport og Fritid", "Diverse"];
const locations = [
    "Agder",
    "Innlandet",
    "Møre og Romsdal",
    "Nordland",
    "Oslo",
    "Rogaland",
    "Troms og Finnmark",
    "Trøndelag",
    "Vestfold og Telemark",
    "Vestland",
    "Østfold",
    "Akershus",
    "Buskerud",
];

const formSchema = z.object({
    title: z.string().nonempty({ message: "Tittel kreves" }),
    description: z.string().nonempty({ message: "Beskrivelse kreves" }),
    image: z.string(),
    category: z.string().nonempty({ message: "Kategori kreves" }),
    location: z.string().nonempty({ message: "Lokasjon kreves" }),
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
            category: "",
            location: "",
        },
    });

    const [uploadedImages, setUploadedImages] = useState<File[] | null>([]);
    const [images, setImages] = useState<ItemImage[]>([]);

    // Henter eksisterende data for annonsen
    useEffect(() => {
        async function fetchItem() {
            const { data, error } = await supabaseClient
                .from("Items")
                .select("title, description, category, location")
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
                    category: data.category || "",
                    location: data.location || "",
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
            setUploadedImages((prevFiles) => [
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
                category: values.category,
                location: values.location,
            })
            .eq("id", itemId)
            .select()
            .single();

        if (itemError) {
            console.error("Feil ved oppdatering av annonse:", itemError);
            return;
        }

        if (uploadedImages) {
            const imageUrls = await Promise.all(
                uploadedImages.map((image) => uploadImageToSupabase(image))
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
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kategori</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="border rounded p-2">
                                            <SelectValue placeholder="Velg kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat, idx) => (
                                                <SelectItem
                                                    key={idx}
                                                    value={cat}
                                                >
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Lokasjon</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="border rounded p-2">
                                            <SelectValue placeholder="Velg lokasjon" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {locations.map((loc, idx) => (
                                                <SelectItem
                                                    key={idx}
                                                    value={loc}
                                                >
                                                    {loc}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
