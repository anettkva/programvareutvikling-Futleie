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
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers not showing
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const categories = ["Teknologi", "Verktøy", "Sport og Fritid", "Diverse"];

const formSchema = z.object({
    title: z.string().nonempty({ message: "Title is required" }),
    description: z.string().nonempty({ message: "Description is required" }),
    image: z.string(),
    category: z.string().nonempty({ message: "Kategori er påkrevd" }),
    lat: z.number().optional(),
    lng: z.number().optional(),
});

// Helper component for map click events
function LocationMarker({
    position,
    setPosition,
}: {
    position: { lat: number; lng: number } | null;
    setPosition: (pos: { lat: number; lng: number }) => void;
}) {
    const map = useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition({ lat, lng });
        },
    });

    return position === null ? null : (
        <Marker position={[position.lat, position.lng]} />
    );
}

function CreateItemForm() {
    const navigate = useNavigate();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            image: "",
            category: "",
            lat: undefined,
            lng: undefined,
        },
    });

    const [uploadedImages, setuploadedImages] = useState<File[] | null>([]);
    const [userLocation, setUserLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [locationStatus, setLocationStatus] = useState<string>("");
    const [mapCenter, setMapCenter] = useState<[number, number]>([
        63.430515, 10.395087,
    ]);

    // Update form values when location changes
    useEffect(() => {
        if (userLocation) {
            form.setValue("lat", userLocation.lat);
            form.setValue("lng", userLocation.lng);
            setMapCenter([userLocation.lat, userLocation.lng]);
        }
    }, [userLocation, form]);

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setuploadedImages((prevFiles) => [
                ...(prevFiles || []),
                ...(e.target.files || []),
            ]);
        }
    };

    const handleGetLocation = () => {
        setLocationStatus("Henter posisjon...");

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    setUserLocation({ lat, lng });
                    setLocationStatus("Posisjon funnet!");
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocationStatus(
                        "Kunne ikke hente posisjon. Sjekk tillatelser."
                    );
                }
            );
        } else {
            setLocationStatus(
                "Geolokalisering støttes ikke i denne nettleseren."
            );
        }
    };

    const handleMapClick = (position: { lat: number; lng: number }) => {
        setUserLocation(position);
        setLocationStatus("Posisjon satt på kartet");
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
        const submitButton = document.getElementById(
            "submitButton"
        ) as HTMLButtonElement;
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
                    category: values.category,
                    lat: values.lat,
                    lng: values.lng,
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
                                            <SelectItem key={idx} value={cat}>
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

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <FormLabel>Nøyaktig posisjon</FormLabel>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleGetLocation}
                            className="flex items-center gap-1"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="10"></circle>
                                <circle cx="12" cy="12" r="1"></circle>
                            </svg>
                            Hent min posisjon
                        </Button>
                    </div>

                    <div className="text-sm text-gray-500">
                        {locationStatus || "Ingen posisjon satt"}
                    </div>

                    <div
                        className="mt-4"
                        style={{ height: "400px", width: "100%" }}
                    >
                        <p className="text-sm mb-2">
                            Klikk på kartet for å velge posisjon
                        </p>
                        <MapContainer
                            center={mapCenter}
                            zoom={13}
                            scrollWheelZoom={true}
                            style={{
                                height: "100%",
                                width: "100%",
                                borderRadius: "8px",
                            }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationMarker
                                position={userLocation}
                                setPosition={handleMapClick}
                            />
                        </MapContainer>
                    </div>

                    {userLocation && (
                        <div className="flex flex-row gap-2 mt-2">
                            <div className="flex-1">
                                <FormLabel className="text-xs">
                                    Breddegrad
                                </FormLabel>
                                <Input
                                    readOnly
                                    value={userLocation.lat.toFixed(6)}
                                />
                            </div>
                            <div className="flex-1">
                                <FormLabel className="text-xs">
                                    Lengdegrad
                                </FormLabel>
                                <Input
                                    readOnly
                                    value={userLocation.lng.toFixed(6)}
                                />
                            </div>
                        </div>
                    )}
                </div>

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
                <Button id="submitButton" type="submit">
                    Lag annonse
                </Button>
            </form>
        </Form>
    );
}

export default CreateItemForm;
