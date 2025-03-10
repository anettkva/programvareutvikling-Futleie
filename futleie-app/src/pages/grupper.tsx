import { AppSidebar } from "@/components/app-sidebar";

export default function Grupper() {
    return (
        <div className="flex h-screen">
            <AppSidebar />
            <div className="flex-1 p-4">
                <h1 className="text-2xl font-bold mb-4">Grupper</h1>
                <p>Gruppeinnhold kommer snart...</p>
            </div>
        </div>
    );
}
