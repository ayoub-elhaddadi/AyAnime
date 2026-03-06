import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/types/supabase';

interface AuthState {
    user: any | null;
    profile: Tables<'profiles'> | null;
    isLoading: boolean;
    setUser: (user: any) => void;
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

        if (!error) {
            set({ profile: data });
        }
    },
    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null });
    },
}));
