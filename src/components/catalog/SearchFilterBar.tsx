"use client";

import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchFilterBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    showFilters: boolean;
    onToggleFilters: () => void;
    hasActiveFilters: boolean;
}

export function SearchFilterBar({
    search,
    onSearchChange,
    showFilters,
    onToggleFilters,
    hasActiveFilters
}: SearchFilterBarProps) {
    return (
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" size={18} />
                <Input
                    placeholder="Search by title..."
                    className="pl-10 h-11 bg-zinc-900 border-white/5 focus-visible:ring-primary/50 transition-all rounded-xl"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                {search && (
                    <button
                        onClick={() => onSearchChange("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
            <Button
                variant="outline"
                className={cn(
                    "h-11 border-white/5 bg-zinc-900 gap-2 cursor-pointer transition-all rounded-xl px-4",
                    showFilters && "text-primary border-primary/20 bg-primary/5",
                    hasActiveFilters && !showFilters && "border-primary/40 ring-1 ring-primary/20"
                )}
                onClick={onToggleFilters}
            >
                <SlidersHorizontal size={18} />
                <span className="hidden sm:inline font-semibold">Filters</span>
                {hasActiveFilters && (
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
            </Button>
        </div>
    );
}
