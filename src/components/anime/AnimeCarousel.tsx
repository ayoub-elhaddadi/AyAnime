"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimeCard } from "./AnimeCard";
import { cn } from "@/lib/utils";

interface AnimeCarouselProps {
    title: string;
    description?: string;
    data?: any[];
    isLoading: boolean;
    icon?: React.ReactNode;
}

export const AnimeCarousel = ({ title, description, data, isLoading, icon }: AnimeCarouselProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    }, [data, isLoading]);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current;
            const scrollAmount = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <section className="group/carousel relative">
            <div className="mb-6 flex items-end justify-between px-1">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            {icon}
                            {title}
                        </h2>
                    </div>
                    {description && <p className="text-sm text-zinc-500 ml-4">{description}</p>}
                </div>
                <div className="hidden md:flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className={cn(
                            "h-10 w-10 rounded-full border-white/10 bg-black/40 backdrop-blur-md transition-all hover:bg-primary hover:border-primary disabled:opacity-0 hover:cursor-pointer",
                            !showLeftArrow && "opacity-0 pointer-events-none"
                        )}
                        onClick={() => scroll("left")}
                        disabled={!showLeftArrow}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className={cn(
                            "h-10 w-10 rounded-full border-white/10 bg-black/40 backdrop-blur-md transition-all hover:bg-primary hover:border-primary disabled:opacity-0 hover:cursor-pointer",
                            !showRightArrow && "opacity-0 pointer-events-none"
                        )}
                        onClick={() => scroll("right")}
                        disabled={!showRightArrow}
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 no-scrollbar scroll-smooth sm:gap-6"
            >
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="min-w-[160px] md:min-w-[200px] aspect-[3/4] animate-pulse rounded-xl bg-zinc-900/50 border border-white/5"
                        />
                    ))
                ) : (
                    data?.map((anime: any) => (
                        <div key={anime.mal_id} className="min-w-[160px] md:min-w-[200px]">
                            <AnimeCard
                                id={anime.mal_id}
                                title={anime.title}
                                image={anime.images.webp.large_image_url}
                                rating={anime.score}
                                year={anime.year}
                                status={anime.status}
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Mobile Gradient indicators */}
            <div className="absolute left-0 top-16 bottom-4 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none opacity-0 md:hidden group-hover/carousel:opacity-100 transition-opacity" />
            <div className="absolute right-0 top-16 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none opacity-0 md:hidden group-hover/carousel:opacity-100 transition-opacity" />
        </section>
    );
};
