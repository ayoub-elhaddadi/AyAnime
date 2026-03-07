"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { animeService } from "@/lib/jikan";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { Star, Heart, BookmarkPlus, Send, MessageSquare, StickyNote, User, BookmarkCheck, ThumbsUp, Reply, Trash2, X, Edit2, PlayCircle } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { useCollections } from "@/lib/hooks/useCollections";
import Link from "next/link";
import { ShareMenu } from "@/components/shared/ShareMenu";
import { TrailerModal } from "@/components/shared/TrailerModal";

interface Comment {
    id: string;
    content: string;
    user_id: string;
    parent_id: string | null;
    created_at: string;
    updated_at?: string;
    profiles: {
        id: string;
        username: string | null;
        avatar_url: string | null;
        role?: string | null;
    };
    comment_likes: { user_id: string }[];
    replies: Comment[];
}

export default function AnimeDetailsPage() {
    const { id } = useParams();
    const animeId = Number(id);
    const { user, profile } = useAuthStore();
    const queryClient = useQueryClient();

    const [commentContent, setCommentContent] = useState("");
    const [replyingTo, setReplyingTo] = useState<{ id: string, username: string } | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);

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
            return data as { id: string; content: string; updated_at?: string } | null;
        },
        enabled: !!animeId && !!user,
    });

    const [noteContent, setNoteContent] = useState(note?.content || "");

    // Fetch Comments
    const { data: comments } = useQuery({
        queryKey: ["comments", animeId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("comments")
                .select("*, profiles!comments_user_id_fkey(*), comment_likes(*)")
                .eq("anime_id", animeId)
                .order("created_at", { ascending: true });
            if (error) throw error;
            return data as unknown as Comment[];
        },
        enabled: !!animeId,
    });

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
                    parent_id: replyingTo?.id || null,
                });
            if (error) throw error;
        },
        onSuccess: () => {
            setCommentContent("");
            setReplyingTo(null);
            queryClient.invalidateQueries({ queryKey: ["comments", animeId] });
        },
    });

    const toggleLike = useMutation({
        mutationFn: async ({ commentId, isLiked }: { commentId: string, isLiked: boolean }) => {
            if (isLiked) {
                const { error } = await supabase
                    .from("comment_likes")
                    .delete()
                    .eq("comment_id", commentId)
                    .eq("user_id", user?.id as string);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("comment_likes")
                    .insert({ comment_id: commentId, user_id: user?.id as string });
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", animeId] });
        }
    });

    const deleteComment = useMutation({
        mutationFn: async (commentId: string) => {
            const { error } = await supabase
                .from("comments")
                .delete()
                .eq("id", commentId)
                .eq("user_id", user?.id as string);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", animeId] });
        }
    });

    const editComment = useMutation({
        mutationFn: async ({ commentId, content }: { commentId: string, content: string }) => {
            const { error } = await supabase
                .from("comments")
                .update({ content })
                .eq("id", commentId)
                .eq("user_id", user?.id as string);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", animeId] });
        }
    });

    const structuredComments = useMemo(() => {
        if (!comments) return [];
        const map = new Map<string, Comment>();
        comments.forEach(c => map.set(c.id, { ...c, replies: [] } as Comment));
        const roots: Comment[] = [];
        comments.forEach(c => {
            const commentObj = map.get(c.id);
            if (!commentObj) return;

            if (c.parent_id) {
                const parent = map.get(c.parent_id);
                if (parent) {
                    parent.replies.push(commentObj);
                }
            } else {
                roots.push(commentObj);
            }
        });
        return roots.reverse();
    }, [comments]);

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
                                <ShareMenu title={anime?.title || "Anime"} />
                            </div>
                        </div>

                        {/* Watch Trailer Button */}
                        {anime.trailer?.embed_url && (
                            <Button
                                variant="outline"
                                className="w-full h-10 gap-2 bg-white/5 border-white/10 hover:bg-white/10 hover:cursor-pointer text-white mt-3"
                                onClick={() => setIsTrailerOpen(true)}
                            >
                                <PlayCircle size={18} className="text-red-500" /> Watch Trailer
                            </Button>
                        )}

                        {/* Trailer Modal */}
                        {anime.trailer?.embed_url && (
                            <TrailerModal
                                isOpen={isTrailerOpen}
                                onClose={() => setIsTrailerOpen(false)}
                                embedUrl={anime.trailer.embed_url}
                                title={anime.title}
                            />
                        )}


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
                                            <div className="space-y-4 text-sm">
                                                <h4 className="text-lg font-bold text-white uppercase tracking-wider text-xs">Information</h4>
                                                <div className="space-y-2">
                                                    <p><span className="text-zinc-500">Source:</span> <span className="text-zinc-300">{anime.source}</span></p>
                                                    <p><span className="text-zinc-500">Studio:</span> <span className="text-zinc-300">{anime.studios?.map(s => s.name).join(", ")}</span></p>
                                                    <p><span className="text-zinc-500">Rating:</span> <span className="text-zinc-300">{anime.rating}</span></p>
                                                    <p><span className="text-zinc-500">Duration:</span> <span className="text-zinc-300">{anime.duration}</span></p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-lg font-bold text-white uppercase tracking-wider text-xs">Background</h4>
                                                <p className="text-zinc-500 text-sm leading-relaxed">{anime.background || "No background information available."}</p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="discussions" className="pt-6">
                                    <div className="space-y-8">
                                        <div className="space-y-6">
                                            {structuredComments?.map(comment => (
                                                <CommentThread
                                                    key={comment.id}
                                                    comment={comment}
                                                    user={user}
                                                    onReply={(id: string, username: string) => { setReplyingTo({ id, username }); setActiveTab("discussions"); document.getElementById("comment-box")?.focus(); }}
                                                    onToggleLike={(id: string, isLiked: boolean) => toggleLike.mutate({ commentId: id, isLiked })}
                                                    onEdit={(id: string, content: string) => editComment.mutate({ commentId: id, content })}
                                                    onDelete={(id: string) => deleteComment.mutate(id)}
                                                    toggleLikeLoading={toggleLike.isPending}
                                                    editLoading={editComment.isPending}
                                                    deleteLoading={deleteComment.isPending}
                                                />
                                            ))}
                                            {structuredComments?.length === 0 && (
                                                <div className="text-center py-10 border border-white/5 rounded-xl bg-white/5">
                                                    <MessageSquare size={32} className="text-zinc-700 mx-auto mb-4" />
                                                    <p className="text-zinc-400">No comments yet. Be the first to start the discussion!</p>
                                                </div>
                                            )}
                                        </div>

                                        {user ? (
                                            <div className="flex gap-4 items-start flex-col sm:flex-row">
                                                <div className="hidden sm:flex h-10 w-10 shrink-0 rounded-full bg-zinc-800 items-center justify-center border border-white/5 relative overflow-hidden">
                                                    {profile?.avatar_url ? (
                                                        <Image src={profile.avatar_url} alt={profile.username || ""} fill className="object-cover" />
                                                    ) : (
                                                        <User size={20} className="text-zinc-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-3 w-full">
                                                    {replyingTo && (
                                                        <div className="flex items-center justify-between bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-zinc-300">
                                                            <span className="flex items-center gap-2 relative z-10">
                                                                <Reply size={14} className="text-primary z-10" />
                                                                <span className="z-10">Replying to <span className="font-bold text-white relative z-10">{replyingTo.username}</span></span>
                                                            </span>
                                                            <button onClick={() => setReplyingTo(null)} className="text-zinc-500 hover:text-white hover:cursor-pointer transition-colors z-10 relative">
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <Textarea
                                                        id="comment-box"
                                                        placeholder={replyingTo ? "Write your reply..." : "Join the discussion..."}
                                                        className="focus-visible:ring-primary min-h-[100px]"
                                                        value={commentContent}
                                                        onChange={(e) => setCommentContent(e.target.value)}
                                                    />
                                                    <div className="flex justify-end">
                                                        <Button
                                                            className="gap-2 px-6 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:cursor-pointer"
                                                            disabled={!commentContent.trim() || postComment.isPending}
                                                            onClick={() => postComment.mutate(commentContent)}
                                                        >
                                                            {postComment.isPending ? "Posting..." : <><Send size={16} /> {replyingTo ? "Reply" : "Post Comment"}</>}
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

interface AuthUser {
    id: string;
    email?: string;
}

interface CommentThreadProps {
    comment: Comment;
    user: AuthUser | null;
    onReply: (id: string, username: string) => void;
    onToggleLike: (commentId: string, isLiked: boolean) => void;
    onEdit: (commentId: string, content: string) => void;
    onDelete: (commentId: string) => void;
    toggleLikeLoading: boolean;
    editLoading: boolean;
    deleteLoading: boolean;
}

// Comment Thread Component
const CommentThread = ({ comment, user, onReply, onToggleLike, onEdit, onDelete, toggleLikeLoading, editLoading, deleteLoading }: CommentThreadProps) => {
    const isLiked = !!(user && comment.comment_likes?.some((l) => l.user_id === user.id));
    const likeCount = comment.comment_likes?.length || 0;
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);

    // Automatically focus when edit mode is triggered
    const editInputRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (isEditing) {
            editInputRef.current?.focus();
            const length = editInputRef.current?.value.length || 0;
            editInputRef.current?.setSelectionRange(length, length);
        }
    }, [isEditing]);

    // Reset edit content if the comment is being updated from elsewhere while not in active manual edit
    // Note: To avoid cascading render warning in React, we track if we are currently focused.
    // However, a cleaner way is to simply remove the useEffect which triggers on every comment content update.
    // Instead, we will rely on handleSaveEdit and the fact that editContent is initialized with comment.content.

    const handleSaveEdit = () => {
        if (!editContent.trim() || editContent === comment.content) {
            setIsEditing(false);
            setEditContent(comment.content); // Reset just in case
            return;
        }
        onEdit(comment.id, editContent);
        setIsEditing(false); // Optimistically close
    };

    return (
        <div className="flex gap-4 animate-in fade-in slide-in-from-top-4 relative">
            <div className="relative h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden z-20">
                {comment.profiles.avatar_url ? (
                    <Image src={comment.profiles.avatar_url} alt={comment.profiles.username || ""} fill className="object-cover" />
                ) : (
                    <span className="text-primary font-bold text-xs">{(comment.profiles.username || "U")[0].toUpperCase()}</span>
                )}
            </div>
            <div className="flex-1 relative z-20">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-white text-sm">{comment.profiles.username || "Anonymous User"}</span>
                    {comment.profiles.role === 'admin' ? (
                        <span className="text-[10px] text-primary uppercase font-bold tracking-widest bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">Admin</span>
                    ) : (
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest bg-white/5 px-2 py-0.5 rounded">Member</span>
                    )}
                    <span className="text-xs text-zinc-600 ml-auto flex items-center gap-2">
                        {comment.updated_at && comment.updated_at !== comment.created_at && <span className="italic">(edited)</span>}
                        {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                </div>
                {isEditing ? (
                    <div className="space-y-2 mt-2">
                        <Textarea
                            ref={editInputRef}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="bg-zinc-900/60 border-primary/30 min-h-[80px]"
                        />
                        <div className="flex items-center gap-2 justify-end">
                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white" onClick={() => { setIsEditing(false); setEditContent(comment.content); }} disabled={editLoading}>Cancel</Button>
                            <Button size="sm" onClick={handleSaveEdit} disabled={!editContent.trim() || editContent === comment.content || editLoading}>{editLoading ? "Saving..." : "Save"}</Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-zinc-300 text-sm leading-relaxed bg-zinc-900/40 backdrop-blur-md p-3 rounded-lg border border-white/5 whitespace-pre-line break-words">
                        {comment.content}
                    </p>
                )}

                {/* Actions */}
                {!isEditing && (
                    <div className="flex items-center gap-4 mt-2">
                        <button
                            title="Like Comment"
                            onClick={() => onToggleLike(comment.id, isLiked)}
                            disabled={!user || toggleLikeLoading}
                            className={cn("flex items-center gap-1.5 text-xs font-semibold hover:cursor-pointer transition-colors", isLiked ? "text-primary hover:text-primary/80" : "text-zinc-500 hover:text-zinc-300")}
                        >
                            <ThumbsUp size={14} className={isLiked ? "fill-current" : ""} /> {likeCount > 0 && likeCount}
                        </button>
                        {user && (
                            <button
                                onClick={() => onReply(comment.id, comment.profiles.username || 'Anonymous User')}
                                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 hover:cursor-pointer transition-colors"
                            >
                                <Reply size={14} /> Reply
                            </button>
                        )}
                        {user?.id === comment.user_id && (
                            <div className="flex items-center gap-3 ml-auto">
                                <button title="Edit Comment" onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 hover:cursor-pointer transition-colors">
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    title="Delete Comment"
                                    onClick={() => setIsDeleteOpen(true)}
                                    disabled={deleteLoading}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-red-500/70 hover:text-red-500 hover:cursor-pointer transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )}

                        {/* Delete Confirmation Dialog */}
                        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                            <AlertDialogContent className="bg-zinc-950 border-white/10 max-w-md">
                                <AlertDialogHeader>
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="h-10 w-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                            <Trash2 size={18} className="text-red-500" />
                                        </div>
                                        <AlertDialogTitle className="text-white text-lg">Delete Comment</AlertDialogTitle>
                                    </div>
                                    <AlertDialogDescription className="text-zinc-400 py-5">
                                        Are you sure you want to delete this comment? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-2 mt-2">
                                    <button
                                        onClick={() => setIsDeleteOpen(false)}
                                        className="px-4 py-2 rounded-md text-sm font-medium text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors hover:cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => { onDelete(comment.id); setIsDeleteOpen(false); }}
                                        disabled={deleteLoading}
                                        className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors hover:cursor-pointer"
                                    >
                                        {deleteLoading ? "Deleting..." : "Delete"}
                                    </button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}

                {/* Replies */}
                {comment.replies?.length > 0 && (
                    <div className="mt-4 space-y-4 border-l-2 border-white/5 pl-4 relative">
                        {comment.replies.map((reply) => (
                            <CommentThread
                                key={reply.id}
                                comment={reply}
                                user={user}
                                onReply={onReply}
                                onToggleLike={onToggleLike}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                toggleLikeLoading={toggleLikeLoading}
                                editLoading={editLoading}
                                deleteLoading={deleteLoading}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

