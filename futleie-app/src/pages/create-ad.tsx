import React from "react";
import CreateItemForm from "@/components/create-item-form";

// Side for å opprette en annonse
const CreateAdPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Opprett ny annonse</h1>
            <CreateItemForm />
        </div>
    );
};

export default CreateAdPage;
