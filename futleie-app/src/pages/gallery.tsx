import CreateAdButton from "@/components/create-ad-button";
import GalleryItemGrid from "@/components/gallery-item-grid";

// Side for å vise alle annonser
export default function Gallery() {
    return (
        <div className="w-full">
            <h1 className="text-3xl font-bold mb-6 px-5">Finn noe å låne!</h1>
            <CreateAdButton />
            <GalleryItemGrid />
        </div>
    );
}
