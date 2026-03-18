"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";

import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import Link from "next/link";

import { WatchlistBoard } from "@/components/watchlist/WatchlistBoard";

export default function WatchlistPage() {
    const { user } = useAuthStore();

    const { data: watchlist, isLoading } = useQuery({
        queryKey: ["watchlist", user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("watchlist")
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
                <div className="text-center">
                    <div className="mx-auto w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
                        <Bookmark size={40} className="text-zinc-700" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Your Watchlist is <span className="text-primary italic">Private</span></h2>
                    <p className="text-zinc-500 mb-8 max-w-xs mx-auto">Sign in to track your anime progress and sync your list across devices</p>
                    <Button asChild className="rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/20">
                        <Link href="/login">Sign In Now</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen pb-20 pt-24 bg-zinc-950 font-sans">


            <div className="container mx-auto px-4 xl:px-20">
                <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight md:text-5xl">
                            Anime <span className="text-primary italic">Tracker</span>
                        </h1>
                        <p className="mt-2 text-zinc-500 font-medium font-mono text-sm tracking-wider uppercase">
                            Total: <span className="text-white">{watchlist?.length || 0}</span> anime{watchlist?.length !== 1 ? "s" : ""} in your journey
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex gap-6 overflow-x-auto pb-10">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="min-w-[300px] h-[70vh] animate-pulse rounded-2xl bg-zinc-900" />
                        ))}
                    </div>
                ) : watchlist && watchlist.length > 0 ? (
                    <WatchlistBoard watchlist={watchlist} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 bg-zinc-900/10 border-2 border-dashed border-white/5 rounded-[40px] px-4 text-center">
                        <div className="w-24 h-24 rounded-full bg-zinc-900/50 border border-white/5 flex items-center justify-center mb-8">
                            <Bookmark size={48} className="text-zinc-800" />
                        </div>
                        <p className="text-zinc-500 mb-8 text-xl font-medium max-w-xs italic font-serif">
                            Your watchlist is a blank canvas. Time to add some masterpieces!
                        </p>
                        <Button asChild size="lg" className="rounded-full px-10 h-14 text-base font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/10">
                            <Link href="/catalog">Discover Anime</Link>
                        </Button>
                    </div>
                )}
            </div>
        </main>
    );
}
