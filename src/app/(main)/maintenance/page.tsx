"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, MessageSquare, Rss, Zap } from "lucide-react";
import { motion } from "framer-motion";

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-3xl font-black text-white sm:h-24 sm:w-24 sm:text-4xl">
            {value.toString().padStart(2, '0')}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/30" />
        </div>
        <span className="mt-3 text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</span>
    </div>
);

export default function MaintenancePage() {
    const [timeLeft, setTimeLeft] = useState({
        hours: 2,
        minutes: 44,
        seconds: 59
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);



    return (
        <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[0_0_30px_rgba(168,85,247,0.2)]"
            >
                <Zap size={40} fill="currentColor" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-2xl space-y-8"
            >
                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
                        We&apos;ll be back soon!
                    </h1>
                    <p className="mx-auto max-w-md text-lg text-zinc-400">
                        AyAnime is currently undergoing a power-up. Our team is working hard to bring you a faster, smoother experience.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-4 sm:gap-6">
                    <TimeUnit value={timeLeft.hours} label="Hours" />
                    <div className="mb-8 text-2xl font-bold text-zinc-700">:</div>
                    <TimeUnit value={timeLeft.minutes} label="Minutes" />
                    <div className="mb-8 text-2xl font-bold text-zinc-700">:</div>
                    <TimeUnit value={timeLeft.seconds} label="Seconds" />
                </div>

                <div className="space-y-6 pt-12">
                    <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                        Follow us for live updates
                    </p>
                    <div className="flex items-center justify-center gap-6">
                        <Link href="#" className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 transition-all hover:bg-primary/20 hover:text-primary">
                            <X size={20} />
                        </Link>
                        <Link href="#" className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 transition-all hover:bg-primary/20 hover:text-primary">
                            <MessageSquare size={20} />
                        </Link>
                        <Link href="#" className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 transition-all hover:bg-primary/20 hover:text-primary">
                            <Rss size={20} />
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Background elements */}
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.05),transparent_50%)]" />
        </main>
    );
}
