"use client";

import { motion } from "framer-motion";
import { Shield, Eye, Lock, FileText } from "lucide-react";

export default function GuidelinesPage() {
    const guidelines = [
        {
            title: "Be Respectful",
            description: "Treat every member with the honor of a Shonen protagonist. Kind language and positive vibes only.",
            icon: Shield
        },
        {
            title: "No Spoilers",
            description: "Don't ruin the climax! Use spoiler tags for new releases and keep plot twists hidden from the uninitiated.",
            icon: Eye
        },
        {
            title: "Zero Hate Speech",
            description: "Harassment, discrimination, and hate speech are strictly forbidden. One strike and you're banished to the shadow realm.",
            icon: Lock
        }
    ];

    const rules = [
        {
            id: "01",
            title: "Content Sharing",
            content: "Only share content you have the right to post. Credit the original artists whenever possible. AI-generated content must be clearly tagged."
        },
        {
            id: "02",
            title: "Discussions",
            content: "Debates about \"Best Girl\" or power scaling are encouraged, but keep them civil. No personal attacks during spirited arguments."
        },
        {
            id: "03",
            title: "Marketplace",
            content: "No selling of pirated merch or unofficial bootlegs. Use the verified trade channels for figure swapping and manga sales."
        }
    ];

    return (
        <>
            <main className="container mt-30 mx-auto max-w-4xl px-4 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-16"
                >
                    <div className="space-y-4 text-center">
                        <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
                            The Code of AyAnime
                        </h1>
                        <p className="mx-auto max-w-xl text-lg text-zinc-400">
                            Our guidelines ensure AyAnime remains a vibrant and safe haven for anime fans worldwide.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        {guidelines.map((g, i) => (
                            <motion.div
                                key={g.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="group rounded-2xl bg-white/5 border border-white/10 p-8 transition-all hover:bg-white/10 hover:border-primary/50"
                            >
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary transition-transform group-hover:scale-110">
                                    <g.icon size={24} />
                                </div>
                                <h3 className="mb-4 text-xl font-bold text-white">{g.title}</h3>
                                <p className="text-sm leading-relaxed text-zinc-400">{g.description}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="space-y-8 rounded-3xl bg-zinc-900/50 border border-white/5 p-8 sm:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <FileText className="text-primary" size={28} />
                            <h2 className="text-3xl font-black text-white italic tracking-tight">Deep Dive into the Rules</h2>
                        </div>

                        <div className="divide-y divide-white/5">
                            {rules.map((rule) => (
                                <div key={rule.id} className="py-8 first:pt-0 last:pb-0">
                                    <div className="flex items-start gap-6">
                                        <span className="text-2xl font-black text-zinc-700 italic">{rule.id}.</span>
                                        <div className="space-y-4">
                                            <h4 className="text-xl font-bold text-white">{rule.title}</h4>
                                            <p className="text-zinc-400 leading-relaxed font-medium">{rule.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </main>
        </>
    );
}
