"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCcw, Home, MessageSquare, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
            <motion.div
                initial={{ opacity: 0, rotate: -10 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-red-500/10 text-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)]"
            >
                <AlertCircle size={64} strokeWidth={1.5} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8 max-w-lg space-y-6"
            >
                <div>
                    <span className="inline-block rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-500">
                        Error Code: ERR_MECHA_MALFUNCTION_500
                    </span>
                    <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
                        500: Server Glitch.
                    </h1>
                </div>

                <p className="text-lg text-zinc-400 leading-relaxed">
                    Our mecha pilots and technical team are currently recalibrating the core servers. It seems we&apos;ve encountered an unexpected energy surge in the sector.
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button
                        onClick={() => reset()}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:scale-105 active:scale-95 sm:w-auto"
                    >
                        <RefreshCcw size={18} className="transition-transform group-hover:rotate-180 duration-500" />
                        Try Recalibrating
                    </button>
                    <Link
                        href="/"
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-8 py-4 font-bold text-white transition-all hover:bg-white/10 hover:border-white/20 sm:w-auto"
                    >
                        <Home size={18} />
                        Abort Mission
                    </Link>
                </div>

                <div className="pt-8 border-t border-white/5">
                    <p className="text-sm text-zinc-500">
                        Still having trouble? Join our <Link href="#" className="text-primary hover:underline">Discord Community</Link> for status updates.
                    </p>
                </div>
            </motion.div>
        </main>
    );
}
