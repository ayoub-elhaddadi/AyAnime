"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, HelpCircle, MessageSquare, Shield, Zap } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const faqs = [
        {
            category: "Account & Profile",
            icon: Shield,
            items: [
                {
                    q: "How do I recover my account?",
                    a: "You can recover your account by clicking 'Forgot Password' on the login page. We'll send a password reset link to your registered email address. If you no longer have access to that email, please contact our support team."
                },
                {
                    q: "Can I change my username?",
                    a: "Currently, usernames can only be changed once every 30 days. You can find this option in your Profile Settings under the 'Account' tab."
                },
                {
                    q: "How do I make my watchlists private?",
                    a: "By default, your watchlists are public. You can toggle your profile privacy in Settings > Privacy to 'Private' or 'Friends Only'."
                }
            ]
        },
        {
            category: "Streaming & Content",
            icon: Zap,
            items: [
                {
                    q: "Why am I experiencing streaming quality issues?",
                    a: "Streaming quality usually depends on your internet connection. Try lowering the resolution in the player settings or clearing your browser cache. Our mechas also recommend disabling VPNs for the best experience."
                },
                {
                    q: "Does AyAnime support offline viewing?",
                    a: "Offline viewing is currently available on our mobile applications for Premium members. You can download episodes while connected to Wi-Fi to watch later."
                },
                {
                    q: "How often are new episodes updated?",
                    a: "We sync with the latest releases in Japan. Typically, new episodes appear on AyAnime within 1-2 hours of their original broadcast."
                }
            ]
        },
        {
            category: "Community & Policy",
            icon: MessageSquare,
            items: [
                {
                    q: "How do I report a spoiler?",
                    a: "Use the 'Report' flag icon on any comment or post that contains unhidden spoilers. Our moderation team reviews these reports 24/7."
                },
                {
                    q: "What happens if I break the Community Guidelines?",
                    a: "Minor violations result in a warning. Serious or repeat offenses can lead to temporary suspensions or permanent bans from AyAnime."
                }
            ]
        }
    ];

    const filteredFaqs = faqs.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

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
                    <div className="space-y-6 text-center">
                        <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl italic uppercase">
                            Help Center
                        </h1>
                        <p className="mx-auto max-w-xl text-lg text-zinc-400">
                            Looking for answers? Explore our common topics or use the search bar to find what you need.
                        </p>

                        <div className="relative mx-auto max-w-lg">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search for questions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-2xl bg-white/5 border border-white/10 py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-12">
                        {filteredFaqs.map((category) => (
                            <div key={category.category} className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <category.icon className="text-primary" size={24} />
                                    <h2 className="text-2xl font-bold text-white tracking-tight">{category.category}</h2>
                                </div>
                                <div className="space-y-4">
                                    {category.items.map((item) => (
                                        <FAQItem key={item.q} question={item.q} answer={item.a} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-3xl bg-primary/10 border border-primary/20 p-8 text-center sm:p-12">
                        <HelpCircle className="mx-auto mb-6 text-primary" size={48} />
                        <h3 className="mb-4 text-2xl font-bold text-white tracking-tight">Still have questions?</h3>
                        <p className="mb-8 text-zinc-400">Our support team is available 24/7 to help you with any issues.</p>
                        <a
                            href="/contact"
                            className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:scale-105 active:scale-95 hover:cursor-pointer"
                        >
                            Contact Support
                        </a>
                    </div>
                </motion.div>
            </main>
        </>
    );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="rounded-2xl bg-white/5 border border-white/10 transition-all hover:border-white/20">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between p-6 text-left hover:cursor-pointer"
            >
                <span className="text-lg font-bold text-white tracking-tight">{question}</span>
                <ChevronDown
                    className={`text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    size={20}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-0 text-zinc-400 leading-relaxed font-medium border-t border-white/5 mt-2">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
