"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { VideoPlayer } from "@/components/watch/VideoPlayer";
import { animeService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EpisodeList } from "@/components/anime/EpisodeList";
import { SidebarAnimeCard, SidebarAnimeSkeleton } from "@/components/anime/SidebarAnimeCard";

export default function WatchPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const animeId = decodeURIComponent(params.id as string).split("::")[0];
    const epParam = decodeURIComponent(searchParams.get("ep") || "");

    // Derived episode ID from URL params
    const initialEpisodeId = epParam ? `${animeId}?ep=${epParam}` : null;

    const [serverType, setServerType] = useState<"sub" | "dub">("sub");
    const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(initialEpisodeId);


    // 1. Fetch Anime & Episodes
    const { data: animeInfoData, isLoading: animeLoading } = useQuery({
        queryKey: ["animeDetails", animeId],
        queryFn: () => animeService.getAnimeDetails(animeId),
        staleTime: 1000 * 60 * 60, // 1 hour
    });
    const anime = animeInfoData?.data;

    const { data: episodesData, isLoading: episodesLoading } = useQuery({
        queryKey: ["animeEpisodes", animeId],
        queryFn: () => animeService.getEpisodes(animeId),
        staleTime: 1000 * 60 * 60,
    });
    const episodes = useMemo(() => episodesData?.data || [], [episodesData]);

    // Derive effective episode ID: use current state, or auto-select first episode
    const effectiveEpisodeId = useMemo(() => {
        if (currentEpisodeId) return currentEpisodeId;
        if (!initialEpisodeId && episodes.length > 0) {
            return episodes[0].id;
        }
        return null;
    }, [currentEpisodeId, initialEpisodeId, episodes]);

    // Update URL when episode changes (shallow routing)
    useEffect(() => {
        if (effectiveEpisodeId) {
            const epIdentifier = effectiveEpisodeId.split("?ep=")[1];
            if (epIdentifier && epIdentifier !== epParam) {
                router.replace(`/watch/${animeId}?ep=${epIdentifier}`, { scroll: false });
            }
        }
    }, [effectiveEpisodeId, animeId, router, epParam]);

    const currentEpisode = useMemo(() => {
        if (!episodes.length) return null;

        // Try exact match first
        let found = episodes.find(ep => ep.id === effectiveEpisodeId);

        // If no exact match and we have an epParam, try matching by identifier or number
        if (!found && epParam) {
            found = episodes.find(ep =>
                ep.id.endsWith(`?ep=${epParam}`) ||
                ep.id === epParam ||
                ep.episodeNumber.toString() === epParam
            );
        }

        return found || episodes[0];
    }, [episodes, effectiveEpisodeId, epParam]);

    // Sync currentEpisodeId when a better match is found after episodes load.
    // This is driven by user interaction (epParam from URL), so we derive it.
    const resolvedEpisodeId = useMemo(() => {
        if (episodes.length > 0 && epParam && currentEpisode) {
            return currentEpisode.id;
        }
        return effectiveEpisodeId;
    }, [episodes, epParam, currentEpisode, effectiveEpisodeId]);

    const currentIndex = useMemo(() => {
        if (!currentEpisode) return -1;
        return episodes.findIndex(ep => ep.id === currentEpisode.id);
    }, [episodes, currentEpisode]);


    const hasNext = currentIndex !== -1 && currentIndex < episodes.length - 1;
    const hasPrev = currentIndex !== -1 && currentIndex > 0;

    const handleNext = () => {
        if (hasNext) {
            setCurrentEpisodeId(episodes[currentIndex + 1].id);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handlePrev = () => {
        if (hasPrev) {
            setCurrentEpisodeId(episodes[currentIndex - 1].id);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // 2. Fetch Servers for Current Episode
    const { data: serversData, isLoading: serversLoading } = useQuery({
        queryKey: ["servers", resolvedEpisodeId],
        queryFn: () => resolvedEpisodeId ? animeService.getServers(resolvedEpisodeId) : null,
        enabled: !!resolvedEpisodeId,
        staleTime: 1000 * 60 * 5,
    });
    const serversInfo = useMemo(() => {
        if (!serversData?.data) return null;
        const data = serversData.data;
        return {
            sub: data.sub?.filter(s => s.name.toLowerCase() === "hd-2") || [],
            dub: data.dub?.filter(s => s.name.toLowerCase() === "hd-2") || []
        };
    }, [serversData]);

    // Derive the effective server type: auto-correct if preferred type isn't available
    const effectiveServerType = useMemo(() => {
        if (!serversInfo) return serverType;
        const hasSub = serversInfo.sub.length > 0;
        const hasDub = serversInfo.dub.length > 0;

        if (serverType === "sub" && hasSub) return "sub";
        if (serverType === "dub" && hasDub) return "dub";
        if (hasSub) return "sub";
        if (hasDub) return "dub";
        return serverType;
    }, [serversInfo, serverType]);

    // Derive selected server name from serversInfo and effectiveServerType
    const selectedServerName = useMemo(() => {
        if (!serversInfo) return "";
        const servers = effectiveServerType === "sub" ? serversInfo.sub : serversInfo.dub;
        return servers.length > 0 ? servers[0].name : "";
    }, [serversInfo, effectiveServerType]);

    // 3. Fetch Stream Source
    const { data: streamData, isLoading: streamLoading, error: streamError } = useQuery({
        queryKey: ["stream", selectedServerName, effectiveServerType, resolvedEpisodeId],
        queryFn: () => animeService.getStream(selectedServerName, effectiveServerType, resolvedEpisodeId!),
        enabled: !!(selectedServerName && effectiveServerType && resolvedEpisodeId),
        retry: 1,
        staleTime: 1000 * 60 * 5,
    });
    const streamInfo = (streamData?.data && Array.isArray(streamData.data) ? streamData.data[0] : streamData?.data) as import("@/types/Anime").StreamSource | null;

    // Initial Loading State
    if (animeLoading || episodesLoading) {
        return (
            <div className="min-h-screen bg-black pt-24 pb-20 flex items-center justify-center">

                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="text-zinc-400 font-medium animate-pulse">Loading amazing anime content...</p>
                </div>
            </div>
        );
    }

    if (!anime) {
        return (
            <div className="min-h-screen bg-black pt-24 pb-20 flex flex-col items-center justify-center">
                <AlertCircle size={64} className="text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Anime Not Found</h1>
                <Link href="/catalog">
                    <Button variant="outline" className="mt-4">Return to Catalog</Button>
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-black pb-20">

            <div className="pt-[72px] lg:pt-[80px]">
                <div className="w-full max-w-[1920px] mx-auto flex flex-col xl:flex-row gap-6 p-4 lg:p-6 xl:p-8">

                    {/* LEFT COLUMN: Player + Controls + Episodes */}
                    <div className="flex-1 flex flex-col w-full xl:w-3/4 max-w-7xl mx-auto">

                        {/* Title & Navigation */}
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex flex-col gap-1">
                                <div className="text-[1rem] tracking-wider font-mono text-white flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <Link
                                        href={`/anime/${animeId}`}
                                        className="hover:text-primary transition-all duration-300 underline-offset-8 text-zinc-500"
                                    >
                                        {anime.title}
                                    </Link>
                                    <span className="text-zinc-700 font-thin select-none">/</span>
                                    <span className="text-zinc-400 font-bold leading-none">
                                        EP {currentEpisode?.episodeNumber} - {currentEpisode?.title}
                                    </span>
                                </div>
                            </div>

                        </div>

                        {/* Video Player Container */}
                        <div className="relative w-full aspect-video bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 flex items-center justify-center">
                            {streamLoading || serversLoading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="animate-spin text-primary" size={48} />
                                    <span className="text-zinc-400 font-medium">Connecting to server...</span>
                                </div>
                            ) : streamError || !streamInfo?.link?.file ? (
                                <div className="flex flex-col items-center gap-4 text-center p-6">
                                    <AlertCircle className="text-red-500" size={48} />
                                    <span className="text-zinc-300 font-medium text-lg">Unable to load video stream</span>
                                    <p className="text-zinc-500 text-sm max-w-xs">The selected server might be down or blocked. Please try switching to a different server.</p>
                                </div>
                            ) : (
                                <VideoPlayer
                                    url={streamInfo.link.file}
                                    poster={anime.poster}
                                    subtitles={streamInfo.tracks}
                                    title={anime.title}
                                    episodeNumber={currentEpisode?.episodeNumber}
                                    episodeTitle={currentEpisode?.title}
                                    episodeId={resolvedEpisodeId || undefined}
                                    introStart={streamInfo?.intro?.start}
                                    introEnd={streamInfo?.intro?.end}
                                    outroStart={streamInfo?.outro?.start}
                                />
                            )}
                        </div>

                        {/* Playback Controls */}
                        <div className="flex items-center justify-between mt-8 shrink-0">
                            {/* Sub/Dub Toggle */}

                            <div className="flex items-center gap-1.5 bg-zinc-900/40 backdrop-blur-sm border border-white/5 p-1.5 rounded-2xl shadow-xl">
                                {serversInfo && (serversInfo.sub.length > 0) && (serversInfo.dub.length > 0) && (
                                    <>
                                        <button
                                            onClick={() => setServerType("sub")}
                                            className={cn(
                                                "h-9 px-5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                                                effectiveServerType === "sub"
                                                    ? "bg-primary text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] scale-105"
                                                    : "text-zinc-500 hover:text-zinc-300"
                                            )}
                                        >
                                            Sub
                                        </button>
                                        <button
                                            onClick={() => setServerType("dub")}
                                            className={cn(
                                                "h-9 px-5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                                                effectiveServerType === "dub"
                                                    ? "bg-primary text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] scale-105"
                                                    : "text-zinc-500 hover:text-zinc-300"
                                            )}
                                        >
                                            Dub
                                        </button>
                                    </>
                                )}
                            </div>


                            {/* Navigation Group */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    className="h-11 px-6 bg-zinc-900/40 backdrop-blur-sm border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/10 gap-2 transition-all group rounded-xl font-bold shadow-xl"
                                    onClick={handlePrev}
                                    disabled={!hasPrev || streamLoading}
                                >
                                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                    <span className="text-xs uppercase tracking-wider">Previous</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="h-11 px-6 bg-zinc-900/40 backdrop-blur-sm border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/10 gap-2 transition-all group rounded-xl font-bold shadow-xl"
                                    onClick={handleNext}
                                    disabled={!hasNext || streamLoading}
                                >
                                    <span className="text-xs uppercase tracking-wider">Next Episode</span>
                                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>

                        {/* Episodes List */}
                        <div className="mt-12">
                            <EpisodeList
                                episodes={episodes}
                                currentEpisodeId={resolvedEpisodeId || undefined}
                                onEpisodeClick={(id) => {
                                    setCurrentEpisodeId(id);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                            />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Suggested Anime Sidebar */}
                    <div className="w-full xl:w-80 shrink-0 flex flex-col gap-8 mt-8 xl:mt-0 xl:pl-6 xl:border-l xl:border-white/5">
                        {/* Related Anime */}
                        {animeLoading ? (
                            <div className="space-y-4">
                                <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
                                {[...Array(3)].map((_, i) => <SidebarAnimeSkeleton key={i} />)}
                            </div>
                        ) : anime.related && anime.related.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Sparkles size={18} className="text-primary" />
                                    Related Anime
                                </h3>
                                <div className="flex flex-col gap-3">
                                    {anime.related.slice(0, 6).map(rel => (
                                        <SidebarAnimeCard key={rel.id} anime={rel} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommended Anime */}
                        {animeLoading ? (
                            <div className="space-y-4">
                                <div className="h-6 w-40 bg-white/5 rounded animate-pulse" />
                                {[...Array(10)].map((_, i) => <SidebarAnimeSkeleton key={i} />)}
                            </div>
                        ) : anime.recommended && anime.recommended.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Sparkles size={18} className="text-primary" />
                                    Recommended
                                </h3>
                                <div className="flex flex-col gap-3">
                                    {anime.recommended.slice(0, 8).map((rec, idx) => (
                                        <SidebarAnimeCard key={rec.id} anime={rec} index={idx} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(168, 85, 247, 0.5);
                }
            `}</style>
        </main>
    );
}
