"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, User, Lock, CheckCircle2, AlertCircle, ChevronLeft, LogOut, Loader2, Save } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { Tables } from "@/types/supabase";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PasswordStrengthMeter, getPasswordStrength } from "@/components/ui/PasswordStrengthMeter";

export default function SettingsPage() {
    const { user, profile, setProfile } = useAuthStore();
    const router = useRouter();

    const [username, setUsername] = useState(profile?.username || "");
    const [bio, setBio] = useState(profile?.bio || "");
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Password change state
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const passwordStrength = getPasswordStrength(newPassword);

    // Avatar state
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        const hasChanges =
            username !== (profile?.username || "") ||
            bio !== (profile?.bio || "") ||
            avatarFile !== null;
        setHasUnsavedChanges(hasChanges);
    }, [username, bio, avatarFile, profile]);

    useEffect(() => {
        if (profile) {
            setUsername(profile.username || "");
            setBio(profile.bio || "");
            setAvatarPreview(profile.avatar_url || null);
        }
    }, [profile]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Avatar must be less than 2MB");
                return;
            }
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadAvatar = async (userId: string): Promise<string | null> => {
        if (!avatarFile) return profile?.avatar_url || null;

        setIsUploadingAvatar(true);
        try {
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            toast.error("Error uploading avatar: " + (error as Error).message);
            return null;
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Validation
        if (username.length < 3 || username.length > 20) {
            toast.error("Username must be between 3 and 20 characters");
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            toast.error("Username can only contain letters, numbers, and underscores");
            return;
        }

        if (bio.length > 200) {
            toast.error("Bio must be less than 200 characters");
            return;
        }

        setIsUpdatingProfile(true);
        try {
            let avatarUrl = profile?.avatar_url || null;

            if (avatarFile) {
                const uploadedUrl = await uploadAvatar(user.id);
                if (uploadedUrl) avatarUrl = uploadedUrl;
            }

            const { error } = await supabase
                .from('profiles')
                .update({
                    username,
                    bio,
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) {
                if (error.code === '23505') {
                    toast.error("This username is already taken. Please choose another one.");
                } else {
                    toast.error(error.message);
                }
                return;
            }

            // Update local state
            setProfile({
                ...profile,
                username,
                bio,
                avatar_url: avatarUrl
            } as Tables<'profiles'>);

            toast.success("Profile updated successfully!");
            setAvatarFile(null);
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (passwordStrength < 4) {
            toast.error("Password is too weak. Please aim for at least 'Strong' strength.");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            toast.success("Password updated successfully!");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Navbar />
                <div className="text-center space-y-4">
                    <AlertCircle size={48} className="mx-auto text-zinc-700" />
                    <h2 className="text-xl text-zinc-500 font-medium">Please sign in to access settings</h2>
                    <Button asChild className="rounded-full px-8">
                        <Link href="/login">Login</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background pb-20 pt-24 text-zinc-100">
            <Navbar />

            <div className="container mx-auto px-4 xl:px-20 max-w-5xl">
                {/* Header */}
                <div className="mb-10 text-center md:text-left">
                    <Link href={`/profile/${profile?.username || user.id}`} className="inline-flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors mb-4 group font-medium">
                        <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                        Back to Profile
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tight text-white mb-2">
                        Account <span className="text-primary">Settings</span>
                    </h1>
                    <p className="text-zinc-500">Manage your profile information and account security.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Side: Avatar & Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="rounded-3xl bg-zinc-900/40 backdrop-blur-md border border-white/5 p-8 text-center space-y-6"
                        >
                            <div className="relative mx-auto h-32 w-32 md:h-40 md:w-40 rounded-full bg-primary/20 p-1 ring-4 ring-primary/30 group">
                                <div className="h-full w-full rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center relative">
                                    {avatarPreview ? (
                                        <Image src={avatarPreview} alt="Preview" fill sizes="160px" className="object-cover" />
                                    ) : (
                                        <User size={64} className="text-zinc-600" />
                                    )}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-10"
                                    >
                                        <Camera className="text-white" size={32} />
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    hidden
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-white mb-1 truncate">{profile?.username || "Anime Enthusiast"}</h2>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{profile?.role || "Member"}</p>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <p className="text-sm text-zinc-400 italic line-clamp-3">
                                    &quot;{bio || "Ready to change the world, one episode at a time."}&quot;
                                </p>
                            </div>
                        </motion.div>

                        <div className="rounded-2xl bg-primary/5 border border-primary/10 p-6 space-y-2">
                            <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                                <CheckCircle2 size={16} /> Data Synchronization
                            </h3>
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                Your profile information and favorites are synced across all devices connected to this account.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Form Sections */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Profile Info Form */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-3xl bg-zinc-900/40 backdrop-blur-md border border-white/5 p-8 md:p-10 space-y-8"
                        >
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3 italic">
                                    <User className="text-primary" size={24} /> General Information
                                </h3>
                                <p className="text-zinc-500 text-sm">Update your public profile details.</p>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Username</label>
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                            (username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username)) ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                        )}>
                                            {/^[a-zA-Z0-9_]+$/.test(username) ? `${username.length}/20` : "Invalid Characters"}
                                        </span>
                                    </div>
                                    <Input
                                        placeholder="Pick a cool username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="h-12 bg-black/40 border-white/10 focus:ring-primary focus:border-primary/50 transition-all font-medium"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Bio</label>
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                            bio.length <= 200 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                        )}>
                                            {bio.length}/200
                                        </span>
                                    </div>
                                    <Textarea
                                        placeholder="Tell us about your anime taste..."
                                        className={cn(
                                            "bg-black/40 border-white/10 min-h-[120px] focus-visible:ring-primary focus-visible:border-primary/50 transition-all font-medium",
                                            bio.length > 200 && "border-red-500/50 focus-visible:ring-red-500/30"
                                        )}
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                    />
                                    {bio.length > 200 && (
                                        <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1 italic">
                                            <AlertCircle size={12} /> Bio is too long. Please shorten it to 200 characters or less.
                                        </p>
                                    )}
                                </div>

                                <Button
                                    disabled={isUpdatingProfile || isUploadingAvatar || username.length < 3 || username.length > 20 || bio.length > 200 || !hasUnsavedChanges}
                                    className={cn(
                                        "w-full md:w-auto px-10 h-12 gap-2 shadow-lg rounded-xl font-bold italic transition-all",
                                        !hasUnsavedChanges ? "opacity-50 grayscale" : "shadow-primary/20 hover:cursor-pointer"
                                    )}
                                    type="submit"
                                >
                                    {isUpdatingProfile ? (
                                        <><Loader2 className="animate-spin" size={18} /> Updating...</>
                                    ) : (
                                        <><Save size={18} /> Save Changes</>
                                    )}
                                </Button>
                            </form>
                        </motion.section>

                        {/* Security Form */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-3xl bg-zinc-900/40 backdrop-blur-md border border-white/5 p-8 md:p-10 space-y-8"
                        >
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3 italic">
                                    <Lock className="text-red-500" size={24} /> Security
                                </h3>
                                <p className="text-zinc-500 text-sm">Manage your password and account protection.</p>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">New Password</label>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                className="h-12 bg-black/40 border-white/10 focus:ring-primary focus:border-primary/50 font-medium"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Confirm New Password</label>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                className="h-12 bg-black/40 border-white/10 focus:ring-primary focus:border-primary/50 font-medium"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Password Strength Meter */}
                                    <PasswordStrengthMeter password={newPassword} className="px-1" />
                                    {newPassword && newPassword !== confirmPassword && (
                                        <p className="px-1 text-[10px] text-red-400 font-bold mt-1 flex items-center gap-1 italic">
                                            <AlertCircle size={12} /> Passwords do not match.
                                        </p>
                                    )}
                                </div>

                                <Button
                                    variant="outline"
                                    disabled={isUpdatingPassword || !newPassword || passwordStrength < 4 || newPassword !== confirmPassword}
                                    className={cn(
                                        "w-full md:w-auto px-10 h-12 gap-2 rounded-xl font-bold italic transition-all shadow-lg group",
                                        (passwordStrength < 4 || newPassword !== confirmPassword || !newPassword)
                                            ? "opacity-40 grayscale pointer-events-none"
                                            : "border-red-500/20 text-red-500 hover:bg-red-500/10 hover:border-red-500 hover:cursor-pointer hover:shadow-red-500/5"
                                    )}
                                    type="submit"
                                >
                                    {isUpdatingPassword ? (
                                        <><Loader2 className="animate-spin" size={18} /> Securing...</>
                                    ) : (
                                        <><Lock size={18} className="group-hover:rotate-12 transition-transform" /> Set Strong Password</>
                                    )}
                                </Button>
                            </form>
                        </motion.section>

                        {/* Danger Zone */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 flex flex-col sm:flex-row items-center justify-between gap-6"
                        >
                            <div className="text-center sm:text-left">
                                <h4 className="text-red-500 font-bold mb-1 italic">Identity Protection</h4>
                                <p className="text-xs text-zinc-500 font-medium">Log out from this device to protect your credentials.</p>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-full sm:w-auto rounded-xl font-bold italic gap-2 h-10 px-6 hover:cursor-pointer"
                                onClick={() => {
                                    supabase.auth.signOut();
                                    router.push("/");
                                }}
                            >
                                <LogOut size={16} /> Logout
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}
