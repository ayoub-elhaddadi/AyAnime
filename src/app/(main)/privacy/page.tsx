"use client";

import { Navbar } from "@/components/shared/Navbar";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, CheckCircle2 } from "lucide-react";

export default function PrivacyPage() {
    return (
        <>
            <Navbar />
            <main className="container mt-30 mx-auto max-w-4xl px-4 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-12"
                >
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
                            Privacy Policy
                        </h1>
                    </div>

                    <div className="prose prose-invert max-w-none space-y-12">
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                    <Shield size={20} />
                                </div>
                                <h2 className="text-2xl font-bold text-white m-0">1. Data Collection</h2>
                            </div>
                            <p className="text-zinc-400 leading-relaxed">
                                We collect information you provide directly to us when you interact with the AyAnime platform. This includes:
                            </p>
                            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 list-none p-0">
                                {[
                                    { title: "Account Info", detail: "Username, email, and encrypted password." },
                                    { title: "Profile Content", detail: "Watchlists, ratings, reviews, and posts." },
                                    { title: "Preferences", detail: "Genre interests and notification settings." },
                                    { title: "Communication", detail: "Records of support team correspondence." }
                                ].map((item) => (
                                    <li key={item.title} className="rounded-xl bg-white/5 border border-white/10 p-5">
                                        <span className="block font-bold text-white mb-1">{item.title}</span>
                                        <span className="text-sm text-zinc-500">{item.detail}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                    <Eye size={20} />
                                </div>
                                <h2 className="text-2xl font-bold text-white m-0">2. Cookies and Tracking</h2>
                            </div>
                            <p className="text-zinc-400 leading-relaxed">
                                AyAnime uses cookies and similar tracking technologies to track activity on our service and hold certain information. We use these tools to:
                            </p>
                            <div className="space-y-3">
                                {[
                                    "Keep you signed in across different sessions.",
                                    "Understand how you use our platform to improve experience.",
                                    "Remember your viewing preferences (e.g., dark mode, language).",
                                    "Deliver personalized anime recommendations based on history."
                                ].map((item) => (
                                    <div key={item} className="flex items-start gap-3">
                                        <CheckCircle2 size={18} className="text-primary mt-1 flex-shrink-0" />
                                        <span className="text-zinc-400 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                    <Lock size={20} />
                                </div>
                                <h2 className="text-2xl font-bold text-white m-0">3. User Rights</h2>
                            </div>
                            <p className="text-zinc-400 leading-relaxed">
                                Depending on your location (e.g., GDPR in Europe or CCPA in California), you may have certain rights regarding your personal data:
                            </p>
                            <ul className="list-disc space-y-2 pl-5 text-zinc-400 font-medium">
                                <li>Access: You can request a copy of the data we hold about you.</li>
                                <li>Rectification: You can ask us to correct inaccurate or incomplete data.</li>
                                <li>Erasure: You can request that we delete your personal data.</li>
                                <li>Portability: You can request a transfer of your data to another service.</li>
                            </ul>
                            <div className="rounded-2xl bg-primary/10 border border-primary/20 p-6 text-center">
                                <p className="text-sm text-zinc-300">
                                    To exercise any of these rights, please contact our privacy officer at <a href="mailto:privacy@ayanime.com" className="text-primary font-bold hover:underline">privacy@ayanime.com</a>
                                </p>
                            </div>
                        </section>
                    </div>
                </motion.div>
            </main>
        </>
    );
}
