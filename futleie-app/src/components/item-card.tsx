import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { cn } from "@/lib/utils";
import soundboksImage from "../assets/soundboks.jpg";

export function ItemCard({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  // Mock data
  const mockData = {
    title: "Mock Title",
    imageUrl: soundboksImage,
    owner: "Mock Owner",
  };

  return (
    <div
      className={cn("flex flex-column gap-6 justify-center ", className)}
      {...props}
    >
      <Card className="transition-shadow duration-300 ease-in-out shadow-md hover:shadow-2xl hover:scale-105 transform">
        <CardHeader>
          <img
            src={mockData.imageUrl}
            alt="Item Image"
            className="w-full h-auto"
          />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <CardTitle className="text-xl">{mockData.title}</CardTitle>
            <section className="flex flex-row justify-between">
              <p aria-label="owner" className="text-slate-400">
                {mockData.owner}
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
