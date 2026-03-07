"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Loader2, AlertCircle } from "lucide-react";

const loginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// SVG icons for Google and Discord
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#1877F2" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<"google" | "facebook" | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) router.replace("/");
        });
    }, [router]);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/");
            router.refresh();
        }
    };

    const handleOAuth = async (provider: "google" | "facebook") => {
        setOauthLoading(provider);
        setError(null);
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: `${window.location.origin}/` },
        });
        if (error) {
            setError(error.message);
            setOauthLoading(null);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                            <span className="text-2xl font-black text-white italic">A</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">
                            Ay<span className="text-primary">Anime</span>
                        </span>
                    </Link>
                </div>

                <Card className="border-white/5 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {/* OAuth Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleOAuth("google")}
                                disabled={!!oauthLoading}
                                className="flex items-center justify-center gap-2.5 h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20 disabled:opacity-60 cursor-pointer"
                            >
                                {oauthLoading === "google" ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
                                Google
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOAuth("facebook")}
                                disabled={!!oauthLoading}
                                className="flex items-center justify-center gap-2.5 h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-[#1877F2]/50 disabled:opacity-60 cursor-pointer"
                            >
                                {oauthLoading === "facebook" ? <Loader2 size={18} className="animate-spin" /> : <FacebookIcon />}
                                Facebook
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-zinc-900 px-3 text-zinc-500 tracking-widest">or continue with email</span>
                            </div>
                        </div>

                        {/* Email / Password Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                    <input
                                        {...register("email")}
                                        type="email"
                                        placeholder="name@example.com"
                                        className={`w-full rounded-xl border bg-black/40 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 transition-all ${errors.email ? "border-red-500/60 focus:ring-red-500/20" : "border-white/10 focus:ring-primary/30 focus:border-primary/50"}`}
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Password</label>
                                    <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                    <input
                                        {...register("password")}
                                        type="password"
                                        placeholder="••••••••"
                                        className={`w-full rounded-xl border bg-black/40 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 transition-all ${errors.password ? "border-red-500/60 focus:ring-red-500/20" : "border-white/10 focus:ring-primary/30 focus:border-primary/50"}`}
                                    />
                                </div>
                                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                            </div>

                            {error && (
                                <div className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                                    <AlertCircle size={16} className="shrink-0" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !isValid}
                                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-primary font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        <LogIn size={18} />
                                        Sign In
                                    </>
                                )}
                            </button>
                        </form>
                    </CardContent>
                    <CardFooter>
                        <p className="text-center w-full text-sm text-zinc-400">
                            Don&apos;t have an account?{" "}
                            <Link href="/signup" className="text-primary font-semibold hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
