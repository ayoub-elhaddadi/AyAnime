"use client";

import { motion } from "framer-motion";
import { Mail, MessageSquare, X, MessageCircle, Send, MapPin, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/shared/Navbar";

export default function ContactPage() {
    return (
        <>
            <Navbar />
            <main className="container mt-30 mx-auto max-w-4xl px-4 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-16"
                >
                    {/* Header Section */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl uppercase italic">
                            How can we help?
                        </h1>
                        <p className="max-w-xl mx-auto text-lg text-zinc-400">
                            Get in touch with our support crew or browse common topics below. We&apos;re here to ensure your journey through the Verse is seamless.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                        {/* Contact Form */}
                        <div className="lg:col-span-2 space-y-8 rounded-3xl bg-zinc-900/50 border border-white/5 p-8 sm:p-12">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-white tracking-tight">Send us a message</h2>
                                <p className="text-sm text-zinc-500">Response time: Typically within 24 hours.</p>
                            </div>

                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Your Name</label>
                                        <Input placeholder="E.g. Tanjiro Kamado" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                                        <Input placeholder="your@email.com" type="email" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Topic</label>
                                    <select className="w-full rounded-2xl bg-black border border-white/10 px-4 py-4 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all">
                                        <option>Account Issue</option>
                                        <option>Streaming / Technical Problem</option>
                                        <option>Bugs / Feature Request</option>
                                        <option>Privacy / Legal</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Message</label>
                                    <Textarea placeholder="Tell us how we can help..." className="min-h-[200px]" />
                                </div>

                                <button className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] hover:cursor-pointer">
                                    <Send size={18} />
                                    Dispatch Message
                                </button>
                            </form>
                        </div>

                        {/* Support Sidebar */}
                        <div className="space-y-8">
                            {/* Quick Connection */}
                            <div className="space-y-6 rounded-3xl bg-white/5 border border-white/10 p-8">
                                <h3 className="text-xl font-bold text-white tracking-tight">Connect With Us</h3>
                                <div className="space-y-4">
                                    <LinkCard icon={MessageCircle} title="Live Chat" detail="Instant assistance" color="bg-green-500" />
                                    <LinkCard icon={X} title="X" detail="@AyAnimeSupport" color="bg-blue-400" />
                                    <LinkCard icon={MessageSquare} title="Discord" detail="Join the community" color="bg-indigo-500" />
                                    <LinkCard icon={Mail} title="Email" detail="support@ayanime.com" color="bg-primary" />
                                </div>
                            </div>

                            {/* Office Info */}
                            <div className="space-y-6 rounded-3xl bg-zinc-950 border border-white/5 p-8">
                                <h3 className="text-xl font-bold text-white tracking-tight">Main Hub</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <MapPin className="text-primary mt-1 shrink-0" size={18} />
                                        <div>
                                            <p className="text-sm font-bold text-white">Shibuya, Tokyo</p>
                                            <p className="text-xs text-zinc-500">Multiverse Sector 7, Neo Japan</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Clock className="text-primary mt-1 shrink-0" size={18} />
                                        <div>
                                            <p className="text-sm font-bold text-white">Office Hours</p>
                                            <p className="text-xs text-zinc-500">24/7 Digital Operations</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </>
    );
}

function LinkCard({ icon: Icon, title, detail, color }: { icon: React.ElementType, title: string, detail: string, color: string }) {
    return (
        <a href="#" className="flex items-center gap-4 group">
            <div className={`h-10 w-10 rounded-xl ${color}/20 flex items-center justify-center text-white transition-transform group-hover:scale-110`}>
                <Icon size={18} className={color.replace('bg-', 'text-')} />
            </div>
            <div>
                <p className="text-sm font-bold text-white leading-none mb-1">{title}</p>
                <p className="text-xs text-zinc-500 italic">{detail}</p>
            </div>
        </a>
    );
}
