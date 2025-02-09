import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ItemCardProps extends React.ComponentPropsWithoutRef<"div"> {
  title: string;
  imageUrl: string;
  owner: string;
}

const ItemCard: React.FC<ItemCardProps> = ({
  className,
  title,
  imageUrl,
  owner,
  ...props
}) => {
  console.log("Rendering ItemCard with props:", { title, imageUrl, owner });

  return (
    <div
      className={cn("flex flex-column gap-6 justify-center", className)}
      {...props}
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
    </div>
  );
};

export default ItemCard;
