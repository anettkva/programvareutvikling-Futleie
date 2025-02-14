import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ItemCardProps {
  id: number;
  title: string;
  imageUrl: string;
  owner: string;
  className?: string;
}

const ItemCard: React.FC<ItemCardProps> = ({
  className,
  id,
  title,
  imageUrl,
  owner,
}) => {
  console.log("Rendering ItemCard with props:", { id, title, imageUrl, owner });

  return (
    <Link
      to={`/item/${id}`}
      className={cn("flex flex-column gap-6 justify-center", className)}
    >
      <Card className="transition-shadow duration-300 ease-in-out shadow-md hover:shadow-2xl hover:scale-105 transform">
        <CardHeader>
          <img src={imageUrl} alt="Item Image" className="w-full h-auto" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <CardTitle className="text-xl">{title}</CardTitle>
            <section className="flex flex-row justify-between">
              <p aria-label="owner" className="text-slate-400">
                {owner}
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ItemCard;
