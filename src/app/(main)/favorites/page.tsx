"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
    const { user } = useAuthStore();

    const { data: favorites, isLoading } = useQuery({
        queryKey: ["favorites", user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("favorites")
                .select("*, animes(*)")
                .eq("user_id", user?.id as string);
            if (error) throw error;
            return data;
        },
        enabled: !!user?.id,
    });

    if (!user) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4">
                <Navbar />
                <Heart size={64} className="text-zinc-700 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">My Favorites</h2>
                <p className="text-zinc-500 mb-6">Keep track of your most loved anime</p>
                <Button asChild className="rounded-full px-8">
                    <Link href="/login">Sign In to Favorites</Link>
                </Button>
            </div>
        );
    }

    return (
        <main className="min-h-screen pb-20 pt-24">
            <Navbar />

            <div className="container mx-auto px-4 xl:px-20">
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Heart size={28} className="text-red-500 fill-red-500" />
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight md:text-4xl">
                            My <span className="text-primary">Favorites</span>
                        </h1>
                    </div>
                    <p className="text-zinc-500">A curated collection of your top rated anime</p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-zinc-900" />
                        ))}
                    </div>
                ) : favorites && favorites.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-6">
                        {favorites.map(item => (
                            <AnimeCard
                                key={item.anime_id}
                                id={item.anime_id}
                                title={item.animes.title}
                                image={item.animes.image_url || "/placeholder.jpg"}
                                rating={item.animes.score || 0}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-zinc-900/20">
                        <Sparkles size={48} className="text-zinc-800 mb-4" />
                        <p className="text-zinc-500 mb-6 text-lg text-center">You haven&apos;t favorited any anime yet.<br /><span className="text-sm">Start exploring the catalog to find your gems!</span></p>
                        <Button asChild className="rounded-full px-8 gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                            <Link href="/catalog">Discover Anime</Link>
                        </Button>
                    </div>
                )}
            </div>
        </main>
    );
}
