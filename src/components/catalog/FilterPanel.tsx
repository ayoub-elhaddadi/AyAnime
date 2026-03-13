"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "./FilterSelect";

interface FilterPanelProps {
    show: boolean;
    filters: {
        status: string;
        type: string;
        sort: string;
    };
    onFilterChange: (key: string, value: string) => void;
    onReset: () => void;
    hasActiveFilters: boolean;
}

export function FilterPanel({
    show,
    filters,
    onFilterChange,
    onReset,
    hasActiveFilters
}: FilterPanelProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="mb-8 overflow-hidden rounded-2xl bg-zinc-900/30 border border-white/5 backdrop-blur-sm"
                >
                    <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 md:grid-cols-4">
                        <FilterSelect
                            label="Status"
                            value={filters.status}
                            options={[
                                { label: "All Statuses", value: "" },
                                { label: "Airing", value: "airing" },
                                { label: "Finished Airing", value: "finished-airing" },
                                { label: "Not Yet Aired", value: "not-yet-aired" },
                            ]}
                            onChange={(val) => onFilterChange("status", val)}
                        />
                        <FilterSelect
                            label="Format"
                            value={filters.type}
                            options={[
                                { label: "All Formats", value: "" },
                                { label: "TV Series", value: "tv" },
                                { label: "Movie", value: "movie" },
                                { label: "Special", value: "special" },
                                { label: "OVA", value: "ova" },
                                { label: "ONA", value: "ona" },
                            ]}
                            onChange={(val) => onFilterChange("type", val)}
                        />
                        <FilterSelect
                            label="Sort By"
                            value={filters.sort}
                            options={[
                                { label: "Default", value: "" },
                                { label: "Recently Added", value: "recently-added" },
                                { label: "Recently Updated", value: "recently-updated" },
                                { label: "Score", value: "score" },
                                { label: "Name (A-Z)", value: "name-az" },
                                { label: "Most Watched", value: "most-watched" },
                            ]}
                            onChange={(val) => onFilterChange("sort", val)}
                        />
                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                className="w-full h-11 gap-2 rounded-xl border-white/5 bg-zinc-900/50 hover:bg-zinc-800 hover:border-white/10 transition-all active:scale-[0.98]"
                                onClick={onReset}
                                disabled={!hasActiveFilters}
                            >
                                <RotateCcw size={16} className={hasActiveFilters ? "text-primary" : "text-zinc-600"} />
                                <span className="font-semibold text-zinc-300">Reset All</span>
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
