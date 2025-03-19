import React from "react";
import ChangeItemForm from "@/components/change-item-form";

// Side for å endre en annonse
const ChangeAdPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Endre annonsen din</h1>
            <ChangeItemForm />
        </div>
    );
};

export default ChangeAdPage;
