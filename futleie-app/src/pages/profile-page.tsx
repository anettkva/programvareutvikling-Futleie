import ItemGrid from "@/components/item-grid";
import Profile from "@/components/profile";

export default function ProfilePage() {
    return (
        <div className="flex flex-col 2xl:flex-row w-full gap-4">
            <div className="2xl:w-1/2 w-full">
                <Profile />
            </div>
            <div className="2xl:w-1/2 w-full">
                <h1 className="text-3xl font-bold mb-6 px-5">Mine annonser</h1>
                <ItemGrid />
            </div>
        </div>
    );
}
