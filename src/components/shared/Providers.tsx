"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { Toaster } from "react-hot-toast";
import { CookieConsent } from "@/components/shared/CookieConsent";

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    const { setUser, fetchProfile } = useAuthStore();

    useEffect(() => {
        // Check active sessions
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                fetchProfile(session.user.id);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
        });

        return () => subscription.unsubscribe();
    }, [setUser, fetchProfile]);

    return (
        <QueryClientProvider client={queryClient}>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: "#18181b",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "14px",
                        fontWeight: "500",
                        borderRadius: "12px",
                        padding: "12px 20px",
                    },
                    success: {
                        iconTheme: {
                            primary: "#a855f7",
                            secondary: "#fff",
                        },
                    },
                }}
            />
            {children}
            <CookieConsent />
        </QueryClientProvider>
    );
}
