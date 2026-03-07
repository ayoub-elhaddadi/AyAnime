"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Anime } from "../jikan";

export function useCollections(animeId: number, animeData?: Anime) {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const router = useRouter();

    const upsertAnime = async () => {
        if (!animeData) return;

        const { error } = await supabase
            .from("animes")
            .upsert({
                id: animeId,
                title: animeData.title || "Unknown Title",
                image_url: animeData.images?.webp?.image_url || animeData.images?.webp?.large_image_url,
                score: animeData.score,
                episodes: animeData.episodes,
                status: animeData.status,
                year: animeData.year,
                synopsis: animeData.synopsis,
                season: animeData.season,
                genres: animeData.genres,
                updated_at: new Date().toISOString(),
            });

        if (error) {
            console.error("Error upserting anime:", error.message, error.details, error.hint);
            throw error;
        }
    };

    // Watchlist status
    const { data: watchlistStatus } = useQuery({
        queryKey: ["watchlist_status", animeId, user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("watchlist")
                .select("*")
                .eq("anime_id", animeId)
                .eq("user_id", user?.id as string)
                .single();
            if (error && error.code !== "PGRST116") throw error;
            return data;
        },
        enabled: !!user?.id && !!animeId,
    });

    // Favorite status
    const { data: isFavorited } = useQuery({
        queryKey: ["is_favorited", animeId, user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("favorites")
                .select("*")
                .eq("anime_id", animeId)
                .eq("user_id", user?.id as string)
                .single();
            if (error && error.code !== "PGRST116") throw error;
            return !!data;
        },
        enabled: !!user?.id && !!animeId,
    });

    const toggleWatchlist = useMutation({
        mutationFn: async () => {
            if (!user) {
                router.push("/login");
                throw new Error("Authentication required");
            }

            // Ensure anime exists in our DB first
            await upsertAnime();

            if (watchlistStatus) {
                const { error } = await supabase
                    .from("watchlist")
                    .delete()
                    .eq("anime_id", animeId)
                    .eq("user_id", user.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("watchlist")
                    .insert({
                        anime_id: animeId,
                        user_id: user.id,
                        status: "planned",
                    });
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["watchlist_status", animeId, user?.id] });
            queryClient.invalidateQueries({ queryKey: ["watchlist", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["user_recent_watchlist", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["user_stats", user?.id] });
            toast.success(watchlistStatus ? "Removed from Watchlist" : "Added to Watchlist");
        },
        onError: (err: Error) => {
            if (err.message !== "Authentication required") {
                toast.error(err.message);
            }
        }
    });

    const updateWatchlistStatus = useMutation({
        mutationFn: async (newStatus: string) => {
            if (!user) throw new Error("Authentication required");
            const { error } = await supabase
                .from("watchlist")
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq("anime_id", animeId)
                .eq("user_id", user.id);
            if (error) throw error;
        },
        onSuccess: (_, newStatus) => {
            queryClient.invalidateQueries({ queryKey: ["watchlist_status", animeId, user?.id] });
            queryClient.invalidateQueries({ queryKey: ["watchlist", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["user_recent_watchlist", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["user_stats", user?.id] });
            toast.success(`Moved to ${newStatus}`);
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const updateWatchlistProgress = useMutation({
        mutationFn: async (newProgress: number) => {
            if (!user) throw new Error("Authentication required");
            const { error } = await supabase
                .from("watchlist")
                .update({
                    episode_progress: newProgress,
                    updated_at: new Date().toISOString(),
                    // If progress starts, move to watching automatically
                    ...(newProgress > 0 && watchlistStatus?.status === "planned" ? { status: "watching" } : {})
                })
                .eq("anime_id", animeId)
                .eq("user_id", user.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["watchlist_status", animeId, user?.id] });
            queryClient.invalidateQueries({ queryKey: ["watchlist", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["user_recent_watchlist", user?.id] });
            toast.success("Progress updated");
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const toggleFavorite = useMutation({
        mutationFn: async () => {
            if (!user) {
                router.push("/login");
                throw new Error("Authentication required");
            }

            // Ensure anime exists in our DB first
            await upsertAnime();

            if (isFavorited) {
                const { error } = await supabase
                    .from("favorites")
                    .delete()
                    .eq("anime_id", animeId)
                    .eq("user_id", user.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("favorites")
                    .insert({
                        anime_id: animeId,
                        user_id: user.id,
                    });
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["is_favorited", animeId, user?.id] });
            queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["user_recent_favorites", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["user_stats", user?.id] });
            toast.success(isFavorited ? "Removed from Favorites" : "Added to Favorites");
        },
        onError: (err: Error) => {
            if (err.message !== "Authentication required") {
                toast.error(err.message);
            }
        }
    });

    return {
        isWatchlisted: !!watchlistStatus,
        watchlistStatus: watchlistStatus?.status,
        isFavorited,
        toggleWatchlist,
        toggleFavorite,
        updateWatchlistStatus,
        updateWatchlistProgress,
        upsertAnime,
    };
}
