"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, UserPlus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";

const signupSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be at most 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) router.replace("/");
        });
    }, [router]);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
    });

    const watchedPassword = watch("password", "");

    const onSubmit = async (data: SignupFormValues) => {
        setLoading(true);
        setError(null);

        // Check if username is already taken
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', data.username)
            .single();

        if (existingUser) {
            setError("This username is already taken. Please choose another one.");
            setLoading(false);
            return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: { data: { username: data.username } },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)]" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="relative z-10"
                >
                    <Card className="max-w-md border-white/5 bg-zinc-900/50 backdrop-blur-xl text-center p-8 shadow-2xl">
                        <div className="mb-6 flex justify-center">
                            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.3)]">
                                <CheckCircle2 className="h-10 w-10 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="mb-2 text-2xl font-bold text-white">Check your email</CardTitle>
                        <CardDescription className="text-zinc-400 mb-6">
                            We&apos;ve sent a verification link to your email address. Please click it to activate your account.
                        </CardDescription>
                        <Button asChild className="w-full h-11 font-bold">
                            <Link href="/login">Back to Sign In</Link>
                        </Button>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md relative z-10 py-10"
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
                        <CardTitle className="text-2xl font-bold text-white">Create Account</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Join the largest anime community today
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Username */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Username</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                    <input
                                        {...register("username")}
                                        type="text"
                                        placeholder="otaku_ninja"
                                        className={`w-full rounded-xl border bg-black/40 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 transition-all ${errors.username ? "border-red-500/60 focus:ring-red-500/20" : "border-white/10 focus:ring-primary/30 focus:border-primary/50"}`}
                                    />
                                </div>
                                {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
                            </div>

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
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Password</label>
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
                                <PasswordStrengthMeter password={watchedPassword} className="mt-2" />
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Confirm Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                    <input
                                        {...register("confirmPassword")}
                                        type="password"
                                        placeholder="••••••••"
                                        className={`w-full rounded-xl border bg-black/40 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 transition-all ${errors.confirmPassword ? "border-red-500/60 focus:ring-red-500/20" : "border-white/10 focus:ring-primary/30 focus:border-primary/50"}`}
                                    />
                                </div>
                                {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
                            </div>

                            {error && (
                                <div className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                                    <AlertCircle size={16} className="shrink-0" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-10 w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-primary font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 cursor-pointer mt-2"
                            >
                                {loading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        <UserPlus size={18} />
                                        Create Account
                                    </>
                                )}
                            </button>
                        </form>
                    </CardContent>
                    <CardFooter>
                        <p className="text-center w-full text-sm text-zinc-400">
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary font-semibold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
