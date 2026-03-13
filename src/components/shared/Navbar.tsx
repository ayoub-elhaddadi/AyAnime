"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, User, LogOut, Shield, Heart, Bookmark, LayoutGrid, LogIn, UserPlus, User2Icon, UserCircle2Icon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, profile, signOut } = useAuthStore();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Browse", href: "/catalog", icon: <LayoutGrid size={18} /> },
        { name: "Watchlist", href: "/watchlist", icon: <Bookmark size={18} /> },
        { name: "Favorites", href: "/favorites", icon: <Heart size={18} /> },
    ];

    return (
        <nav
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300 xl:px-20",
                isScrolled
                    ? "bg-zinc-950/80 py-3 backdrop-blur-xl border-b border-white/5 shadow-2xl"
                    : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto flex items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
                    <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                        <span className="text-xl font-black text-white italic">A</span>
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white hidden sm:block">
                        Ay<span className="text-primary">Anime</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-8 ml-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="group flex items-center gap-2 text-sm font-semibold text-zinc-400 transition-colors hover:text-white"
                        >
                            <span className="text-zinc-600 transition-colors group-hover:text-primary">
                                {link.icon}
                            </span>
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Search Bar - Desktop */}
                <div className="hidden md:flex relative flex-1 max-w-sm mx-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <Input
                        placeholder="Search anime..."
                        className="pl-10 bg-white/5 border-white/5 h-10 rounded-full focus:bg-white/10"
                    />
                </div>

                {/* User Actions */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            {profile?.role === "admin" && (
                                <Link href="/admin">
                                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-primary hover:bg-primary/10 rounded-full">
                                        <Shield size={20} />
                                    </Button>
                                </Link>
                            )}
                            <Link
                                href={`/profile/${profile?.username || user.id}`}
                                className="group flex items-center gap-0 overflow-hidden rounded-full bg-white/5 p-1 ring-1 ring-white/10 hover:ring-primary/50 transition-all duration-300"
                            >
                                <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center transition-colors group-hover:bg-zinc-700">
                                    {profile?.avatar_url ? (
                                        <Image src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover rounded-full" width={32} height={32} />
                                    ) : (
                                        <User size={18} className="text-primary" />
                                    )}
                                </div>
                                <span className="max-w-0 opacity-0 overflow-hidden whitespace-nowrap text-xs font-bold text-zinc-300 transition-all duration-300 group-hover:max-w-[70px] group-hover:opacity-100 group-hover:px-2">
                                    Profile
                                </span>
                            </Link>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => signOut()}
                                className="group h-10 px-3 flex items-center gap-0 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all duration-300 cursor-pointer overflow-hidden border border-transparent hover:border-red-500/20"
                            >
                                <LogOut size={18} />
                                <span className="max-w-0 opacity-0 overflow-hidden whitespace-nowrap text-xs font-bold transition-all duration-300 group-hover:max-w-[70px] group-hover:opacity-100 group-hover:ml-2">
                                    Logout
                                </span>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20 gap-2">
                                <Link href="/login">
                                    <UserCircle2Icon size={18} />
                                    Sign In
                                </Link>
                            </Button>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden p-2 text-zinc-300 transition-colors hover:text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="lg:hidden absolute top-full left-0 w-full bg-zinc-950 border-b border-white/5 py-6 px-4 space-y-4 shadow-2xl"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 text-zinc-300 font-semibold"
                            >
                                <span className="text-primary">{link.icon}</span>
                                {link.name}
                            </Link>
                        ))}
                        {!user && (
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <Button variant="outline" asChild onClick={() => setIsMobileMenuOpen(false)} className="gap-2">
                                    <Link href="/login">
                                        <LogIn size={18} />
                                        Login
                                    </Link>
                                </Button>
                                <Button asChild onClick={() => setIsMobileMenuOpen(false)} className="gap-2">
                                    <Link href="/signup">
                                        <User size={18} />
                                        Sign Up
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
