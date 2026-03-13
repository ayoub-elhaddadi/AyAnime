"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Captions, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreamTrack {
    file: string;
    label: string;
    kind: "captions" | "thumbnails";
    default: boolean;
}

interface VideoPlayerProps {
    url: string;
    poster?: string;
    subtitles?: StreamTrack[];
    title?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, poster, subtitles, title }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isWaiting, setIsWaiting] = useState(true);
    const [qualityLevels, setQualityLevels] = useState<any[]>([]);
    const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 is Auto
    const [showSettings, setShowSettings] = useState(false);
    const [showSubtitlesMenu, setShowSubtitlesMenu] = useState(false);
    const [activeSubtitle, setActiveSubtitle] = useState<number>(-1); // -1 = off

    // Format time (ex: 1:04:05 or 24:00)
    const formatTime = (timeInSeconds: number) => {
        if (!timeInSeconds || isNaN(timeInSeconds)) return "00:00";
        const h = Math.floor(timeInSeconds / 3600);
        const m = Math.floor((timeInSeconds % 3600) / 60);
        const s = Math.floor(timeInSeconds % 60);
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        }
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // Initialize HLS.js
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !url) return;

        if (Hls.isSupported()) {
            const hls = new Hls({
                maxMaxBufferLength: 100,
                xhrSetup: (xhr, url) => {
                    xhr.open("GET", `/api/proxy?url=${encodeURIComponent(url)}`, true);
                },
            });
            hlsRef.current = hls;

            hls.loadSource(url);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                const levels = data.levels.map((l) => l.height);
                setQualityLevels(levels);
                setIsWaiting(false);
            });

            hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                setCurrentQuality(data.level);
            });

            return () => {
                hls.destroy();
            };
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            setIsWaiting(false);
        }
    }, [url]);

    // Handle Play/Pause
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    // Video Events
    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const current = videoRef.current.currentTime || 0;
        const total = videoRef.current.duration || 0;
        setCurrentTime(current);
        if (total > 0) {
            setProgress((current / total) * 100);
        } else {
            setProgress(0);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            // Setup default subtitle if available
            if (subtitles && subtitles.length > 0) {
                const defaultSub = subtitles.findIndex(s => s.default);
                setActiveSubtitle(defaultSub !== -1 ? defaultSub : 0);
            }
        }
    };

    // Set active text track
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        for (let i = 0; i < video.textTracks.length; i++) {
            video.textTracks[i].mode = i === activeSubtitle ? "showing" : "disabled";
        }
    }, [activeSubtitle]);

    // Handle Seek
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value) || 0;
        if (videoRef.current && !isNaN(duration) && duration > 0) {
            const newTime = (value / 100) * duration;
            videoRef.current.currentTime = newTime;
            setProgress(value);
        } else if (videoRef.current) {
            setProgress(value);
        }
    };

    // Handle Volume
    const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (videoRef.current) {
            videoRef.current.volume = value;
            setVolume(value);
            setIsMuted(value === 0);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const newMuted = !isMuted;
            videoRef.current.muted = newMuted;
            setIsMuted(newMuted);
            if (newMuted) setVolume(0);
            else setVolume(1);
        }
    };

    // Handle Fullscreen
    const toggleFullscreen = async () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            await containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Listen for fullscreen changes from browser (e.g. hitting Esc)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    // Controls Hide Timer
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(timeout);
            if (isPlaying) {
                timeout = setTimeout(() => {
                    setShowControls(false);
                    setShowSettings(false);
                    setShowSubtitlesMenu(false);
                }, 3000);
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseleave', () => { if (isPlaying) setShowControls(false) });
        }

        return () => {
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
                container.removeEventListener('mouseleave', () => { if (isPlaying) setShowControls(false) });
            }
            clearTimeout(timeout);
        };
    }, [isPlaying]);

    const changeQuality = (levelIndex: number) => {
        if (hlsRef.current) {
            hlsRef.current.currentLevel = levelIndex; // -1 for auto
            setCurrentQuality(levelIndex);
            setShowSettings(false);
        }
    };

    // Captions 
    const captionsData = subtitles?.filter(s => s.kind === "captions") || [];

    return (
        <div
            ref={containerRef}
            className="group relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
        >
            {/* Global style for styling subtitles like Netflix */}
            <style dangerouslySetInnerHTML={{
                __html: `
                video::cue {
                    color: white;
                    background-color: transparent;
                    text-shadow: 
                        0px 0px 4px rgba(0,0,0,1),
                        0px 0px 4px rgba(0,0,0,1),
                        -2px -2px 0 #000,  
                         2px -2px 0 #000,
                        -2px  2px 0 #000,
                         2px  2px 0 #000;
                    font-family: "Inter", "Helvetica Neue", Helvetica, sans-serif;
                    font-weight: 700;
                    font-size: 1.5rem;
                }
            `}} />

            {/* Waiting Spinner */}
            {isWaiting && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
                    <Loader2 size={48} className="animate-spin text-primary" />
                </div>
            )}

            {/* Video Element */}
            <video
                ref={videoRef}
                className="w-full h-full object-contain cursor-pointer"
                poster={poster}
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onWaiting={() => setIsWaiting(true)}
                onPlaying={() => setIsWaiting(false)}
                crossOrigin="anonymous" // needed for vtt tracks on some servers
            >
                {captionsData.map((sub, index) => (
                    <track
                        key={index}
                        kind="captions"
                        src={sub.file}
                        srcLang={sub.label}
                        label={sub.label}
                        default={sub.default}
                    />
                ))}
            </video>

            {/* Title Overlay (Top) */}
            <div className={cn(
                "absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 z-30",
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
                {title && <h2 className="text-white font-bold text-lg lg:text-xl drop-shadow-md">{title}</h2>}
            </div>

            {/* Controls Overlay (Bottom) */}
            <div className={cn(
                "absolute bottom-0 left-0 right-0 p-4 pt-16 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 z-30",
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
                {/* Progress Bar */}
                <div className="flex items-center gap-4 mb-4 group/progress cursor-pointer">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-primary hover:h-2 transition-all"
                        style={{
                            background: `linear-gradient(to right, rgb(168, 85, 247) ${progress}%, rgba(255,255,255,0.2) ${progress}%)`
                        }}
                    />
                </div>

                <div className="flex items-center justify-between">
                    {/* Left Controls */}
                    <div className="flex items-center gap-6">
                        <button onClick={togglePlay} className="text-white hover:text-primary transition-colors focus:outline-none hover:scale-110 active:scale-95">
                            {isPlaying ? <Pause size={28} className="fill-current" /> : <Play size={28} className="fill-current" />}
                        </button>

                        <div className="flex items-center gap-3 group/volume">
                            <button onClick={toggleMute} className="text-white hover:text-primary transition-colors focus:outline-none">
                                {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolume}
                                className="w-0 opacity-0 group-hover/volume:w-24 group-hover/volume:opacity-100 transition-all duration-300 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                                style={{
                                    background: `linear-gradient(to right, white ${isMuted ? 0 : volume * 100}%, rgba(255,255,255,0.2) ${isMuted ? 0 : volume * 100}%)`
                                }}
                            />
                        </div>

                        <span className="text-white text-sm font-medium tracking-wide drop-shadow-md">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-5 relative">
                        {captionsData.length > 0 && (
                            <div className="relative">
                                <button
                                    onClick={() => { setShowSubtitlesMenu(!showSubtitlesMenu); setShowSettings(false); }}
                                    className="text-white hover:text-primary transition-colors focus:outline-none"
                                >
                                    <Captions size={24} className={activeSubtitle !== -1 ? "text-primary" : ""} />
                                </button>

                                {/* Subtitles Menu */}
                                {showSubtitlesMenu && (
                                    <div className="absolute bottom-full right-0 mb-4 bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-xl py-2 min-w-[150px] shadow-2xl flex flex-col items-start overflow-hidden origin-bottom-right animate-in fade-in zoom-in-95">
                                        <div className="px-4 py-2 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 w-full">Subtitles</div>
                                        <button
                                            onClick={() => { setActiveSubtitle(-1); setShowSubtitlesMenu(false); }}
                                            className={cn("w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5", activeSubtitle === -1 ? "text-primary bg-primary/5" : "text-white")}
                                        >
                                            Off
                                        </button>
                                        {captionsData.map((sub, index) => (
                                            <button
                                                key={index}
                                                onClick={() => { setActiveSubtitle(index); setShowSubtitlesMenu(false); }}
                                                className={cn("w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5", activeSubtitle === index ? "text-primary bg-primary/5" : "text-white")}
                                            >
                                                {sub.label || `Track ${index + 1}`}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="relative">
                            <button
                                onClick={() => { setShowSettings(!showSettings); setShowSubtitlesMenu(false); }}
                                className={cn("text-white hover:text-primary transition-colors focus:outline-none", showSettings && "rotate-45")}
                            >
                                <Settings size={24} />
                            </button>

                            {/* Settings Menu */}
                            {showSettings && qualityLevels.length > 0 && (
                                <div className="absolute bottom-full right-0 mb-4 bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-xl py-2 min-w-[120px] shadow-2xl flex flex-col items-start overflow-hidden origin-bottom-right animate-in fade-in zoom-in-95">
                                    <div className="px-4 py-2 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 w-full">Quality</div>
                                    <button
                                        onClick={() => changeQuality(-1)}
                                        className={cn("w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5", currentQuality === -1 ? "text-primary bg-primary/5" : "text-white")}
                                    >
                                        Auto
                                    </button>
                                    {qualityLevels.map((level, index) => (
                                        <button
                                            key={index}
                                            onClick={() => changeQuality(index)}
                                            className={cn("w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5", currentQuality === index ? "text-primary bg-primary/5" : "text-white")}
                                        >
                                            {level}p
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors focus:outline-none">
                            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
