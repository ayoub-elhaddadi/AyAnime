"use client";

import { motion } from "framer-motion";
import { Star, Play, Plus, Check, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCollections } from "@/lib/hooks/useCollections";
import { cn } from "@/lib/utils";
import type { AnimeInfo } from "@/types/Anime";

interface AnimeCardProps {
    id: string;
    title: string;
    image: string;
    rating?: string;
    status?: string;
    type?: string;
}

export const AnimeCard = ({ id, title, image, rating, status, type }: AnimeCardProps) => {
    const { isWatchlisted, isFavorited, toggleWatchlist, toggleFavorite } = useCollections(id, {
        title,
        poster: image,
        MAL_score: rating || "0",
        status,
        type,
    } as unknown as AnimeInfo);

    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="group relative"
        >
            <Link href={`/anime/${id}`}>
                <Card className="overflow-hidden border-none bg-zinc-900 shadow-xl transition-all group-hover:shadow-primary/20 group-hover:ring-1 group-hover:ring-primary/50">
                    <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        {/* Status Badge */}
                        {status && (
                            <div className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-lg">
                                {status}
                            </div>
                        )}

                        {/* Rating */}
                        {rating && rating !== "0" && (
                            <div className="absolute right-2 top-2 flex items-center gap-1 rounded bg-black/60 px-2 py-1 backdrop-blur-md">
                                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-bold text-white">{rating}</span>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 translate-y-10 items-center gap-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                            <Button
                                size="icon"
                                variant="default"
                                className="rounded-full h-10 w-10 shadow-lg shadow-black/50 hover:cursor-pointer"
                                title="View Details"
                                asChild
                            >
                                <span>
                                    <Play size={18} fill="white" />
                                </span>
                            </Button>

                            <Button
                                size="icon"
                                variant="outline"
                                className={cn(
                                    "rounded-full h-10 w-10 bg-black/40 border-white/20 hover:bg-white hover:text-black shadow-lg shadow-black/50 hover:cursor-pointer",
                                    isWatchlisted && "bg-primary border-primary text-white hover:bg-primary/80 hover:text-white"
                                )}
                                title={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
                                disabled={toggleWatchlist.isPending}
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleWatchlist.mutate();
                                }}
                            >
                                {isWatchlisted ? <Check size={20} /> : <Plus size={20} />}
                            </Button>
                            <Button
                                size="icon"
                                variant="outline"
                                className={cn(
                                    "rounded-full h-10 w-10 bg-black/40 border-white/20 hover:bg-white hover:text-black shadow-lg shadow-black/50 hover:cursor-pointer",
                                    isFavorited && "bg-red-500 border-red-500 text-white hover:bg-red-500/80 hover:text-white"
                                )}
                                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                                disabled={toggleFavorite.isPending}
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleFavorite.mutate();
                                }}
                            >
                                <Heart size={20} className={isFavorited ? "fill-white" : ""} />
                            </Button>
                        </div>
                    </div>

                    <div className="p-3">
                        <h3 title={title} className="line-clamp-1 text-sm font-semibold text-white transition-colors group-hover:text-primary">
                            {title}
                        </h3>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-400">
                            <span>{type || "Anime"}</span>
                            <span>Anime</span>
                        </div>
                    </div>
                </Card>
            </Link>
        </motion.div>
    );
};
