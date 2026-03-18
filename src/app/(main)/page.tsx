"use client";

import { useQuery } from "@tanstack/react-query";
import { animeService } from "@/lib/api";
import { AnimeCarousel } from "@/components/anime/AnimeCarousel";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Info, TrendingUp, Sparkles, Star, Trophy, BarChart3, History, PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
    const { data: homeData, isLoading: homeLoading } = useQuery({
        queryKey: ["home"],
        queryFn: () => animeService.getHome(),
    });

    const home = homeData?.data;
    const heroAnime = home?.spotlight?.[0];

    return (
        <>
            <main className="min-h-screen pb-20">
                {/* Hero Section */}
                <section className="relative h-[85vh] xl:h-[100vh] w-full overflow-hidden">
                    {heroAnime && (
                        <>
                            <div className="absolute inset-0">
                                <Image
                                    src={heroAnime.poster}
                                    alt={heroAnime.title}
                                    fill
                                    sizes="100vw"
                                    className="object-cover opacity-30 blur-[2px]"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
                            </div>

                            <div className="container relative mx-auto flex h-full flex-col justify-center px-4 pt-24 xl:px-20">
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="max-w-3xl pb-20"
                                >
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className="rounded bg-primary/20 px-2 py-1 text-xs font-bold text-primary ring-1 ring-primary/30">
                                            #1 MOST POPULAR
                                        </span>
                                        <div className="flex items-center gap-1 text-xs font-semibold text-yellow-400 font-mono tracking-tighter">
                                            <TrendingUp size={14} />
                                            <span>Trending Now</span>
                                        </div>
                                    </div>

                                    <h1 className="mb-6 text-4xl font-black leading-[1.1] text-white md:text-7xl lg:text-8xl">
                                        {heroAnime.title}
                                    </h1>

                                    <p className="mb-8 line-clamp-3 text-base text-zinc-300 md:text-lg max-w-xl">
                                        {heroAnime.synopsis}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-4">
                                        <Link href={`/anime/${heroAnime.id}`}>
                                            <Button size="lg" className="rounded-full bg-primary px-8 hover:bg-primary/80 text-white font-bold group hover:cursor-pointer">
                                                <PlayCircle className="mr-2 group-hover:scale-110 transition-transform" size={20} /> Watch Now
                                            </Button>
                                        </Link>
                                        <Link href={`/anime/${heroAnime.id}`}>
                                            <Button size="lg" variant="outline" className="rounded-full border-white/10 bg-white/5 px-8 backdrop-blur-md hover:bg-white/10 hover:cursor-pointer transition-colors">
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
                <div className="container mx-auto px-4 space-y-20 relative z-10 xl:px-20 py-12">
                    <AnimeCarousel
                        title="Latest Episodes"
                        description="Catch the freshest releases just aired"
                        data={home?.latestEpisode}
                        isLoading={homeLoading}
                        icon={<PlayCircle size={24} className="text-primary" />}
                    />

                    <AnimeCarousel
                        title="New Added"
                        description="Fresh additions to our growing collection"
                        data={home?.newAdded}
                        isLoading={homeLoading}
                        icon={<Sparkles size={24} className="text-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.4)]" />}
                    />

                    <AnimeCarousel
                        title="Spotlight"
                        description="Handpicked series you shouldn't miss"
                        data={home?.spotlight}
                        isLoading={homeLoading}
                        icon={<Star size={24} className="text-yellow-400 fill-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]" />}
                    />

                    <AnimeCarousel
                        title="Today's Top 10"
                        description="The hottest picks from the last 24 hours"
                        data={home?.topTen?.today}
                        isLoading={homeLoading}
                        icon={<Trophy size={24} className="text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]" />}
                    />

                    <AnimeCarousel
                        title="Weekly Champions"
                        description="Dominating the charts this entire week"
                        data={home?.topTen?.week}
                        isLoading={homeLoading}
                        icon={<BarChart3 size={24} className="text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]" />}
                    />

                    <AnimeCarousel
                        title="Monthly Legends"
                        description="The monthly champions of the anime world"
                        data={home?.topTen?.month}
                        isLoading={homeLoading}
                        icon={<History size={24} className="text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]" />}
                    />
                </div>
            </main>
        </>
    );
}
