"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { animeService, SearchParams } from "@/lib/api";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";

import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "./SearchFilterBar";
import { FilterPanel } from "./FilterPanel";
import { AnimeResultsGrid } from "./AnimeResultsGrid";

// Senior Tip: Move hooks to separate files in a real project
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export function CatalogContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Sync from URL params
    const getParam = useCallback((key: string, fallback: string) => searchParams.get(key) || fallback, [searchParams]);
    const page = parseInt(getParam("page", "1"));
    const search = getParam("q", "");

    const filters = useMemo(() => ({
        status: getParam("status", ""),
        type: getParam("type", ""),
        sort: getParam("sort", ""),
    }), [getParam]);

    const [localSearch, setLocalSearch] = useState(search);
    const [showFilters, setShowFilters] = useState(false);
    const [totalVisiblePages, setTotalVisiblePages] = useState(1);

    const debouncedSearch = useDebounce(localSearch, 500);

    // Update URL helper
    const updateUrl = useCallback((newParams: Record<string, string | number | null>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === "" || (key === "page" && value === 1)) {
                params.delete(key);
            } else {
                params.set(key, value.toString());
            }
        });

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [pathname, router, searchParams]);

    // Sync local search with URL (for back/forward button support)
    useEffect(() => {
        setLocalSearch(search);
    }, [search]);

    // Handle search change
    useEffect(() => {
        if (debouncedSearch !== search) {
            updateUrl({ q: debouncedSearch, page: 1 });
        }
    }, [debouncedSearch, search, updateUrl]);

    // Data fetching
    const fetchParams = useMemo((): SearchParams => ({
        keyword: debouncedSearch || undefined,
        page,
        status: filters.status || undefined,
        type: filters.type || undefined,
        sort: filters.sort || undefined,
    }), [debouncedSearch, page, filters]);

    const { data: results, isLoading, isPlaceholderData } = useQuery({
        queryKey: ["catalog", fetchParams],
        queryFn: () => {
            if (fetchParams.keyword) {
                return animeService.searchAnime(fetchParams);
            }
            return animeService.getFilteredAnime(fetchParams);
        },
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });

    // Update pagination
    useEffect(() => {
        if (results?.data?.pageInfo?.totalPages && !isPlaceholderData) {
            setTotalVisiblePages(results.data.pageInfo.totalPages);
        }
    }, [results, isPlaceholderData]);

    const handleFilterChange = (key: string, value: string) => {
        updateUrl({ [key]: value, page: 1 });
    };

    const handleReset = () => {
        router.push(`${pathname}`, { scroll: false });
        setLocalSearch("");
        toast.success("Filters reset");
    };

    const hasActiveFilters = localSearch !== "" ||
        filters.status !== "" ||
        filters.type !== "" ||
        (filters.sort !== "" && filters.sort !== "default");

    return (
        <div className="container mx-auto px-4 xl:px-20 min-h-[60vh]">
            {/* Header Area */}
            <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter md:text-5xl">
                        Explore <span className="text-primary italic">Catalog</span>
                    </h1>
                    <p className="text-zinc-500 font-medium">
                        Discover thousands of anime titles
                    </p>
                </div>

                <SearchFilterBar
                    search={localSearch}
                    onSearchChange={setLocalSearch}
                    showFilters={showFilters}
                    onToggleFilters={() => setShowFilters(!showFilters)}
                    hasActiveFilters={hasActiveFilters}
                />
            </div>

            {/* Advanced Filters */}
            <FilterPanel
                show={showFilters}
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
                hasActiveFilters={hasActiveFilters}
            />

            {/* Results Grid */}
            <AnimeResultsGrid
                animeList={results?.data?.response}
                isLoading={isLoading}
                skeletonCount={24}
            />

            {/* Pagination Controls */}
            {totalVisiblePages > 1 && (
                <div className="mt-16 py-8 flex justify-center border-t border-white/5">
                    <Pagination
                        currentPage={page}
                        totalPages={totalVisiblePages}
                        onPageChange={(p) => updateUrl({ page: p })}
                        hasNextPage={results?.data?.pageInfo?.hasNextPage || false}
                        isLoading={isLoading}
                    />
                </div>
            )}
        </div>
    );
}
