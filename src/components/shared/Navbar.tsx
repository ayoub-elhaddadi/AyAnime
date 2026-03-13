"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, User, LogOut, Shield, Heart, Bookmark, LayoutGrid, LogIn, UserCircle2Icon, Loader2, Star } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { animeService } from "@/lib/api";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useRouter } from "next/navigation";

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, profile, signOut } = useAuthStore();
    const router = useRouter();

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const debouncedSearchQuery = useDebounce(searchQuery, 400);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Keyboard shortcut (Cmd/Ctrl + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Fetch Search Results
    const { data: searchResults, isLoading: searchLoading } = useQuery({
        queryKey: ["search", debouncedSearchQuery],
        queryFn: () => animeService.searchAnime({ keyword: debouncedSearchQuery, page: 1 }),
        enabled: debouncedSearchQuery.length > 1,
    });

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            document.removeEventListener("mousedown", handleClickOutside);
        }
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
                <div className="hidden md:flex relative flex-1 max-w-sm mx-8 transition-all duration-300 ease-out focus-within:max-w-xl" ref={searchRef}>
                    <div className="relative w-full group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors z-10" size={16} />
                        <Input
                            ref={inputRef}
                            placeholder="Search anime..."
                            className="bg-zinc-900/50 backdrop-blur-md border-white/10 h-10 rounded-full pl-10 pr-12 focus:bg-zinc-900 transition-all duration-300 focus:ring-2 focus:ring-primary/40 focus:border-primary/50 text-sm shadow-inner"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsDropdownOpen(true);
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && searchQuery.trim()) {
                                    setIsDropdownOpen(false);
                                    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                                }
                                if (e.key === 'Escape') {
                                    inputRef.current?.blur();
                                    setIsDropdownOpen(false);
                                }
                            }}
                        />
                        {!searchQuery && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1 opacity-100 transition-opacity group-focus-within:opacity-0">
                                <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-white/10 px-1.5 font-mono text-[10px] font-medium text-zinc-400 border border-white/10 shadow-sm">
                                    <span className="text-xs">⌘</span>K
                                </kbd>
                            </div>
                        )}
                        {searchQuery && (
                            <button
                                onClick={() => { setSearchQuery(""); setIsDropdownOpen(false); inputRef.current?.focus(); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-full p-1 transition-all cursor-pointer"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Search Dropdown */}
                    <AnimatePresence>
                        {isDropdownOpen && searchQuery.length > 2 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-[calc(100%+12px)] left-0 w-full min-w-[500px] bg-zinc-900/50 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden z-50 flex flex-col ring-1 ring-white/5"
                            >
                                <div className="p-3">
                                    {searchLoading ? (
                                        <div className="p-10 flex flex-col items-center justify-center text-zinc-500 space-y-3">
                                            <Loader2 size={24} className="animate-spin text-primary" />
                                            <span className="text-sm font-medium">Searching for &quot;{searchQuery}&quot;...</span>
                                        </div>
                                    ) : searchResults?.data?.response && searchResults.data.response.length > 0 ? (
                                        <div className="flex flex-col gap-1">
                                            {searchResults.data.response.slice(0, 4).map((anime) => (
                                                <Link
                                                    key={anime.id}
                                                    href={`/anime/${anime.id}`}
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-white/5 transition-all group relative overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="relative h-16 w-12 shrink-0 rounded-md overflow-hidden bg-zinc-900 border border-white/5">
                                                        <Image
                                                            src={anime.poster}
                                                            alt={anime.title}
                                                            fill
                                                            className="object-cover transition-transform group-hover:scale-110"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <h4 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                                                            {anime.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                                                            <span className="font-semibold text-zinc-400">{anime.type || 'TV'}</span>
                                                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                            <span className="flex items-center gap-1 text-yellow-500/80">
                                                                <Star size={10} className="fill-current" /> {anime.duration || '24m'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-12 flex flex-col items-center justify-center text-center">
                                            <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center mb-3 border border-white/5 shadow-inner">
                                                <Search size={20} className="text-zinc-500" />
                                            </div>
                                            <p className="text-zinc-400 font-medium text-sm">No results found for</p>
                                            <p className="text-white font-bold mt-1 max-w-[80%] truncate">&quot;{searchQuery}&quot;</p>
                                        </div>
                                    )}
                                </div>

                                {searchResults?.data?.response && searchResults.data.response.length > 4 && (
                                    <div className="bg-zinc-900/40 border-t border-white/5 p-2 backdrop-blur-md">
                                        <Link
                                            href={`/catalog?q=${encodeURIComponent(searchQuery)}`}
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-primary/90 hover:text-primary transition-all rounded-xl hover:bg-primary/10 group active:scale-[0.98]"
                                        >
                                            View all results
                                            <span className="group-hover:translate-x-1 transition-transform">
                                                <Search size={14} />
                                            </span>
                                        </Link>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                        className="lg:hidden p-2 text-zinc-300 transition-colors hover:text-white hover:cursor-pointer"
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
