"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { AnimeWithEpisodes } from "@/types/Anime";

interface SidebarAnimeCardProps {
    anime: AnimeWithEpisodes;
    index?: number;
}

export const SidebarAnimeCard = ({ anime, index }: SidebarAnimeCardProps) => {
    return (
        <Link
            href={`/anime/${anime.id}`}
            className="group relative flex gap-4 p-2 rounded-xl bg-zinc-900/40 border border-white/5 hover:bg-zinc-900 transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
        >
            {/* Rank / Number if provided */}
            {typeof index === 'number' && (
                <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-4xl font-black italic text-white leading-none">
                        {index + 1}
                    </span>
                </div>
            )}

            {/* Poster */}
            <div className="relative w-16 h-24 shrink-0 rounded-lg overflow-hidden shadow-lg border border-white/5">
                <Image
                    src={anime.poster}
                    alt={anime.title}
                    fill
                    sizes="64px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Score badge on image if score is high */}
                {anime.rank && (
                    <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-md px-1 rounded flex items-center gap-0.5">
                        <Star size={8} className="fill-yellow-500 text-yellow-500" />
                        <span className="text-[8px] font-bold text-white">#{anime.rank}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                <div>
                    <h4 className="text-sm font-bold text-white line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        {anime.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                            {anime.type || 'TV'}
                        </span>

                        {anime.episodes?.eps && (
                            <span className="text-[10px] font-medium text-zinc-500">
                                {anime.episodes.eps} Eps
                            </span>
                        )}

                        {anime.duration && (
                            <span className="text-[10px] font-medium text-zinc-500">
                                {anime.duration}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Status labels */}
                    <div className="flex items-center gap-1.5">
                        {anime.episodes?.sub && anime.episodes.sub > 0 && (
                            <span className="flex items-center gap-0.5 text-[9px] font-black text-primary/80">
                                SUB {anime.episodes.sub}
                            </span>
                        )}
                        {anime.episodes?.dub && anime.episodes.dub > 0 ? (
                            <span className="flex items-center gap-0.5 text-[9px] font-black text-zinc-500">
                                DUB {anime.episodes.dub}
                            </span>
                        ) : <></>}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export const SidebarAnimeSkeleton = () => {
    return (
        <div className="flex gap-4 p-2 rounded-xl bg-zinc-900/40 border border-white/5 animate-pulse">
            <div className="w-16 h-24 shrink-0 rounded-lg bg-white/5" />
            <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                <div>
                    <div className="h-4 w-3/4 bg-white/5 rounded" />
                    <div className="h-3 w-1/2 bg-white/5 rounded mt-3" />
                </div>
                <div className="h-3 w-1/3 bg-white/5 rounded mt-2" />
            </div>
        </div>
    );
};
