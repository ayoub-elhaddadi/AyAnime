import { X, Loader2, Play } from "lucide-react";
import { useEffect, useState } from "react";

interface TrailerModalProps {
    isOpen: boolean;
    onClose: () => void;
    embedUrl: string;
    title: string;
}

export function TrailerModal({ isOpen, onClose, embedUrl, title }: TrailerModalProps) {
    const [isLoading, setIsLoading] = useState(true);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    // Prevent body scroll while open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!isOpen) return null;

    const src = embedUrl.includes("?")
        ? `${embedUrl}&autoplay=1`
        : `${embedUrl}?autoplay=1`;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
            aria-label={`${title} Trailer`}
        >
            {/* Background decorative glow */}
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Modal Content */}
            <div
                className="relative w-full max-w-5xl mx-auto px-4 md:px-10 lg:px-20 animate-in zoom-in-95 slide-in-from-bottom-5 duration-500 ease-out"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Official Trailer</p>
                        </div>
                        <h2 className="text-white font-black text-xl md:text-2xl leading-tight tracking-tight drop-shadow-lg">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="group flex items-center gap-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 hover:cursor-pointer"
                        aria-label="Close trailer"
                    >
                        <X size={16} className="transition-transform group-hover:rotate-90" />
                        <span className="hidden sm:inline">Close</span>
                    </button>
                </div>

                {/* Player Container */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 ring-1 ring-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                    {/* Loading State Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950 space-y-4">
                            <div className="relative">
                                <Loader2 size={48} className="text-primary animate-spin" />
                                <Play size={20} className="absolute inset-0 m-auto text-white fill-white ml-[14px]" />
                            </div>
                            <p className="text-zinc-500 text-sm font-medium animate-pulse">Initializing theater...</p>
                        </div>
                    )}

                    <iframe
                        src={src}
                        title={`${title} Trailer`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        onLoad={() => setIsLoading(false)}
                        className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    />
                </div>
            </div>
        </div>
    );
}
