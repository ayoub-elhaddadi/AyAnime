"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Youtube, Instagram, Github } from "lucide-react";

export const Footer = () => {
    const pathname = usePathname();
    const currentYear = new Date().getFullYear();

    if (pathname === "/maintenance") return null;

    const footerLinks = {
        explore: [
            { name: "Browse Catalog", href: "/catalog" },
            { name: "Watchlist", href: "/watchlist" },
            { name: "Favorites", href: "/favorites" },
            { name: "Seasonal Anime", href: "/catalog?season=spring" },
        ],
        community: [
            { name: "Forum", href: "#" },
            { name: "Clubs", href: "#" },
            { name: "Discord", href: "#" },
            { name: "Events", href: "#" },
        ],
        support: [
            { name: "Terms of Service", href: "/terms" },
            { name: "Privacy Policy", href: "/privacy" },
            { name: "Contact Us", href: "/contact" },
            { name: "Community Guidelines", href: "/community-guidelines" },
        ],
        socials: [
            { Icon: X, href: "#" },
            { Icon: Instagram, href: "#" },
            { Icon: Youtube, href: "#" },
            { Icon: Github, href: "#" }
        ]
    };

    return (
        <footer className="mt-auto border-t border-white/5 bg-zinc-950 pt-16 pb-8 xl:px-20">
            <div className="container mx-auto px-4">
                <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-8">
                    {/* Brand Section */}
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-6 lg:max-w-xs">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                                <span className="text-2xl font-black text-white italic">A</span>
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white">
                                Ay<span className="text-primary">Anime</span>
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed text-zinc-400">
                            Your ultimate portal to the world of anime. Discover, track, and discuss your favorite series with a passionate community.
                        </p>
                        <div className="flex items-center gap-4">
                            {footerLinks.socials.map(({ Icon, href }, i) => (
                                <Link
                                    key={i}
                                    href={href}
                                    className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 transition-all hover:bg-primary hover:text-white hover:scale-110 active:scale-95"
                                >
                                    <Icon size={18} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections - 2 columns on mobile, 3 on lg */}
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-16">
                        <div>
                            <h4 className="mb-6 text-xs font-black uppercase tracking-[0.2em] text-primary">Explore</h4>
                            <ul className="space-y-4">
                                {footerLinks.explore.map((link) => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-sm text-zinc-400 transition-all hover:text-white hover:translate-x-1 inline-block">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="mb-6 text-xs font-black uppercase tracking-[0.2em] text-primary">Community</h4>
                            <ul className="space-y-4">
                                {footerLinks.community.map((link) => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-sm text-zinc-400 transition-all hover:text-white hover:translate-x-1 inline-block">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <h4 className="mb-6 text-xs font-black uppercase tracking-[0.2em] text-primary">Support</h4>
                            <ul className="space-y-4">
                                {footerLinks.support.map((link) => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-sm text-zinc-400 transition-all hover:text-white hover:translate-x-1 inline-block">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 md:flex-row">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                        © {currentYear} AyAnime. Built for fans by fans.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="text-xs text-zinc-500 hover:text-primary transition-colors">Privacy</Link>
                        <Link href="/terms" className="text-xs text-zinc-500 hover:text-primary transition-colors">Terms</Link>
                        <Link href="/faq" className="text-xs text-zinc-500 hover:text-primary transition-colors">FAQ</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
