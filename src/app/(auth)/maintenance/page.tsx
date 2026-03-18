"use client";

import { useEffect, useState } from "react";
import { Wrench, Sparkles } from "lucide-react";
import { motion } from "framer-motion";


export default function MaintenancePage() {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        let cookieEndTime = document.cookie.split("; ").find(row => row.startsWith("mnt_end_time="));
        let targetTime: number;

        if (cookieEndTime) {
            targetTime = Number(cookieEndTime.split("=")[1]);
            // If the time is in the past, reset the timer (or handle completion)
            if (targetTime < Date.now()) {
                targetTime = Date.now() + (2 * 60 * 60 + 44 * 60 + 59) * 1000;
                document.cookie = `mnt_end_time=${targetTime}; path=/; max-age=${60 * 60 * 24}`;
            }
        } else {
            // Target is exactly 2 hours, 44 mins, 59 secs from now
            targetTime = Date.now() + (2 * 60 * 60 + 44 * 60 + 59) * 1000;
            document.cookie = `mnt_end_time=${targetTime}; path=/; max-age=${60 * 60 * 24}`;
        }

        const calculateTimeLeft = () => {
            const difference = targetTime - Date.now();
            if (difference > 0) {
                setTimeLeft({
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft(); // initial calc
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4 py-20 text-center">
            {/* Ambient Background */}
            <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
                <div className="absolute h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
                <div className="absolute h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[150px] mix-blend-screen translate-x-1/2" />
            </div>

            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

            <div className="relative z-10 flex w-full max-w-4xl flex-col items-center mt-[-2rem]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-[0_0_50px_rgba(168,85,247,0.3)] backdrop-blur-md"
                >
                    <Wrench size={40} className="text-primary" />
                    <Sparkles size={20} className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="space-y-6"
                >
                    <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 sm:text-7xl lg:text-8xl pb-2">
                        We&apos;ll be back soon
                    </h1>

                    <p className="mx-auto max-w-xl text-lg text-zinc-400 sm:text-xl leading-relaxed">
                        AyAnime is currently undergoing a massive power-up! ⚡️<br />
                        Our ninjas are working hard behind the scenes to bring you a faster, smoother, and completely upgraded streaming experience.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="mt-16 flex items-center justify-center gap-4 sm:gap-8"
                >
                    <TimeUnit value={timeLeft.hours} label="Hours" />
                    <div className="mb-10 text-3xl font-black text-white/20 sm:text-5xl animate-pulse">:</div>
                    <TimeUnit value={timeLeft.minutes} label="Minutes" />
                    <div className="mb-10 text-3xl font-black text-white/20 sm:text-5xl animate-pulse">:</div>
                    <TimeUnit value={timeLeft.seconds} label="Seconds" />
                </motion.div>
            </div>

            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        </main>
    );
}

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
        <div className="relative flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-4xl font-black text-white sm:text-6xl overflow-hidden backdrop-blur-xl shadow-2xl shadow-primary/10">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
            <motion.span
                key={value}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="z-10 text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400"
            >
                {value.toString().padStart(2, '0')}
            </motion.span>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
        </div>
        <span className="mt-4 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</span>
    </div>
);