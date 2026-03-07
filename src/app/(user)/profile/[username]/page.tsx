"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Settings, User as UserIcon, Bookmark, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AnimeCard } from "@/components/anime/AnimeCard";

export default function ProfilePage() {
    const { user, profile } = useAuthStore();

    // Fetch Stats
    const { data: stats } = useQuery({
        queryKey: ["user_stats", user?.id],
        queryFn: async () => {
            const { count: watchlistCount } = await supabase
                .from("watchlist")
                .select("*", { count: "exact" })
                .eq("user_id", user?.id as string);

            const { count: favoritesCount } = await supabase
                .from("favorites")
                .select("*", { count: "exact" })
                .eq("user_id", user?.id as string);

            const { count: commentsCount } = await supabase
                .from("comments")
                .select("*", { count: "exact" })
                .eq("user_id", user?.id as string);

            return {
                watchlistCount,
                favoritesCount,
                commentsCount,
            };
        },
        enabled: !!user?.id,
    });

    // Fetch Recent Watchlist
    const { data: recentWatchlist, isLoading: watchlistLoading } = useQuery({
        queryKey: ["user_recent_watchlist", user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("watchlist")
                .select("*, animes(*)")
                .eq("user_id", user?.id as string)
                .order("updated_at", { ascending: false })
                .limit(8);
            if (error) throw error;
            return data;
        },
        enabled: !!user?.id,
    });

    // Fetch Recent Favorites
    const { data: recentFavorites, isLoading: favoritesLoading } = useQuery({
        queryKey: ["user_recent_favorites", user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("favorites")
                .select("*, animes(*)")
                .eq("user_id", user?.id as string)
                .order("created_at", { ascending: false })
                .limit(8);
            if (error) throw error;
            return data;
        },
        enabled: !!user?.id,
    });

    if (!user) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                <Navbar />
                <h2 className="text-xl text-zinc-500">Please sign in to view your profile</h2>
            </div>
        );
    }

    return (
        <main className="min-h-screen pb-20 pt-24">
            <Navbar />

            <div className="container mx-auto px-4 xl:px-20">
                {/* Profile Card */}
                <div className="relative mb-10 overflow-hidden rounded-3xl bg-zinc-900/50 border border-white/5 p-8 md:p-12">
                    <div className="absolute top-0 right-0 p-4">
                        <Link
                            href="/settings"
                            className="group flex items-center gap-0 overflow-hidden rounded-full bg-white/5 p-1 ring-1 ring-white/10 hover:ring-primary/50 transition-all duration-300"
                        >
                            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center transition-colors group-hover:bg-zinc-700">
                                <Settings size={16} className="text-primary" />
                            </div>
                            <span className="max-w-0 opacity-0 overflow-hidden whitespace-nowrap text-xs font-bold text-zinc-300 transition-all duration-300 group-hover:max-w-[70px] group-hover:opacity-100 group-hover:px-2">
                                Settings
                            </span>
                        </Link>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full bg-primary/20 p-1 ring-4 ring-primary/30">
                            <div className="h-full w-full rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                                {profile?.avatar_url ? (
                                    <Image src={profile.avatar_url} alt={profile.username || ""} fill className="object-cover rounded-full" />
                                ) : (
                                    <UserIcon size={64} className="text-zinc-600" />
                                )}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                                <h1 className="text-3xl md:text-4xl font-black text-white">
                                    {profile?.username || "Anime Enthusiast"}
                                </h1>
                            </div>
                            <p className="text-zinc-400 w-full mb-6 truncate italic">
                                {profile?.bio || "No bio yet. Writing my own anime origin story..."}
                            </p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-6">
                                <div className="text-center md:text-left">
                                    <span className="block text-2xl font-black text-white">{stats?.watchlistCount || 0}</span>
                                    <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Watchlist</span>
                                </div>
                                <div className="text-center md:text-left">
                                    <span className="block text-2xl font-black text-white">{stats?.favoritesCount || 0}</span>
                                    <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Favorites</span>
                                </div>
                                <div className="text-center md:text-left">
                                    <span className="block text-2xl font-black text-white">{stats?.commentsCount || 0}</span>
                                    <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Comments</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="space-y-12">
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3 italic">
                                <Bookmark size={24} className="text-primary" /> Tracked Journey
                            </h2>
                            <Button variant="link" asChild className="text-primary p-0 h-auto">
                                <Link href="/watchlist">View All</Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                            {watchlistLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-white/5" />
                                ))
                            ) : recentWatchlist?.length ? (
                                recentWatchlist.map(item => (
                                    <AnimeCard
                                        key={item.anime_id}
                                        id={item.anime_id}
                                        title={item.animes.title}
                                        image={item.animes.image_url || ""}
                                        rating={item.animes.score || 0}
                                        status={item.animes.status || ""}
                                        year={item.animes.year || 0}
                                    />
                                ))
                            ) : (
                                <p className="col-span-full text-zinc-700 text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/5 italic">
                                    Your watchlist is currently empty. Start your journey!
                                </p>
                            )}
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3 italic">
                                <Heart size={24} className="text-red-500 fill-red-500" /> Hall of Fame
                            </h2>
                            <Button variant="link" asChild className="text-primary p-0 h-auto">
                                <Link href="/favorites">View all Favorites</Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                            {favoritesLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-white/5" />
                                ))
                            ) : recentFavorites?.length ? (
                                recentFavorites.map(item => (
                                    <AnimeCard
                                        key={item.anime_id}
                                        id={item.anime_id}
                                        title={item.animes.title}
                                        image={item.animes.image_url || ""}
                                        rating={item.animes.score || 0}
                                        status={item.animes.status || ""}
                                        year={item.animes.year || 0}
                                    />
                                ))
                            ) : (
                                <p className="col-span-full text-zinc-700 text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/5 italic">
                                    No favorites yet. Crown your top anime!
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
