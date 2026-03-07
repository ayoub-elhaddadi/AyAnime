"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { animeService } from "@/lib/jikan";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Star, Heart, BookmarkPlus, Share2, Send, MessageSquare, StickyNote, User, BookmarkCheck } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCollections } from "@/lib/hooks/useCollections";
import Link from "next/link";

export default function AnimeDetailsPage() {
    const { id } = useParams();
    const animeId = Number(id);
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const [noteContent, setNoteContent] = useState("");
    const [commentContent, setCommentContent] = useState("");
    const [activeTab, setActiveTab] = useState("overview");

    // Fetch Anime Details
    const { data: animeResp, isLoading: animeLoading } = useQuery({
        queryKey: ["anime", animeId],
        queryFn: () => animeService.getAnimeDetails(animeId),
        enabled: !!animeId,
    });

    const anime = animeResp?.data;

    const { isWatchlisted, isFavorited, toggleWatchlist, toggleFavorite, upsertAnime } = useCollections(animeId, anime);

    // Fetch Private Notes
    const { data: note } = useQuery({
        queryKey: ["note", animeId, user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("notes")
                .select("*")
                .eq("anime_id", animeId)
                .eq("user_id", user?.id as string)
                .single();
            if (error && error.code !== "PGRST116") throw error;
            return data;
        },
        enabled: !!user?.id && !!animeId,
    });

    // Fetch Comments
    const { data: comments } = useQuery({
        queryKey: ["comments", animeId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("comments")
                .select("*, profiles(*)")
                .eq("anime_id", animeId)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!animeId,
    });

    useEffect(() => {
        if (note) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setNoteContent(note.content);
        }
    }, [note]);

    // Mutations
    const upsertNote = useMutation({
        mutationFn: async (content: string) => {
            await upsertAnime();

            const { error } = await supabase
                .from("notes")
                .upsert({
                    anime_id: animeId,
                    user_id: user?.id as string,
                    content,
                    updated_at: new Date().toISOString(),
                });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["note", animeId, user?.id] });
        },
    });

    const postComment = useMutation({
        mutationFn: async (content: string) => {
            await upsertAnime();

            const { error } = await supabase
                .from("comments")
                .insert({
                    anime_id: animeId,
                    user_id: user?.id as string,
                    content,
                });
            if (error) throw error;
        },
        onSuccess: () => {
            setCommentContent("");
            queryClient.invalidateQueries({ queryKey: ["comments", animeId] });
        },
    });

    if (animeLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!anime) return null;

    return (
        <main className="min-h-screen pb-20 overflow-x-hidden">
            <Navbar />

            {/* Header Banner */}
            <div className="relative h-[400px] w-full">
                <Image
                    src={anime.images.webp.large_image_url}
                    alt={anime.title}
                    fill
                    className="object-cover opacity-20 blur-sm"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </div>

            <div className="container mx-auto px-4 -mt-60 relative z-10 xl:px-20">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Poster & Actions */}
                    <div className="w-full md:w-72 shrink-0">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
                        >
                            <Image
                                src={anime.images.webp.large_image_url}
                                alt={anime.title}
                                fill
                                className="object-cover"
                            />
                        </motion.div>

                        <div className="mt-6 space-y-3">
                            <Button
                                className={cn(
                                    "w-full h-12 text-base rounded-lg gap-2 tracking-wide font-bold transition-all hover:cursor-pointer",
                                    isWatchlisted && "bg-zinc-800 border border-white/10 hover:bg-zinc-700 text-white"
                                )}
                                disabled={toggleWatchlist.isPending}
                                onClick={() => toggleWatchlist.mutate()}
                            >
                                {isWatchlisted ? <><BookmarkCheck size={20} className="text-primary" /> Watching</> : <><BookmarkPlus size={20} /> Add to Watchlist</>}
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "flex-1 bg-white/5 border-white/10 rounded-lg gap-2 transition-all hover:cursor-pointer",
                                        isFavorited && "bg-red-500/10 border-red-500/50 text-red-500"
                                    )}
                                    disabled={toggleFavorite.isPending}
                                    onClick={() => toggleFavorite.mutate()}
                                >
                                    <Heart size={18} className={isFavorited ? "fill-current" : ""} /> Favorite
                                </Button>
                                <Button variant="outline" size="icon" className="bg-white/5 border-white/10 rounded-lg hover:cursor-pointer">
                                    <Share2 size={18} />
                                </Button>
                            </div>
                        </div>

                        {/* Stats Sidebar */}
                        <div className="mt-8 rounded-xl bg-zinc-900/50 border border-white/5 p-4 space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-400">Score</span>
                                <div className="flex items-center gap-1 text-white font-bold">
                                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                    <span>{anime.score}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-400">Episodes</span>
                                <span className="text-white font-medium">{anime.episodes || "TBA"}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-400">Status</span>
                                <span className="text-white font-medium">{anime.status}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-400">Season</span>
                                <span className="text-white font-medium">{anime.season} {anime.year}</span>
                            </div>
                        </div>
                    </div>

                    {/* Info & Tabs */}
                    <div className="flex-1 pt-40 md:pt-60">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                                {anime.title}
                            </h1>
                            <p className="text-xl text-zinc-400 italic mb-6">{anime.title_japanese}</p>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {anime.genres.map(genre => (
                                    <span key={genre.mal_id} className="rounded-full bg-zinc-800 px-4 py-1.5 text-xs font-semibold text-zinc-300">
                                        {genre.name}
                                    </span>
                                ))}
                            </div>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="bg-transparent border-b border-white/5 w-full justify-start rounded-none h-12 p-0 gap-8">
                                    <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 text-base">Overview</TabsTrigger>
                                    <TabsTrigger value="discussions" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 text-base">Discussions</TabsTrigger>
                                    <TabsTrigger value="my-notes" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 text-base">My Notes</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="pt-6">
                                    <div className="prose prose-invert max-w-none">
                                        <h3 className="text-xl font-bold text-white mb-4">Synopsis</h3>
                                        <p className="text-zinc-400 leading-relaxed whitespace-pre-line text-lg mb-10">
                                            {anime.synopsis}
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h4 className="text-lg font-bold text-white uppercase tracking-wider text-xs">Background</h4>
                                                <p className="text-zinc-500 text-sm leading-relaxed">{anime.background || "No background information available."}</p>
                                            </div>
                                            <div className="space-y-4 text-sm">
                                                <h4 className="text-lg font-bold text-white uppercase tracking-wider text-xs">Information</h4>
                                                <div className="space-y-2">
                                                    <p><span className="text-zinc-500">Source:</span> <span className="text-zinc-300">{anime.source}</span></p>
                                                    <p><span className="text-zinc-500">Studio:</span> <span className="text-zinc-300">{anime.studios?.map(s => s.name).join(", ")}</span></p>
                                                    <p><span className="text-zinc-500">Rating:</span> <span className="text-zinc-300">{anime.rating}</span></p>
                                                    <p><span className="text-zinc-500">Duration:</span> <span className="text-zinc-300">{anime.duration}</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="discussions" className="pt-6">
                                    <div className="space-y-8">
                                        {user ? (
                                            <div className="flex gap-4 items-start">
                                                <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5">
                                                    <User size={20} className="text-zinc-500" />
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <Textarea
                                                        placeholder="Join the discussion..."
                                                        className="focus-visible:ring-primary"
                                                        value={commentContent}
                                                        onChange={(e) => setCommentContent(e.target.value)}
                                                    />
                                                    <div className="flex justify-end">
                                                        <Button
                                                            className="gap-2 px-6"
                                                            disabled={!commentContent.trim() || postComment.isPending}
                                                            onClick={() => postComment.mutate(commentContent)}
                                                        >
                                                            {postComment.isPending ? "Posting..." : <><Send size={16} /> Post Comment</>}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-zinc-900/50 rounded-xl p-8 text-center border border-white/5">
                                                <MessageSquare size={32} className="text-zinc-700 mx-auto mb-4" />
                                                <p className="text-zinc-400">Have something to say? Sign in to join the conversation.</p>
                                                <Button variant="outline" className="mt-4 border-primary/20 text-primary hover:bg-primary/5" asChild>
                                                    <Link href="/login">Sign In</Link>
                                                </Button>
                                            </div>
                                        )}

                                        <div className="space-y-6">
                                            {comments?.map(comment => (
                                                <div key={comment.id} className="flex gap-4 animate-in fade-in slide-in-from-top-4">
                                                    <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                                                        {comment.profiles.avatar_url ? (
                                                            <Image src={comment.profiles.avatar_url} alt={comment.profiles.username || ""} fill className="object-cover" />
                                                        ) : (
                                                            <span className="text-primary font-bold text-xs">{(comment.profiles.username || "U")[0].toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-white text-sm">{comment.profiles.username || "Anonymous User"}</span>
                                                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest bg-white/5 px-2 py-0.5 rounded">Member</span>
                                                            <span className="text-xs text-zinc-600 ml-auto">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-zinc-300 text-sm leading-relaxed bg-zinc-900/30 p-3 rounded-lg border border-white/5">
                                                            {comment.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            {comments?.length === 0 && (
                                                <div className="text-center py-10">
                                                    <p className="text-zinc-600">No comments yet. Be the first to start the discussion!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="my-notes" className="pt-6">
                                    {!user ? (
                                        <div className="bg-zinc-900/50 rounded-xl p-8 text-center border border-white/5">
                                            <StickyNote size={32} className="text-zinc-700 mx-auto mb-4" />
                                            <p className="text-zinc-400">Keep your own private thoughts about this anime. Sign in to start writing.</p>
                                            <Button variant="outline" className="mt-4 border-primary/20 text-primary hover:bg-primary/5" asChild>
                                                <Link href="/login">Sign In</Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 max-w-2xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                    <StickyNote size={20} className="text-primary" /> Private Notes
                                                </h3>
                                                <span className="text-xs text-zinc-500 italic">Only visible to you</span>
                                            </div>

                                            <div className="space-y-4">
                                                <Textarea
                                                    placeholder="Write your thoughts, reminders, or review for yourself..."
                                                    className="min-h-[200px] text-base focus-visible:ring-primary bg-zinc-900 tracking-wide leading-relaxed"
                                                    value={noteContent}
                                                    onChange={(e) => setNoteContent(e.target.value)}
                                                />
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-zinc-600">
                                                        Last saved: {note?.updated_at ? new Date(note.updated_at).toLocaleString() : "Never"}
                                                    </p>
                                                    <Button
                                                        className="px-8 shadow-lg shadow-primary/20"
                                                        disabled={upsertNote.isPending || !noteContent.trim() || noteContent === note?.content}
                                                        onClick={() => upsertNote.mutate(noteContent)}
                                                    >
                                                        {upsertNote.isPending ? "Saving..." : "Save Note"}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="rounded-xl border border-yellow-500/10 bg-yellow-500/5 p-4 text-sm text-yellow-200/60 leading-relaxed">
                                                Note: These notes are stored securely and are only accessible by your account. Perfect for tracking plot theories or personal ratings!
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </motion.div>
                    </div>

                </div>
            </div>
        </main>
    );
}

