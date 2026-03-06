"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Shield, Camera, Save, ArrowLeft, Loader2 } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function SettingsPage() {
    const { user, profile, fetchProfile } = useAuthStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        bio: "",
        avatar_url: "",
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                username: profile.username || "",
                bio: profile.bio || "",
                avatar_url: profile.avatar_url || "",
            });
        }
    }, [profile]);

    if (!user) {
        if (typeof window !== "undefined") {
            router.push("/login");
        }
        return null;
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    username: formData.username,
                    bio: formData.bio,
                    avatar_url: formData.avatar_url,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", user.id);

            if (error) throw error;

            await fetchProfile(user.id);
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen pb-20 pt-24">
            <Navbar />

            <div className="container mx-auto max-w-2xl px-4">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mb-2 gap-2 text-zinc-400 hover:text-white"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft size={16} /> Back
                        </Button>
                        <h1 className="text-3xl font-black text-white italic">Account Settings</h1>
                    </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Avatar Selection */}
                    <Card className="border-white/5 bg-zinc-900/50 p-6">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
                            <Camera size={16} /> Profile Picture
                        </h3>
                        <div className="flex items-center gap-6">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20">
                                {formData.avatar_url ? (
                                    <Image
                                        src={formData.avatar_url}
                                        alt="Avatar Preview"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                                        <User size={32} className="text-zinc-600" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-xs font-medium text-zinc-400">Avatar URL</label>
                                <Input
                                    placeholder="Paste image URL here..."
                                    value={formData.avatar_url}
                                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                                    className="bg-zinc-950 border-white/10"
                                />
                                <p className="text-[10px] text-zinc-600 italic">Provide a link to an image (e.g. from Discord or Pinterest)</p>
                            </div>
                        </div>
                    </Card>

                    {/* Basic Info */}
                    <Card className="border-white/5 bg-zinc-900/50 p-6">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
                            <User size={16} /> Basic Information
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400">Username</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <Input
                                        placeholder="Your unique name"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="bg-zinc-950 border-white/10 pl-10"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400">Bio</label>
                                <Textarea
                                    placeholder="Tell the world about your anime taste..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="bg-zinc-950 border-white/10 min-h-[120px] resize-none"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                            className="hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="gap-2 px-8 font-bold shadow-lg shadow-primary/20"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </form>

                {/* Account Security Info */}
                <div className="mt-12 rounded-2xl border border-dashed border-white/5 bg-white/5 p-6">
                    <div className="flex items-start gap-4">
                        <div className="rounded-full bg-primary/10 p-2">
                            <Shield size={20} className="text-primary" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-1">Account Security</h4>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                Your login information is managed via Supabase Auth. To change your password or email, please visit the verification link sent to your inbox.
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                                <Mail size={14} className="text-zinc-600" />
                                <span className="text-xs text-zinc-400">{user?.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
