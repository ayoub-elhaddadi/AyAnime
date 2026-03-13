"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Check, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            // Show popup after a short delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "accepted");
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem("cookie-consent", "declined");
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-6 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 px-4 md:px-0"
                >
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur-2xl md:p-8">
                        {/* Background Glow */}
                        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-primary/20 blur-[80px]" />

                        <div className="relative flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                                <Cookie size={32} />
                            </div>

                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold tracking-tight text-white">We use cookies</h3>
                                    <p className="text-sm leading-relaxed text-zinc-400">
                                        AyAnime uses cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                                    <Button
                                        onClick={handleAccept}
                                        className="h-11 rounded-xl bg-primary px-6 font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Check className="mr-2" size={18} />
                                        Accept All
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleDecline}
                                        className="h-11 rounded-xl border-white/10 bg-white/5 px-6 font-bold text-white backdrop-blur-md hover:bg-white/10"
                                    >
                                        <X className="mr-2" size={18} />
                                        Reject All
                                    </Button>
                                    <Link
                                        href="/privacy"
                                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:text-primary"
                                    >
                                        <ShieldCheck size={14} />
                                        Privacy Policy
                                    </Link>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsVisible(false)}
                                className="absolute right-4 top-4 text-zinc-500 transition-colors hover:text-white hover:cursor-pointer"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
