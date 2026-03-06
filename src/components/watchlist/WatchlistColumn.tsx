"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "react-hot-toast";
import { WatchlistCard } from "./WatchlistCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WatchlistColumnProps {
    title: string;
    items: any[];
    status: string;
}

export const WatchlistColumn = ({ title, items, status }: WatchlistColumnProps) => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const animeId = e.dataTransfer.getData("animeId");
        const currentStatus = e.dataTransfer.getData("currentStatus");

        if (currentStatus === status) return;

        try {
            const { error } = await supabase
                .from("watchlist")
                .update({ status, updated_at: new Date().toISOString() })
                .eq("anime_id", parseInt(animeId))
                .eq("user_id", user?.id);

            if (error) throw error;

            toast.success(`Moved to ${status}`);
            queryClient.invalidateQueries({ queryKey: ["watchlist", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["user_stats", user?.id] });
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const statusColors: any = {
        planned: "bg-zinc-800 text-zinc-400",
        watching: "bg-primary text-white",
        completed: "bg-green-500 text-white",
        dropped: "bg-red-500 text-white",
    };

    return (
        <div
            className="flex flex-col h-full min-w-[300px] w-full bg-zinc-950/30 rounded-2xl border border-white/5 overflow-hidden transition-colors hover:bg-zinc-950/50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            {/* Column Header */}
            <div className="p-4 border-b border-white/5 bg-zinc-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-sm font-black uppercase tracking-widest text-white italic">{title}</h2>
                    <Badge variant="secondary" className="h-5 min-w-[20px] px-1 justify-center rounded-md bg-zinc-800 text-[10px] font-bold">
                        {items.length}
                    </Badge>
                </div>
                <div className={cn("h-1.5 w-1.5 rounded-full", statusColors[status])} />
            </div>

            {/* Items List */}
            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                        <WatchlistCard key={item.anime_id} item={item} />
                    ))}
                </AnimatePresence>

                {items.length === 0 && (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl">
                        <span className="text-xs text-zinc-600 font-medium italic">Empty</span>
                    </div>
                )}
            </div>
        </div>
    );
};
