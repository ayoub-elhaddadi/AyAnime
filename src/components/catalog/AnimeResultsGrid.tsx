"use client";

import { AnimeCard } from "@/components/anime/AnimeCard";
import { Anime } from "@/lib/jikan";

interface AnimeResultsGridProps {
    animeList?: Anime[];
    isLoading: boolean;
    skeletonCount?: number;
}

export function AnimeResultsGrid({
    animeList,
    isLoading,
    skeletonCount = 12
}: AnimeResultsGridProps) {
    if (isLoading && (!animeList || animeList.length === 0)) {
        return (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-6">
                {Array.from({ length: skeletonCount }).map((_, i) => (
                    <div
                        key={i}
                        className="aspect-[3/4] animate-pulse rounded-xl bg-zinc-900 border border-white/5"
                    />
                ))}
            </div>
        );
    }

    if (!animeList || animeList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="h-20 w-20 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                    <span className="text-4xl text-zinc-700">?</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
                <p className="text-zinc-500 max-w-xs mx-auto">
                    Try adjusting your filters or search terms to find what you're looking for.
                </p>
            </div>
        );
    }

    // Filter duplicates by mal_id
    const uniqueAnime = animeList.filter((anime, index, self) =>
        index === self.findIndex((a) => a.mal_id === anime.mal_id)
    );

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-6">
            {uniqueAnime.map((anime) => (
                <AnimeCard
                    key={anime.mal_id}
                    id={anime.mal_id}
                    title={anime.title}
                    image={anime.images.webp.large_image_url}
                    rating={anime.score}
                    year={anime.year}
                    status={anime.status}
                />
            ))}
        </div>
    );
}
