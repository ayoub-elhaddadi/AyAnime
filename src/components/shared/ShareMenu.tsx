"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Link as LinkIcon, Twitter, Facebook, MessageCircle, Share, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface ShareMenuProps {
    title: string;
    url?: string;
    className?: string;
}

export const ShareMenu = ({ title, url, className }: ShareMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Check out ${title} on AniVerse!`,
                    url: shareUrl,
                });
                toast.success("Shared successfully!");
            } catch (error) {
                if ((error as Error).name !== "AbortError") {
                    console.error("Error sharing:", error);
                }
            }
        } else {
            setIsOpen(!isOpen);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied to clipboard!");
            setIsOpen(false);
        } catch {
            toast.error("Failed to copy link");
        }
    };

    const socialPlatforms = [
        {
            name: "X (Twitter)",
            icon: <Twitter size={16} />,
            color: "hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]",
            href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${title} on AniVerse! ${shareUrl}`)}`,
        },
        {
            name: "Facebook",
            icon: <Facebook size={16} />,
            color: "hover:bg-[#4267B2]/10 hover:text-[#4267B2]",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        },
        {
            name: "WhatsApp",
            icon: <MessageCircle size={16} />,
            color: "hover:bg-[#25D366]/10 hover:text-[#25D366]",
            href: `https://wa.me/?text=${encodeURIComponent(`Check out ${title} on AniVerse! ${shareUrl}`)}`,
        },
        {
            name: "Reddit",
            icon: <Share size={16} />,
            color: "hover:bg-[#FF4500]/10 hover:text-[#FF4500]",
            href: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
        },
    ];

    return (
        <div className={cn("relative inline-block", className)} ref={menuRef}>
            <Button
                variant="outline"
                size="icon"
                className="bg-white/5 border-white/10 rounded-lg hover:cursor-pointer transition-all hover:bg-white/10 active:scale-95"
                onClick={handleShare}
                title="Share anime"
            >
                <Share2 size={18} />
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 bottom-full mb-3 z-50 w-56 p-1.5 rounded-xl bg-zinc-900/95 border border-white/10 backdrop-blur-xl shadow-2xl origin-bottom-right"
                    >
                        <div className="p-2 border-b border-white/5 mb-1">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Share this anime</h3>
                        </div>

                        <button
                            onClick={copyToClipboard}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors group text-left"
                        >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                <LinkIcon size={16} />
                            </div>
                            <span>Copy Link</span>
                        </button>

                        {socialPlatforms.map((platform) => (
                            <a
                                key={platform.name}
                                href={platform.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 transition-all group",
                                    platform.color
                                )}
                                onClick={() => setIsOpen(false)}
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-current/10 transition-colors">
                                    {platform.icon}
                                </div>
                                <span>{platform.name}</span>
                                <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
