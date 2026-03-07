"use client";

import { useQuery } from "@tanstack/react-query";
import { animeService } from "@/lib/jikan";
import { AnimeCarousel } from "@/components/anime/AnimeCarousel";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Play, Info, TrendingUp, Calendar, Zap, Smile } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { TrailerModal } from "@/components/shared/TrailerModal";

export default function HomePage() {
    const { data: trending, isLoading: trendingLoading } = useQuery({
        queryKey: ["trending"],
        queryFn: () => animeService.getTopAnime(1),
    });

    const { data: seasonal, isLoading: seasonalLoading } = useQuery({
        queryKey: ["seasonal"],
        queryFn: () => animeService.getRecentAnime(),
    });

    const { data: actionAnime, isLoading: actionLoading } = useQuery({
        queryKey: ["actionAnime"],
        queryFn: () => animeService.getAnimeByGenre(1, 1, 12),
    });

    const { data: comedyAnime, isLoading: comedyLoading } = useQuery({
        queryKey: ["comedyAnime"],
        queryFn: () => animeService.getAnimeByGenre(4, 1, 12),
    });

    const heroAnime = trending?.data?.[0];
    const [heroTrailerOpen, setHeroTrailerOpen] = useState(false);

    return (
        <>
            <Navbar />
            <main className="min-h-screen pb-20">
                {/* Hero Section */}
                <section className="relative h-[85vh] w-full overflow-hidden">
                    {heroAnime && (
                        <>
                            <div className="absolute inset-0">
                                <Image
                                    src={heroAnime.images.webp.large_image_url}
                                    alt={heroAnime.title}
                                    fill
                                    className="object-cover opacity-30 blur-[2px]"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
                            </div>

                            <div className="container relative mx-auto flex h-full flex-col justify-center px-4 pt-20 xl:px-20">
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="max-w-2xl"
                                >
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className="rounded bg-primary/20 px-2 py-1 text-xs font-bold text-primary ring-1 ring-primary/30">
                                            #1 MOST POPULAR
                                        </span>
                                        <div className="flex items-center gap-1 text-xs font-semibold text-yellow-400">
                                            <TrendingUp size={14} />
                                            <span>Trending Now</span>
                                        </div>
                                    </div>

                                    <h1 className="mb-6 text-4xl font-black leading-tight text-white md:text-7xl">
                                        {heroAnime.title}
                                    </h1>

                                    <p className="mb-8 line-clamp-3 text-base text-zinc-300 md:text-lg">
                                        {heroAnime.synopsis}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-4">
                                        {heroAnime.trailer?.embed_url && (
                                            <Button
                                                size="lg"
                                                className="rounded-full px-8 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:cursor-pointer"
                                                onClick={() => setHeroTrailerOpen(true)}
                                            >
                                                <Play className="mr-2 fill-white" size={20} /> Watch Trailer
                                            </Button>
                                        )}
                                        <Link href={`/anime/${heroAnime.mal_id}`}>
                                            <Button size="lg" variant="outline" className="rounded-full border-white/10 bg-white/5 px-8 backdrop-blur-md hover:bg-white/10 hover:cursor-pointer">
                                                <Info className="mr-2" size={20} /> Anime Details
                                            </Button>
                                        </Link>
                                    </div>
                                </motion.div>
                            </div>
                        </>
                    )}
                </section>

                {/* Content Sections */}
                <div className="container mx-auto px-4 space-y-16 -mt-20 relative z-10 xl:px-20">
                    <AnimeCarousel
                        title="Top Trending"
                        description="The most popular series right now"
                        data={trending?.data?.slice(0, 12)}
                        isLoading={trendingLoading}
                        icon={<TrendingUp size={20} className="text-primary" />}
                    />

                    <AnimeCarousel
                        title="New This Season"
                        description="Latest additions for Spring 2026"
                        data={seasonal?.data?.slice(0, 12)}
                        isLoading={seasonalLoading}
                        icon={<Calendar size={20} className="text-primary" />}
                    />

                    <AnimeCarousel
                        title="Adrenaline Rush"
                        description="Best action-packed anime"
                        data={actionAnime?.data}
                        isLoading={actionLoading}
                        icon={<Zap size={20} className="text-primary" />}
                    />

                    <AnimeCarousel
                        title="Laugh Out Loud"
                        description="Funniest comedy series"
                        data={comedyAnime?.data}
                        isLoading={comedyLoading}
                        icon={<Smile size={20} className="text-primary" />}
                    />
                </div>
            </main>

            {/* Hero Trailer Modal */}
            {heroAnime?.trailer?.embed_url && (
                <TrailerModal
                    isOpen={heroTrailerOpen}
                    onClose={() => setHeroTrailerOpen(false)}
                    embedUrl={heroAnime.trailer.embed_url}
                    title={heroAnime.title}
                />
            )}
        </>
    );
}
