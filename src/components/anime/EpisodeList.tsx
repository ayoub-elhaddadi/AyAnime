"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, List, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Episode } from "@/types/Anime";

interface EpisodeListProps {
    episodes: Episode[];
    currentEpisodeId?: string;
    onEpisodeClick?: (epId: string) => void;
    animeId?: string;
    isLoading?: boolean;
    title?: string;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
    episodes,
    currentEpisodeId,
    onEpisodeClick,
    animeId,
    isLoading,
    title = "Episode List"
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleCount, setVisibleCount] = useState(30);
    const observerTarget = useRef<HTMLDivElement>(null);

    // Filtering logic
    const filteredEpisodes = useMemo(() => {
        if (!searchQuery.trim()) return episodes;
        const query = searchQuery.toLowerCase();
        return episodes.filter(
            (ep) =>
                ep.title?.toLowerCase().includes(query) ||
                ep.episodeNumber.toString() === query ||
                `episode ${ep.episodeNumber}`.includes(query)
        );
    }, [episodes, searchQuery]);

    const visibleEpisodes = useMemo(() => filteredEpisodes.slice(0, visibleCount), [filteredEpisodes, visibleCount]);

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && visibleCount < filteredEpisodes.length) {
                    setVisibleCount((prev) => Math.min(prev + 10, filteredEpisodes.length));
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [visibleCount, filteredEpisodes.length]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <span className="flex items-center gap-2"><List size={20} className="text-primary" /> {title}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase font-bold tracking-widest">
                        {episodes.length} Episodes
                    </span>
                </h3>

                <div className="relative w-full md:w-80 group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-primary transition-colors">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search episode..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setVisibleCount(20);
                        }}
                        className="w-full bg-zinc-900 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all shadow-inner"
                    />
                </div>
            </div>

            {filteredEpisodes.length > 0 ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {visibleEpisodes.map((ep) => {
                            const isCurrent = currentEpisodeId === ep.id;
                            const content = (
                                <>
                                    <div className={cn(
                                        "absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity",
                                        isCurrent && "opacity-100"
                                    )} />

                                    <div className={cn(
                                        "relative shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-zinc-950 border border-white/5 group-hover:border-primary/30 transition-colors shadow-inner",
                                        isCurrent && "border-primary/50"
                                    )}>
                                        <span className={cn(
                                            "text-lg font-black text-zinc-500 group-hover:text-primary transition-colors italic",
                                            isCurrent && "text-primary"
                                        )}>
                                            {ep.episodeNumber}
                                        </span>
                                    </div>

                                    <div className="relative flex-1 min-w-0 pointer-events-none">
                                        <h4 className={cn(
                                            "text-sm font-bold text-white truncate group-hover:text-primary transition-colors",
                                            isCurrent && "text-primary"
                                        )}>
                                            {ep.title || `Episode ${ep.episodeNumber}`}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 group-hover:text-zinc-500">
                                                {isCurrent ? "Watching Now" : "Stream Now"}
                                            </span>
                                            {ep.isFiller && (
                                                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                                    Filler
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {isCurrent ? (
                                        <div className="relative shrink-0 flex items-center justify-center">
                                            <div className="flex gap-1 items-end h-3">
                                                <div className="w-1 bg-primary animate-pulse" style={{ height: '60%', animationDelay: '0s' }} />
                                                <div className="w-1 bg-primary animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }} />
                                                <div className="w-1 bg-primary animate-pulse" style={{ height: '40%', animationDelay: '0.1s' }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play size={16} className="text-primary" />
                                        </div>
                                    )}
                                </>
                            );

                            const className = cn(
                                "group relative flex items-center gap-4 rounded-xl backdrop-blur-md border p-3 transition-all hover:scale-[1.02] active:scale-[0.98] hover:cursor-pointer overflow-hidden shadow-lg text-left",
                                isCurrent
                                    ? "bg-primary/10 border-primary shadow-primary/10"
                                    : "bg-zinc-900/50 border-white/5 shadow-black/20 hover:border-primary/50 hover:bg-primary/5"
                            );

                            if (onEpisodeClick) {
                                return (
                                    <button
                                        key={ep.id}
                                        onClick={() => onEpisodeClick(ep.id)}
                                        className={className}
                                    >
                                        {content}
                                    </button>
                                );
                            }

                            const epIdentifier = ep.id.includes("?ep=") ? ep.id.split("?ep=")[1] : ep.id;
                            const watchHref = animeId
                                ? `/watch/${animeId}?ep=${epIdentifier}`
                                : `/watch/${ep.id}`;

                            return (
                                <Link
                                    key={ep.id}
                                    href={watchHref}
                                    className={className}
                                >
                                    {content}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Infinite Scroll Trigger */}
                    <div ref={observerTarget} className="h-10 w-full flex items-center justify-center">
                        {visibleCount < filteredEpisodes.length && (
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-zinc-900/30">
                    <Search size={40} className="text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">No episodes match your search.</p>
                    <Button
                        variant="ghost"
                        className="mt-2 text-primary hover:bg-primary/5"
                        onClick={() => setSearchQuery("")}
                    >
                        Clear Search
                    </Button>
                </div>
            )}
        </div>
    );
};
