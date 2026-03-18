"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import Cookies from "js-cookie";

import {
    Play, Pause, Volume2, VolumeX, Volume1,
    Maximize, Minimize, Settings, Captions,
    RotateCcw, RotateCw, SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */
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
    episodeNumber?: number;
    episodeTitle?: string;
    episodeId?: string;
    introStart?: number;
    introEnd?: number;
    outroStart?: number;
}

/* ──────────────────────────────────────────────
   Resume helpers (cookie-based)
   ────────────────────────────────────────────── */
const RESUME_COOKIE = "av_resume";
const SAVE_INTERVAL = 5; // save every 5 seconds of playback

function getResumeTime(id: string): number {
    try {
        const raw = Cookies.get(RESUME_COOKIE);
        if (!raw) return 0;
        const map = JSON.parse(raw) as Record<string, number>;
        return map[id] ?? 0;
    } catch { return 0; }
}

function saveResumeTime(id: string, time: number) {
    try {
        const raw = Cookies.get(RESUME_COOKIE);
        const map: Record<string, number> = raw ? JSON.parse(raw) : {};
        map[id] = Math.floor(time);
        // Keep only last 50 entries
        const keys = Object.keys(map);
        if (keys.length > 50) delete map[keys[0]];
        Cookies.set(RESUME_COOKIE, JSON.stringify(map), { expires: 365 });
    } catch { /* silent */ }
}

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
    url,
    poster,
    subtitles,
    title,
    episodeNumber,
    episodeTitle,
    episodeId,
    introStart = 0,
    introEnd = 0,
}) => {
    /* Refs */
    const videoRef = useRef<HTMLVideoElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const idleTimer = useRef<ReturnType<typeof setTimeout>>(null);
    const tapTimer = useRef<ReturnType<typeof setTimeout>>(null);
    const lastSaved = useRef(0);

    /* State */
    const [playing, setPlaying] = useState(false);
    const [time, setTime] = useState(0);
    const [length, setLength] = useState(0);
    const [pct, setPct] = useState(0);
    const [buf, setBuf] = useState(0);
    const [vol, setVol] = useState(1);
    const [muted, setMuted] = useState(false);
    const [full, setFull] = useState(false);
    const [idle, setIdle] = useState(false);
    const [loading, setLoading] = useState(true);
    const [qualities, setQualities] = useState<number[]>([]);
    const [curQ, setCurQ] = useState(-1);
    const [qMenu, setQMenu] = useState(false);
    const [subMenu, setSubMenu] = useState(false);
    const [curSub, setCurSub] = useState(-1);
    const [scrubHover, setScrubHover] = useState<number | null>(null);
    const [flashIcon, setFlashIcon] = useState<"play" | "pause" | "fwd" | "rwd" | null>(null);
    const [showBigPlay, setShowBigPlay] = useState(true);
    const [showSkipIntro, setShowSkipIntro] = useState(false);
    const [hasResumed, setHasResumed] = useState(false);

    const captions = subtitles?.filter(s => s.kind === "captions") ?? [];

    /* ── Helpers ─────────────────────────────── */
    const fmt = (s: number): string => {
        if (!s || isNaN(s)) return "0:00";
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = Math.floor(s % 60);
        return h > 0
            ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
            : `${m}:${String(sec).padStart(2, "0")}`;
    };

    const VolumeIcon = muted || vol === 0 ? VolumeX : vol < 0.5 ? Volume1 : Volume2;

    /* ── HLS ─────────────────────────────────── */
    useEffect(() => {
        const v = videoRef.current;
        if (!v || !url) return;
        setShowBigPlay(true);
        setHasResumed(false);
        lastSaved.current = 0;

        if (Hls.isSupported()) {
            const hls = new Hls({
                maxMaxBufferLength: 100,
                xhrSetup: (xhr, u) => xhr.open("GET", `/api/proxy?url=${encodeURIComponent(u)}`, true),
            });
            hlsRef.current = hls;
            hls.loadSource(url);
            hls.attachMedia(v);
            hls.on(Hls.Events.MANIFEST_PARSED, (_, d) => {
                setQualities(d.levels.map(l => l.height));
                setLoading(false);
            });
            hls.on(Hls.Events.LEVEL_SWITCHED, (_, d) => setCurQ(d.level));
            return () => hls.destroy();
        }
        if (v.canPlayType("application/vnd.apple.mpegurl")) {
            v.src = url;
            setLoading(false);
        }
    }, [url]);

    /* ── Resume position on metadata load ────── */
    const onMeta = useCallback(() => {
        const v = videoRef.current;
        if (!v) return;
        setLength(v.duration);
        // Activate subtitles
        if (captions.length) {
            const d = captions.findIndex(s => s.default);
            setCurSub(d !== -1 ? d : 0);
        }
        // Resume position
        if (episodeId && !hasResumed) {
            const saved = getResumeTime(episodeId);
            if (saved > 5 && saved < v.duration - 10) {
                v.currentTime = saved;
            }
            setHasResumed(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [episodeId, hasResumed]);

    /* ── Subtitle track activation ───────────── */
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        Array.from(v.textTracks).forEach((t, i) => {
            t.mode = i === curSub ? "showing" : "disabled";
        });
    }, [curSub]);

    /* ── Fullscreen listener ─────────────────── */
    useEffect(() => {
        const fn = () => setFull(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", fn);
        return () => document.removeEventListener("fullscreenchange", fn);
    }, []);

    /* ── Keyboard shortcuts ──────────────────── */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const v = videoRef.current;
            if (!v) return;
            if (document.activeElement?.tagName === "INPUT") return;
            switch (e.key.toLowerCase()) {
                case " ": case "k": e.preventDefault(); toggle(); break;
                case "arrowleft": case "j": e.preventDefault(); skip(-10); break;
                case "arrowright": case "l": e.preventDefault(); skip(10); break;
                case "arrowup": e.preventDefault(); changeVol(Math.min(1, vol + 0.1)); break;
                case "arrowdown": e.preventDefault(); changeVol(Math.max(0, vol - 0.1)); break;
                case "m": e.preventDefault(); toggleMute(); break;
                case "f": e.preventDefault(); toggleFull(); break;
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vol, muted, playing]);

    /* ── Idle / auto-hide ────────────────────── */
    const resetIdle = useCallback(() => {
        setIdle(false);
        if (idleTimer.current) clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => {
            if (videoRef.current && !videoRef.current.paused) {
                setIdle(true);
                setQMenu(false);
                setSubMenu(false);
            }
        }, 2500);
    }, []);

    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;
        el.addEventListener("mousemove", resetIdle);
        el.addEventListener("mouseleave", () => {
            if (videoRef.current && !videoRef.current.paused) setIdle(true);
        });
        return () => {
            el.removeEventListener("mousemove", resetIdle);
            if (idleTimer.current) clearTimeout(idleTimer.current);
        };
    }, [resetIdle]);

    /* ── Save position on unload ─────────────── */
    useEffect(() => {
        const save = () => {
            if (episodeId && videoRef.current) {
                saveResumeTime(episodeId, videoRef.current.currentTime);
            }
        };
        window.addEventListener("beforeunload", save);
        return () => {
            save(); // save when component unmounts (episode change)
            window.removeEventListener("beforeunload", save);
        };
    }, [episodeId]);

    /* ── Flash center icon ───────────────────── */
    const flash = (type: "play" | "pause" | "fwd" | "rwd") => {
        setFlashIcon(type);
        if (tapTimer.current) clearTimeout(tapTimer.current);
        tapTimer.current = setTimeout(() => setFlashIcon(null), 600);
    };

    /* ── Actions ─────────────────────────────── */
    const toggle = () => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) { v.play(); flash("play"); }
        else { v.pause(); flash("pause"); }
    };

    const skip = (s: number) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime += s;
        flash(s > 0 ? "fwd" : "rwd");
        resetIdle();
    };

    const skipIntro = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = introEnd;
        setShowSkipIntro(false);
    };

    const seekTo = (clientX: number) => {
        const bar = trackRef.current;
        const v = videoRef.current;
        if (!bar || !v || !length) return;
        const r = bar.getBoundingClientRect();
        const p = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
        v.currentTime = p * length;
    };

    const changeVol = (val: number) => {
        const v = videoRef.current;
        if (!v) return;
        v.volume = val;
        v.muted = val === 0;
        setVol(val);
        setMuted(val === 0);
    };

    const toggleMute = () => {
        const v = videoRef.current;
        if (!v) return;
        if (muted) { v.muted = false; v.volume = vol || 1; setMuted(false); if (!vol) setVol(1); }
        else { v.muted = true; setMuted(true); }
    };

    const toggleFull = async () => {
        if (!wrapperRef.current) return;
        if (!document.fullscreenElement) await wrapperRef.current.requestFullscreen().catch(() => { });
        else document.exitFullscreen();
    };

    const setQuality = (idx: number) => {
        if (hlsRef.current) { hlsRef.current.currentLevel = idx; setCurQ(idx); }
        setQMenu(false);
    };

    /* ── Time update with save + skip-intro logic ── */
    const onTime = () => {
        const v = videoRef.current;
        if (!v) return;
        const cur = v.currentTime;
        setTime(cur);
        setPct(v.duration > 0 ? (cur / v.duration) * 100 : 0);
        if (v.buffered.length) setBuf((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);

        // Show skip intro when playback is within the intro range
        const hasIntro = introEnd > 0 && introEnd > introStart;
        setShowSkipIntro(hasIntro && cur >= introStart && cur < introEnd);

        // Periodically save resume position
        if (episodeId && Math.abs(cur - lastSaved.current) >= SAVE_INTERVAL) {
            lastSaved.current = cur;
            saveResumeTime(episodeId, cur);
        }
    };

    /* ── Flash icon element ──────────────────── */
    const FlashContent = () => {
        if (flashIcon === "play") return <Play size={30} className="fill-white text-white translate-x-0.5" />;
        if (flashIcon === "pause") return <Pause size={30} className="fill-white text-white" />;
        if (flashIcon === "fwd") return <RotateCw size={28} className="text-white" />;
        if (flashIcon === "rwd") return <RotateCcw size={28} className="text-white" />;
        return null;
    };

    /* Episode info label */
    const epLabel = episodeNumber
        ? `EP ${episodeNumber}${episodeTitle ? ` — ${episodeTitle}` : ""}`
        : title;

    /* ──────────────────────────────────────────
       RENDER
       ────────────────────────────────────────── */
    const showOverlay = !idle || !playing; // show overlay when paused or controls visible

    return (
        <div
            ref={wrapperRef}
            className={cn(
                "relative w-full aspect-video bg-black overflow-hidden rounded-xl",
                "ring-1 ring-white/[0.06] shadow-2xl",
                idle && playing && "cursor-none"
            )}
            onDoubleClick={toggleFull}
        >
            {/* ── Subtitle rendering ─────────── */}
            <style>{`
                video::cue {
                    color: #fff;
                    background: transparent;
                    text-shadow: 0 1px 4px rgba(0,0,0,.9), 0 0px 20px rgba(0,0,0,.7);
                    font-family: "Inter", system-ui, sans-serif;
                    font-weight: 700;
                    font-size: 1em;
                    line-height: 1.4;
                }
            `}</style>

            {/* ── Loading overlay ─────────────── */}
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="w-12 h-12 rounded-full border-[3px] border-white/10 border-t-primary animate-spin" />
                </div>
            )}

            {/* ── Big initial play / paused overlay ── */}
            {(showBigPlay && !playing && !loading) && (
                <div
                    className="absolute inset-0 z-30 flex items-center justify-center cursor-pointer bg-black/30"
                    onClick={() => { toggle(); setShowBigPlay(false); }}
                >
                    <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-[0_0_60px_rgba(168,85,247,.4)] hover:scale-110 active:scale-95 transition-transform duration-200">
                        <Play size={36} className="fill-white text-white translate-x-1" />
                    </div>
                </div>
            )}

            {/* ── Paused state: large pause icon in center ── */}
            {!playing && !showBigPlay && !loading && (
                <div className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10 animate-in fade-in zoom-in-75 duration-300">
                        <Pause size={34} className="fill-white text-white" />
                    </div>
                </div>
            )}

            {/* ── Center flash icon ──────────── */}
            <div className={cn(
                "absolute inset-0 z-25 flex items-center justify-center pointer-events-none transition-all duration-[400ms] ease-out",
                flashIcon ? "opacity-100 scale-100" : "opacity-0 scale-50"
            )}>
                <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
                    <FlashContent />
                </div>
            </div>

            {/* ── Skip Intro button ──────────── */}
            {showSkipIntro && playing && (
                <button
                    onClick={skipIntro}
                    className={cn(
                        "absolute bottom-24 right-5 z-30 flex items-center gap-2",
                        "px-5 py-2.5 rounded-lg",
                        "bg-white/[0.12] hover:bg-white/[0.2] backdrop-blur-md",
                        "border border-white/[0.15] hover:border-white/[0.3]",
                        "text-white text-sm font-semibold tracking-wide",
                        "transition-all duration-200 hover:scale-105 active:scale-95",
                        "animate-in fade-in slide-in-from-right-4 duration-300",
                        "shadow-[0_4px_24px_rgba(0,0,0,.4)] cursor-pointer"
                    )}
                >
                    <SkipForward size={16} />
                    Skip Intro
                </button>
            )}

            {/* ── Click-to-toggle layer ──────── */}
            <div
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={() => { toggle(); if (showBigPlay) setShowBigPlay(false); }}
            />

            {/* ── Video ──────────────────────── */}
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-contain"
                poster={poster}
                onPlay={() => { setPlaying(true); setShowBigPlay(false); resetIdle(); }}
                onPause={() => { setPlaying(false); setIdle(false); }}
                onTimeUpdate={onTime}
                onLoadedMetadata={onMeta}
                onWaiting={() => setLoading(true)}
                onPlaying={() => setLoading(false)}
                crossOrigin="anonymous"
            >
                {captions.map((s, i) => (
                    <track key={i} kind="captions" src={s.file} srcLang={s.label} label={s.label} default={s.default} />
                ))}
            </video>

            {/* ────────────────────────────────────
                CONTROLS SHELL
                ──────────────────────────────────── */}
            <div className={cn(
                "absolute inset-0 z-20 flex flex-col justify-between transition-opacity duration-300 pointer-events-none",
                showOverlay ? "opacity-100" : "opacity-0"
            )}>
                {/* ── Top bar (episode info) ──── */}
                <div className="p-4 md:p-5 bg-gradient-to-b from-black/70 to-transparent pointer-events-auto">
                    {epLabel && (
                        <p className="text-white/90 text-sm md:text-base font-semibold truncate drop-shadow-sm">
                            {epLabel}
                        </p>
                    )}
                </div>

                {/* ── Bottom controls ─────────── */}
                <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20 pointer-events-auto">
                    <div className="px-3 pb-3 md:px-5 md:pb-4 space-y-2.5">

                        {/* ── Progress / scrub bar ── */}
                        <div className="flex items-center gap-3 text-[13px] tabular-nums text-white/60 select-none font-medium">
                            <span className="w-10 text-right shrink-0">{fmt(time)}</span>

                            <div
                                ref={trackRef}
                                className="group/track relative flex-1 h-6 flex items-center cursor-pointer"
                                onMouseMove={e => {
                                    const r = trackRef.current!.getBoundingClientRect();
                                    setScrubHover(Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1) * 100);
                                }}
                                onMouseLeave={() => setScrubHover(null)}
                                onClick={e => seekTo(e.clientX)}
                            >
                                {/* Rail */}
                                <div className="absolute left-0 right-0 h-[3px] group-hover/track:h-[5px] rounded-full bg-white/[0.12] transition-all duration-150">
                                    <div className="absolute inset-y-0 left-0 rounded-full bg-white/[0.22]" style={{ width: `${buf}%` }} />
                                    <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                                    {scrubHover !== null && (
                                        <div className="absolute inset-y-0 left-0 rounded-full bg-white/[0.08]" style={{ width: `${scrubHover}%` }} />
                                    )}
                                </div>
                                {/* Thumb */}
                                <div
                                    className="absolute w-[13px] h-[13px] rounded-full bg-primary shadow-md pointer-events-none -translate-x-1/2 transition-all duration-100 opacity-0 scale-0 group-hover/track:opacity-100 group-hover/track:scale-100"
                                    style={{ left: `${pct}%` }}
                                />
                                {/* Hover time tooltip */}
                                {scrubHover !== null && (
                                    <div
                                        className="absolute -top-8 -translate-x-1/2 bg-zinc-900 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-lg pointer-events-none"
                                        style={{ left: `${scrubHover}%` }}
                                    >
                                        {fmt((scrubHover / 100) * length)}
                                    </div>
                                )}
                            </div>

                            <span className="w-10 shrink-0">{fmt(length)}</span>
                        </div>

                        {/* ── Buttons row ─────────── */}
                        <div className="flex items-center justify-between">
                            {/* LEFT */}
                            <div className="flex items-center gap-0.5 md:gap-1">
                                <Btn onClick={toggle} label={playing ? "Pause" : "Play"}>
                                    {playing
                                        ? <Pause size={22} className="fill-current" />
                                        : <Play size={22} className="fill-current translate-x-[2px]" />
                                    }
                                </Btn>
                                <Btn onClick={() => skip(-10)} label="Rewind 10s">
                                    <RotateCcw size={19} strokeWidth={2.2} />
                                </Btn>
                                <Btn onClick={() => skip(10)} label="Forward 10s">
                                    <RotateCw size={19} strokeWidth={2.2} />
                                </Btn>
                                {/* Volume */}
                                <div className="flex items-center group/vol">
                                    <Btn onClick={toggleMute} label="Mute">
                                        <VolumeIcon size={20} />
                                    </Btn>
                                    <div className="grid transition-all duration-300 overflow-hidden w-0 group-hover/vol:w-[88px]">
                                        <input
                                            type="range" min={0} max={1} step={0.02}
                                            value={muted ? 0 : vol}
                                            onChange={e => changeVol(+e.target.value)}
                                            className="w-[80px] ml-1 h-[3px] rounded-full appearance-none cursor-pointer accent-primary"
                                            style={{ background: `linear-gradient(90deg, #a855f7 ${(muted ? 0 : vol) * 100}%, rgba(255,255,255,.18) ${(muted ? 0 : vol) * 100}%)` }}
                                        />
                                    </div>
                                </div>
                                <span className="text-white/60 text-xs tabular-nums select-none hidden sm:inline ml-1">
                                    {fmt(time)}&nbsp;<span className="text-white/30">/</span>&nbsp;{fmt(length)}
                                </span>
                            </div>

                            {/* RIGHT */}
                            <div className="flex items-center gap-0.5 md:gap-1">
                                {captions.length > 0 && (
                                    <div className="relative">
                                        <Btn onClick={() => { setSubMenu(p => !p); setQMenu(false); }} label="Subtitles" active={curSub !== -1}>
                                            <Captions size={20} />
                                        </Btn>
                                        {subMenu && (
                                            <Dropdown>
                                                <DropdownHeader>Subtitles</DropdownHeader>
                                                <DropdownItem active={curSub === -1} onClick={() => { setCurSub(-1); setSubMenu(false); }}>Off</DropdownItem>
                                                {captions.map((s, i) => (
                                                    <DropdownItem key={i} active={curSub === i} onClick={() => { setCurSub(i); setSubMenu(false); }}>
                                                        {s.label || `Track ${i + 1}`}
                                                    </DropdownItem>
                                                ))}
                                            </Dropdown>
                                        )}
                                    </div>
                                )}
                                {qualities.length > 0 && (
                                    <div className="relative">
                                        <Btn onClick={() => { setQMenu(p => !p); setSubMenu(false); }} label="Quality" active={qMenu}>
                                            <Settings size={19} className={cn(qMenu && "rotate-90", "transition-transform duration-300")} />
                                        </Btn>
                                        {qMenu && (
                                            <Dropdown>
                                                <DropdownHeader>Quality</DropdownHeader>
                                                <DropdownItem active={curQ === -1} onClick={() => setQuality(-1)}>Auto</DropdownItem>
                                                {qualities.map((q, i) => (
                                                    <DropdownItem key={i} active={curQ === i} onClick={() => setQuality(i)}>{q}p</DropdownItem>
                                                ))}
                                            </Dropdown>
                                        )}
                                    </div>
                                )}
                                <Btn onClick={toggleFull} label="Fullscreen">
                                    {full ? <Minimize size={20} /> : <Maximize size={20} />}
                                </Btn>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ──────────────────────────────────────────────
   Sub-components
   ────────────────────────────────────────────── */
const Btn: React.FC<{
    onClick: () => void;
    label: string;
    active?: boolean;
    children: React.ReactNode;
}> = ({ onClick, label, active, children }) => (
    <button
        onClick={onClick}
        title={label}
        className={cn(
            "relative p-2 rounded-full transition-all duration-150",
            "hover:bg-white/[0.08] active:scale-90",
            active ? "text-primary" : "text-white/80 hover:text-white"
        )}
    >
        {children}
    </button>
);

const Dropdown: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="absolute bottom-full right-0 mb-2 min-w-[140px] py-1 rounded-xl bg-zinc-950/[0.97] backdrop-blur-xl border border-white/[0.06] shadow-[0_16px_48px_rgba(0,0,0,.6)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
        {children}
    </div>
);

const DropdownHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-[.15em] text-zinc-500 border-b border-white/[0.05]">
        {children}
    </div>
);

const DropdownItem: React.FC<{
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full text-left px-3.5 py-2 text-[13px] font-medium transition-colors",
            "hover:bg-white/[0.05]",
            active ? "text-primary" : "text-white/70"
        )}
    >
        <span className="flex items-center gap-2">
            {active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            {children}
        </span>
    </button>
);
