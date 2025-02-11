import React from 'react';
import Layout from '@/components/layout';
import { CreateItemForm } from '@/components/create-item-form';

const CreateAdPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Opprett ny annonse</h1>
        <CreateItemForm />
      </div>
    </Layout>
  );
};

export default CreateAdPage;
