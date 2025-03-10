import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Groups() {
    const navigate = useNavigate();
    const handleCreateGroup = () => {
        navigate("/create-group");
    };
    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Groups</h1>
                <Button
                    onClick={handleCreateGroup}
                >
                    Opprett gruppe
                </Button>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">Ingen grupper å vise ennå. Opprett en ny gruppe for å komme i gang.</p>
            </div>
        </div>
    );
}
