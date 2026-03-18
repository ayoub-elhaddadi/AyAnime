"use client";

import { motion } from "framer-motion";
import { Mail, MessageCircle, X, Send, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
    return (
        <>
            <main className="container mt-30 mx-auto max-w-5xl px-4 py-20 relative overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 space-y-16"
                >
                    {/* Header Section */}
                    <div className="text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-5xl font-black tracking-tighter text-white sm:text-7xl uppercase italic bg-gradient-to-r from-white via-white/80 to-zinc-500 bg-clip-text text-transparent">
                                How can we help?
                            </h1>
                        </motion.div>
                        <p className="max-w-2xl mx-auto text-lg text-zinc-400 leading-relaxed">
                            Need assistance with your account or found a glitch in the Matrix? Our crew is standing by to help you navigate the Verse.
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-12">
                        {/* Contact Form with Glassmorphism */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative space-y-8 rounded-[2rem] bg-zinc-900/40 backdrop-blur-2xl border border-white/10 p-8 sm:p-12 shadow-2xl">
                                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold text-white tracking-tight">Send us a message</h2>
                                        <div className="flex items-center gap-2 text-zinc-500">
                                            <Clock size={14} className="text-primary" />
                                            <p className="text-sm">Response time: Typically within 24 hours.</p>
                                        </div>
                                    </div>
                                    <span className="hidden sm:block h-px flex-1 bg-white/5 mb-2 mx-4" />
                                </div>

                                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Your Name</label>
                                            <Input placeholder="E.g. Tanjiro Kamado" className="h-14 bg-black/40 border-white/5 rounded-2xl focus:border-primary/50 focus:ring-primary/20 transition-all text-base" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Email Address</label>
                                            <Input placeholder="your@email.com" type="email" className="h-14 bg-black/40 border-white/5 rounded-2xl focus:border-primary/50 focus:ring-primary/20 transition-all text-base" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Topic</label>
                                        <div className="relative">
                                            <select className="appearance-none w-full h-14 rounded-2xl bg-black/40 border border-white/5 px-4 text-white focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all hover:bg-black/60 cursor-pointer">
                                                <option>Account Issue</option>
                                                <option>Streaming / Technical Problem</option>
                                                <option>Bugs / Feature Request</option>
                                                <option>Privacy / Legal</option>
                                                <option>Other</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                                <Send size={14} className="rotate-90" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Message</label>
                                        <Textarea placeholder="Tell us how we can help..." className="min-h-[180px] bg-black/40 border-white/5 rounded-2xl focus:border-primary/50 focus:ring-primary/20 transition-all resize-none text-base p-4" />
                                    </div>

                                    <button className="group relative w-full overflow-hidden rounded-[1.25rem] bg-primary px-8 py-5 font-black uppercase tracking-widest text-white transition-all hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        <div className="flex items-center justify-center gap-3 relative z-10">
                                            <Send size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                            <span>Dispatch Message</span>
                                        </div>
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Quick Connection Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { icon: Mail, label: "Email", info: "support@ayanime.com", color: "from-blue-500/20 to-cyan-500/20", borderColor: "hover:border-blue-500/50" },
                                { icon: MessageCircle, label: "Discord", info: "Join the Crew", color: "from-indigo-500/20 to-purple-500/20", borderColor: "hover:border-indigo-500/50" },
                                { icon: X, label: "Socials", info: "@AyAnime_HQ", color: "from-zinc-500/20 to-zinc-800/20", borderColor: "hover:border-white/30" }
                            ].map((card, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + (i * 0.1) }}
                                    className={`group relative p-6 rounded-2xl bg-zinc-900/30 border border-white/5 transition-all cursor-pointer ${card.borderColor}`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl`} />
                                    <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                                        <div className="p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                                            <card.icon size={22} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">{card.label}</p>
                                            <p className="text-sm font-bold text-white">{card.info}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </main>
        </>
    );
}
