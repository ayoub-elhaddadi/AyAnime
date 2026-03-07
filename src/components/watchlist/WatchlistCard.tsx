"use client";

import { motion } from "framer-motion";
import { Trash2, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCollections } from "@/lib/hooks/useCollections";
import { cn } from "@/lib/utils";
import { WatchlistItemWithAnime } from "./WatchlistBoard";
import { Anime } from "@/lib/jikan";

interface WatchlistCardProps {
    item: WatchlistItemWithAnime;
}

export const WatchlistCard = ({ item }: WatchlistCardProps) => {
    const anime = item.animes;
    const { updateWatchlistStatus, updateWatchlistProgress, toggleWatchlist } = useCollections(item.anime_id, anime as unknown as Anime);

    const statusColors: Record<string, string> = {
        planned: "bg-zinc-800 text-zinc-400",
        watching: "bg-primary/20 text-primary border-primary/20",
        completed: "bg-green-500/20 text-green-500 border-green-500/20",
        dropped: "bg-red-500/20 text-red-500 border-red-500/20",
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -2 }}
            className="group cursor-grab active:cursor-grabbing"
            draggable
            // @ts-expect-error - Framer motion's onDragStart clashes with HTML5 onDragStart
            onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                e.dataTransfer.setData("animeId", item.anime_id.toString());
                e.dataTransfer.setData("currentStatus", item.status || "");
                e.dataTransfer.effectAllowed = "move";
            }}
        >
            <Card className="overflow-hidden border-white/5 bg-zinc-900/80 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex p-3 gap-4">
                    {/* Image Thumb */}
                    <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg shadow-md">
                        <Image
                            src={anime.image_url || "/placeholder.jpg"}
                            alt={anime.title}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col justify-between overflow-hidden">
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="line-clamp-1 text-sm font-bold text-white group-hover:text-primary transition-colors">
                                    {anime.title}
                                </h3>
                            </div>

                            <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 uppercase font-black tracking-wider", statusColors[item.status || "planned"])}>
                                    {item.status}
                                </Badge>
                                <span className="text-[11px] text-zinc-500 font-medium">
                                    {anime.year} • {anime.season || "N/A"}
                                </span>
                            </div>
                        </div>

                        {/* Progress Section */}
                        <div className="mt-3 flex items-center justify-between bg-black/20 rounded-xl p-2 pl-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Progress</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <select
                                    className="bg-zinc-800 text-white text-sm font-bold rounded-lg px-3 py-2 outline-none border border-white/5 cursor-pointer hover:border-primary/50 transition-colors h-9 md:h-8"
                                    value={item.episode_progress || 0}
                                    onChange={(e) => updateWatchlistProgress.mutate(parseInt(e.target.value))}
                                    disabled={updateWatchlistProgress.isPending}
                                >
                                    {Array.from({ length: (anime.episodes || 100) + 1 }).map((_, i) => (
                                        <option key={i} value={i}>
                                            {i}
                                        </option>
                                    ))}
                                </select>
                                <span className="text-[10px] font-bold text-zinc-600">/ {anime.episodes || "?"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t border-white/5 flex items-center justify-between p-3 bg-black/10">
                    <div className="flex gap-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 md:h-7 md:w-7 rounded-full text-red-400/50 hover:text-red-500 hover:bg-red-500/10 hover:cursor-pointer"
                            title="Remove from watchlist"
                            onClick={() => toggleWatchlist.mutate()}
                            disabled={toggleWatchlist.isPending}
                        >
                            <Trash2 size={16} className="md:size-4" />
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        {item.status !== 'completed' && anime.episodes && item.episode_progress === anime.episodes && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-9 md:h-7 text-[10px] font-black text-green-500 hover:bg-green-500/10 uppercase tracking-wider px-4 md:px-3"
                                onClick={() => updateWatchlistStatus.mutate('completed')}
                            >
                                Finish
                            </Button>
                        )}
                        <Button
                            size="icon"
                            variant="default"
                            title="View Anime details"
                            className="h-9 w-9 md:h-7 md:w-7 rounded-full bg-primary/20 text-primary hover:bg-primary shadow-lg shadow-black/20"
                            asChild
                        >
                            <Link href={`/anime/${item.anime_id}`}>
                                <ExternalLink size={16} className="md:size-4" fill="currentColor" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};
