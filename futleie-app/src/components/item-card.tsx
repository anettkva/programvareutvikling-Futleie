import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
    return (
        <Link
            to={`/item/${id}`}
            className={cn("flex flex-column gap-6 justify-center", className)}
        >
            <Card className="w-80 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg hover:scale-[1.03] transform">
                <CardHeader>
                    <div className="w-full aspect-square bg-gray-100 relative overflow-hidden">
                        {imageUrl ? (
                            <>
                                <img
                                    src={imageUrl}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    style={{ opacity: 0 }}
                                    onLoad={(e) => {
                                        (e.target as HTMLImageElement).style.opacity = '1';
                                    }}
                                />
                                <Skeleton className="absolute inset-0 -z-10" />
                            </>
                        ) : (
                            <Skeleton className="w-full h-full" />
                        )}
                    </div>
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
