"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface TrailerModalProps {
    isOpen: boolean;
    onClose: () => void;
    embedUrl: string;
    title: string;
}

export function TrailerModal({ isOpen, onClose, embedUrl, title }: TrailerModalProps) {
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
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
            aria-label={`${title} Trailer`}
        >
            {/* Modal Content */}
            <div
                className="relative w-full max-w-5xl mx-4 animate-in zoom-in-95 fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Official Trailer</p>
                        <h2 className="text-white font-bold text-lg leading-tight">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 text-sm text-white/80 hover:text-white transition-colors hover:cursor-pointer"
                        aria-label="Close trailer"
                    >
                        <X size={16} /> Close
                    </button>
                </div>

                {/* Player */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/60">
                    <iframe
                        src={src}
                        title={`${title} Trailer`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    />
                </div>

                {/* Hint */}
                <p className="text-center text-zinc-600 text-xs mt-3">
                    Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-zinc-400">Esc</kbd> or click outside to close
                </p>
            </div>
        </div>
    );
}
