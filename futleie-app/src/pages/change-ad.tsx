import React from "react";
import Layout from "@/components/layout";
import ChangeItemForm from "@/components/change-item-form";

const ChangeAdPage: React.FC = () => {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Endre annonsen din</h1>
                <ChangeItemForm />
            </div>
        </Layout>
    );
};

export default ChangeAdPage;
