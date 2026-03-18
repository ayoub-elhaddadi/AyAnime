"use client";

import { motion } from "framer-motion";

export default function TermsPage() {
    return (
        <>
            <main className="container mt-30 mx-auto max-w-4xl px-4 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-12"
                >
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
                            Terms of Service
                        </h1>
                        <p className="text-zinc-400">Last Updated: March 2026</p>
                    </div>

                    <div className="prose prose-invert max-w-none space-y-12">
                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                Welcome to AyAnime. By accessing or using our website, services, or mobile applications, you signify that you have read, understood, and agree to be bound by these Terms of Service.
                                If you do not agree to these terms, please do not use our service. We reserve the right to update or modify these terms at any time without prior notice. Your continued use of AyAnime after any changes indicates your acceptance of the new terms.
                            </p>
                            <ul className="list-disc space-y-2 pl-5 text-zinc-400 font-medium">
                                <li>Minimum age requirement is 13 years old.</li>
                                <li>You are responsible for maintaining account security.</li>
                                <li>Users must provide accurate registration information.</li>
                            </ul>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">2. User Conduct</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                AyAnime is a community-driven platform built on respect. Users are expected to behave professionally and avoid any behavior that could be considered harassment, bullying, or harmful to others.
                            </p>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {[
                                    "Spamming or botting",
                                    "Intellectual property theft",
                                    "Explicit adult content",
                                    "Hate speech or discrimination"
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-4">
                                        <div className="h-2 w-2 rounded-full bg-red-500" />
                                        <span className="text-sm font-medium text-zinc-300">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">3. Content Ownership</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                You retain ownership of the content you post on AyAnime. However, by posting content, you grant AyAnime a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute such content in any and all media.
                                You represent and warrant that you have all the rights, power, and authority necessary to grant the rights granted herein to any content that you submit.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">4. Privacy Policy</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                Your privacy is important to us. Our Privacy Policy describes how we handle the information you provide to us when you use AyAnime. You understand that through your use of the services you consent to the collection and use of this information.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">5. Termination</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                We may terminate or suspend your access to AyAnime immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                                Upon termination, your right to use the Service will immediately cease. All provisions of the Terms which by their nature should survive termination shall survive termination, including ownership provisions, warranty disclaimers, indemnity and limitations of liability.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </main>
        </>
    );
}
