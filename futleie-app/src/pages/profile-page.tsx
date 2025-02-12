import ItemGrid from "@/components/item-grid";
import Profile from "@/components/profile";

export default function ProfilePage() {
    return (
        <div className="flex w-full gap-4">
            <div className="w-1/2">
                <Profile />
            </div>
            <div className="w-1/2">
                <h1 className="text-3xl font-bold mb-6 px-5">Mine annonser</h1>
                <ItemGrid />
            </div>
        </div>
    );
}
