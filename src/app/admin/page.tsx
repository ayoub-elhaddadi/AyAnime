"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle, XCircle, MessageSquare, User, Flag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
    const { profile } = useAuthStore();
    const router = useRouter();
    const queryClient = useQueryClient();

    // Protect route
    useEffect(() => {
        if (profile && profile.role !== "admin") {
            router.push("/");
        }
    }, [profile, router]);

    const { data: reports, isLoading: reportsLoading } = useQuery({
        queryKey: ["admin_reports"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("reports")
                .select("*, comments(*, profiles(*)), reporter:profiles(*)")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: profile?.role === "admin",
    });

    const resolveReport = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const { error } = await supabase
                .from("reports")
                .update({ status })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin_reports"] });
        },
    });

    const deleteComment = useMutation({
        mutationFn: async (commentId: string) => {
            const { error } = await supabase
                .from("comments")
                .delete()
                .eq("id", commentId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin_reports"] });
        },
    });

    if (profile?.role !== "admin") return null;

    return (
        <main className="min-h-screen pb-20 pt-24 bg-zinc-950">
            <Navbar />

            <div className="container mx-auto px-4">
                <div className="mb-10 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                        <Shield className="text-primary" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                            Admin <span className="text-primary">Console</span>
                        </h1>
                        <p className="text-zinc-500">System moderation and reports management</p>
                    </div>
                </div>

                <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 mb-10">
                    <Card className="bg-zinc-900/50 border-white/5 shadow-xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-zinc-500 uppercase flex items-center gap-2">
                                <AlertTriangle size={14} className="text-yellow-500" /> Pending Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-4xl font-black text-white">{reports?.filter(r => r.status === "pending").length || 0}</span>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900/50 border-white/5 shadow-xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-zinc-500 uppercase flex items-center gap-2">
                                <CheckCircle size={14} className="text-green-500" /> Resolved Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-4xl font-black text-white">0</span>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900/50 border-white/5 shadow-xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-zinc-500 uppercase flex items-center gap-2">
                                <Flag size={14} className="text-red-500" /> Critical Issues
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-4xl font-black text-white">0</span>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <MessageSquare size={20} className="text-primary" /> Content Reports
                    </h2>

                    <div className="rounded-2xl border border-white/5 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-900 text-zinc-400 text-xs uppercase font-bold tracking-widest border-b border-white/5">
                                    <th className="px-6 py-4">Reporter</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Comment Content</th>
                                    <th className="px-6 py-4">Reason</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-zinc-900/20">
                                {reports?.map((report: any) => (
                                    <tr key={report.id} className="text-sm group hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                                                    {report.reporter?.username?.[0].toUpperCase() || "U"}
                                                </div>
                                                <span className="text-white font-medium">{report.reporter?.username || "Unknown"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                                                report.status === "pending" ? "bg-yellow-500/20 text-yellow-500" : "bg-green-500/20 text-green-500"
                                            )}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-zinc-400 truncate">{report.comments?.content}</p>
                                        </td>
                                        <td className="px-6 py-4 italic text-zinc-500">
                                            {report.reason}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-green-500 border-green-500/20 hover:bg-green-500/10" onClick={() => resolveReport.mutate({ id: report.id, status: "resolved" })}>
                                                    <CheckCircle size={14} />
                                                </Button>
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-red-500 border-red-500/20 hover:bg-red-500/10" onClick={() => deleteComment.mutate(report.comment_id)}>
                                                    <XCircle size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(!reports || reports.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-zinc-600 italic">
                                            No active reports found. The community is behaving well!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
