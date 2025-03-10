import { AppSidebar } from "@/components/app-sidebar";

export default function Groups() {
    return (
        <div className="flex h-screen">
            <AppSidebar />
            <div className="flex-1 p-4">
                <h1 className="text-2xl font-bold mb-4">Groups</h1>
                <p>Group content coming soon...</p>
            </div>
        </div>
    );
}
