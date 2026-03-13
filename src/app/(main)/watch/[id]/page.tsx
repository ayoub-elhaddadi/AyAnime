"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/shared/Navbar";
import { VideoPlayer } from "@/components/watch/VideoPlayer";
import { animeService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, Play, AlertCircle, Server, Settings2, SkipBack, SkipForward, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function WatchPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const animeId = decodeURIComponent(params.id as string).split("::")[0];
    const epParam = decodeURIComponent(searchParams.get("ep") || "");

    // Derived episode ID from URL params
    const initialEpisodeId = epParam ? `${animeId}?ep=${epParam}` : null;

    const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(initialEpisodeId);
    const [serverType, setServerType] = useState<"sub" | "dub">("sub");
    const [selectedServerName, setSelectedServerName] = useState<string>("");

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
    const episodes = episodesData?.data || [];

    // Auto-select first episode if none in URL
    useEffect(() => {
        if (!initialEpisodeId && episodes.length > 0 && !currentEpisodeId) {
            setCurrentEpisodeId(episodes[0].id);
        }
    }, [episodes, initialEpisodeId, currentEpisodeId]);

    // Update URL when episode changes (shallow routing)
    useEffect(() => {
        if (currentEpisodeId) {
            const epIdentifier = currentEpisodeId.split("?ep=")[1];
            if (epIdentifier && epIdentifier !== epParam) {
                router.replace(`/watch/${animeId}?ep=${epIdentifier}`, { scroll: false });
            }
        }
    }, [currentEpisodeId, animeId, router, epParam]);

    const currentEpisode = useMemo(() => {
        return episodes.find(ep => ep.id === currentEpisodeId) || episodes[0];
    }, [episodes, currentEpisodeId]);

    const currentIndex = useMemo(() => {
        if (!currentEpisode) return -1;
        return episodes.findIndex(ep => ep.id === currentEpisode.id);
    }, [episodes, currentEpisode]);

    const hasNext = currentIndex !== -1 && currentIndex < episodes.length - 1;
    const hasPrev = currentIndex !== -1 && currentIndex > 0;

    const handleNext = () => {
        if (hasNext) setCurrentEpisodeId(episodes[currentIndex + 1].id);
    };

    const handlePrev = () => {
        if (hasPrev) setCurrentEpisodeId(episodes[currentIndex - 1].id);
    };

    // 2. Fetch Servers for Current Episode
    const { data: serversData, isLoading: serversLoading } = useQuery({
        queryKey: ["servers", currentEpisodeId],
        queryFn: () => currentEpisodeId ? animeService.getServers(currentEpisodeId) : null,
        enabled: !!currentEpisodeId,
        staleTime: 1000 * 60 * 5,
    });
    const serversInfo = serversData?.data;

    // Auto-select first available server and type
    useEffect(() => {
        if (serversInfo) {
            if (serversInfo.sub && serversInfo.sub.length > 0 && serverType === "sub") {
                if (!selectedServerName || !serversInfo.sub.find(s => s.name === selectedServerName)) {
                    setSelectedServerName(serversInfo.sub[0].name);
                }
            } else if (serversInfo.dub && serversInfo.dub.length > 0 && serverType === "dub") {
                if (!selectedServerName || !serversInfo.dub.find(s => s.name === selectedServerName)) {
                    setSelectedServerName(serversInfo.dub[0].name);
                }
            } else if (serversInfo.sub && serversInfo.sub.length > 0) {
                setServerType("sub");
                setSelectedServerName(serversInfo.sub[0].name);
            } else if (serversInfo.dub && serversInfo.dub.length > 0) {
                setServerType("dub");
                setSelectedServerName(serversInfo.dub[0].name);
            }
        }
    }, [serversInfo, serverType, selectedServerName]);

    // 3. Fetch Stream Source
    const { data: streamData, isLoading: streamLoading, error: streamError } = useQuery({
        queryKey: ["stream", selectedServerName, serverType, currentEpisodeId],
        queryFn: () => animeService.getStream(selectedServerName, serverType, currentEpisodeId!),
        enabled: !!(selectedServerName && serverType && currentEpisodeId),
        retry: 1,
        staleTime: 1000 * 60 * 5,
    });
    const streamInfo = streamData?.data && Array.isArray(streamData.data) ? streamData.data[0] : (streamData?.data as any);

    // Initial Loading State
    if (animeLoading || episodesLoading) {
        return (
            <div className="min-h-screen bg-black pt-24 pb-20 flex items-center justify-center">
                <Navbar />
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
                <Navbar />
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
            <Navbar />

            <div className="pt-[72px] lg:pt-[80px]">
                <div className="w-full max-w-[1920px] mx-auto flex flex-col xl:flex-row gap-6 p-4 lg:p-6 xl:p-8">

                    {/* LEFT COLUMN: Player + Controls + Episodes */}
                    <div className="flex-1 flex flex-col w-full xl:w-3/4 max-w-7xl mx-auto">

                        {/* Title & Navigation */}
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <Link href={`/anime/${animeId}`} className="inline-flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors mb-2 group text-sm font-medium">
                                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                    Back to Details
                                </Link>
                                <h1 className="text-2xl md:text-3xl font-black text-white line-clamp-1">
                                    {anime.title}
                                </h1>
                                <p className="text-zinc-400 font-medium text-sm mt-1">
                                    Episode {currentEpisode?.episodeNumber || 1} {currentEpisode?.title && `- ${currentEpisode.title}`}
                                </p>
                            </div>

                            {/* Server & Audio Selection */}
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="bg-zinc-900 border border-white/10 rounded-lg p-1 flex">
                                    <button
                                        onClick={() => setServerType("sub")}
                                        className={cn(
                                            "px-4 py-1.5 rounded-md text-sm font-bold transition-all",
                                            serverType === "sub" ? "bg-primary text-white shadow-md" : "text-zinc-400 hover:text-white"
                                        )}
                                        disabled={!serversInfo?.sub?.length}
                                    >
                                        Sub
                                    </button>
                                    <button
                                        onClick={() => setServerType("dub")}
                                        className={cn(
                                            "px-4 py-1.5 rounded-md text-sm font-bold transition-all",
                                            serverType === "dub" ? "bg-primary text-white shadow-md" : "text-zinc-400 hover:text-white"
                                        )}
                                        disabled={!serversInfo?.dub?.length}
                                    >
                                        Dub
                                    </button>
                                </div>

                                {serversInfo && (
                                    <Select value={selectedServerName} onValueChange={setSelectedServerName}>
                                        <SelectTrigger className="w-[140px] bg-zinc-900 border-white/10 text-white font-medium focus:ring-primary h-9">
                                            <Server size={14} className="mr-2 text-primary" />
                                            <SelectValue placeholder="Server" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                            {serverType === "sub" ? serversInfo.sub.map(s => (
                                                <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                                            )) : serversInfo.dub.map(s => (
                                                <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
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
                                />
                            )}
                        </div>

                        {/* Next / Prev Controls */}
                        <div className="flex items-center justify-between mt-6 bg-zinc-900 border border-white/5 rounded-xl p-4 shadow-lg shrink-0">
                            <Button
                                variant="outline"
                                className="bg-zinc-950 border-white/10 text-white hover:bg-white/10 hover:text-white gap-2 transition-all group lg:min-w-[140px]"
                                onClick={handlePrev}
                                disabled={!hasPrev || streamLoading}
                            >
                                <SkipBack size={18} className="group-hover:-translate-x-1 transition-transform" />
                                <span className="hidden sm:inline">Prev Episode</span>
                            </Button>

                            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
                                <span className="flex items-center gap-2">
                                    <Settings2 size={16} className="text-primary" />
                                    Server: <strong className="text-white">{selectedServerName || 'None'}</strong>
                                </span>
                            </div>

                            <Button
                                className="bg-primary hover:bg-primary/90 text-white gap-2 transition-all group shadow-md shadow-primary/20 lg:min-w-[140px]"
                                onClick={handleNext}
                                disabled={!hasNext || streamLoading}
                            >
                                <span className="hidden sm:inline">Next Episode</span>
                                <SkipForward size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>

                        {/* Episodes List (Below Player) */}
                        <div className="mt-8">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Play size={20} className="text-primary fill-primary/20" />
                                All Episodes
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {episodes.map((ep) => {
                                    const isCurrent = currentEpisodeId === ep.id;
                                    return (
                                        <button
                                            key={ep.id}
                                            onClick={() => setCurrentEpisodeId(ep.id)}
                                            className={cn(
                                                "relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all border overflow-hidden group",
                                                isCurrent
                                                    ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10"
                                                    : "bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-white/20"
                                            )}
                                        >
                                            {isCurrent && <div className="absolute inset-0 bg-primary/20 animate-pulse" />}
                                            <span className="relative z-10 shrink-0">EP {ep.episodeNumber}</span>
                                            {ep.isFiller && (
                                                <span className={cn(
                                                    "relative z-10 text-[10px] uppercase tracking-wider px-1.5 rounded",
                                                    isCurrent ? "bg-primary/20" : "bg-zinc-800 group-hover:bg-zinc-700"
                                                )}>
                                                    Filler
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Suggested Anime Sidebar */}
                    <div className="w-full xl:w-80 shrink-0 flex flex-col gap-6 mt-8 xl:mt-0 xl:pl-6 xl:border-l xl:border-white/5">
                        {anime.recommended && anime.recommended.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">Recommended</h3>
                                <div className="flex flex-col gap-4">
                                    {anime.recommended.slice(0, 5).map(rec => (
                                        <Link
                                            key={rec.id}
                                            href={`/anime/${rec.id}`}
                                            className="group flex gap-3 items-start p-2 rounded-xl hover:bg-zinc-900 transition-colors"
                                        >
                                            <div className="relative w-16 h-24 shrink-0 rounded-lg overflow-hidden shadow-md">
                                                <Image
                                                    src={rec.poster}
                                                    alt={rec.title}
                                                    fill
                                                    sizes="64px"
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 py-1">
                                                <h4 className="text-sm font-bold text-white line-clamp-2 group-hover:text-primary transition-colors">
                                                    {rec.title}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-2 text-xs font-medium text-zinc-500">
                                                    <span>{rec.type || 'TV'}</span>
                                                    <span>•</span>
                                                    <span>{rec.episodes?.eps || '?'} Eps</span>
                                                </div>
                                            </div>
                                        </Link>
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
        </main >
    );
}
