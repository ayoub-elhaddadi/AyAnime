"use client";

import { useMemo } from "react";
import { WatchlistColumn } from "./WatchlistColumn";
import { Tables } from "@/types/supabase";

export type WatchlistItemWithAnime = Tables<"watchlist"> & { animes: Tables<"animes"> };

interface WatchlistBoardProps {
    watchlist: WatchlistItemWithAnime[];
}

export const WatchlistBoard = ({ watchlist }: WatchlistBoardProps) => {
    // Group items by status
    const grouped = useMemo(() => {
        const initialGroups: { [key: string]: WatchlistItemWithAnime[] } = {
            planned: [],
            watching: [],
            completed: [],
            dropped: [],
        };

        return watchlist.reduce((acc, item) => {
            if (item.status && acc[item.status]) {
                acc[item.status].push(item);
            }
            return acc;
        }, initialGroups);
    }, [watchlist]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[70vh] pb-10">
            <WatchlistColumn
                title="Planned"
                status="planned"
                items={grouped.planned}
            />
            <WatchlistColumn
                title="Watching"
                status="watching"
                items={grouped.watching}
            />
            <WatchlistColumn
                title="Completed"
                status="completed"
                items={grouped.completed}
            />
            <WatchlistColumn
                title="Dropped"
                status="dropped"
                items={grouped.dropped}
            />
        </div>
    );
};
