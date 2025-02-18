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
            <Card className="w-64 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg hover:scale-[1.03] transform flex flex-col">
                <CardHeader className="p-0 pt-0 px-0 pb-6">
                    <div className="w-full aspect-square bg-gray-100 relative overflow-hidden rounded-t-lg">
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
                <CardContent className="flex-1 flex flex-col justify-between">
                        <div className="w-full overflow-hidden">
                            <CardTitle className="text-xl line-clamp-2">{title}</CardTitle>
                        </div>
                        <section className="flex flex-row justify-between mt-auto">
                            <p aria-label="owner" className="text-slate-400">
                                {owner}
                            </p>
                        </section>
                </CardContent>
            </Card>
        </Link>
    );
};

export default ItemCard;
