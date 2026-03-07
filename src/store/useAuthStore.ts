import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Tables } from '@/types/supabase';

interface AuthState {
    user: User | null;
    profile: Tables<'profiles'> | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setProfile: (profile: Tables<'profiles'> | null) => void;
    fetchProfile: (userId: string) => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    profile: null,
    isLoading: true,
    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    fetchProfile: async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (!error && data) {
            // Generate username if null (OAuth edge case)
            if (!data.username) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const fallbackName = user.user_metadata?.full_name?.replace(/\s+/g, '_').toLowerCase()
                        || user.email?.split('@')[0]
                        || `user_${Math.random().toString(36).substring(2, 8)}`;

                    const newUsername = `${fallbackName}_${Math.floor(Math.random() * 1000)}`;

                    const { error: updateError } = await supabase
                        .from('profiles')
                        .update({ username: newUsername })
                        .eq('id', userId);

                    if (!updateError) {
                        data.username = newUsername;
                    }
                }
            }
            set({ profile: data });
        }
    },
    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null });
    },
}));
