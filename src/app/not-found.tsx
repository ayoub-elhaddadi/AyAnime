"use client";

import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
    return (
        <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
            >
                <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50" />
                <h1 className="relative text-9xl font-black tracking-tighter text-white sm:text-[12rem]">
                    404
                </h1>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8 max-w-lg space-y-6"
            >
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Lost in the Multiverse
                </h2>
                <p className="text-lg text-zinc-400">
                    Even the strongest protagonists lose their way sometimes. The page you&apos;re looking for has vanished into another dimension or never existed in this timeline.
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                        href="/"
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:scale-105 active:scale-95 sm:w-auto"
                    >
                        <Home size={18} />
                        Back to Reality
                    </Link>
                    <Link
                        href="/catalog"
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-8 py-4 font-bold text-white transition-all hover:bg-white/10 hover:border-white/20 sm:w-auto"
                    >
                        <Compass size={18} />
                        Browse Anime
                    </Link>
                </div>
            </motion.div>

            {/* Decorative background elements */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute right-[10%] bottom-[20%] h-96 w-96 rounded-full bg-primary/10 blur-[160px]" />
            </div>
        </main>
    );
}
