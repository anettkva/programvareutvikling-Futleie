import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CreateAdButton: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateAd = () => {
    navigate("/create-ad");
  };

  return (
    <div className="container mx-auto flex justify-end">
      <Button onClick={handleCreateAd}>Opprett annonse</Button>
    </div>
  );
};

export default CreateAdButton;
