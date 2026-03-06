export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            animes: {
                Row: {
                    banner_url: string | null
                    episodes: number | null
                    genres: Json | null
                    id: number
                    image_url: string | null
                    score: number | null
                    season: string | null
                    status: string | null
                    synopsis: string | null
                    title: string
                    updated_at: string
                    year: number | null
                }
                Insert: {
                    banner_url?: string | null
                    episodes?: number | null
                    genres?: Json | null
                    id: number
                    image_url?: string | null
                    score?: number | null
                    season?: string | null
                    status?: string | null
                    synopsis?: string | null
                    title: string
                    updated_at?: string
                    year?: number | null
                }
                Update: {
                    banner_url?: string | null
                    episodes?: number | null
                    genres?: Json | null
                    id?: number
                    image_url?: string | null
                    score?: number | null
                    season?: string | null
                    status?: string | null
                    synopsis?: string | null
                    title?: string
                    updated_at?: string
                    year?: number | null
                }
                Relationships: []
            }
            comment_likes: {
                Row: {
                    comment_id: string
                    user_id: string
                }
                Insert: {
                    comment_id: string
                    user_id: string
                }
                Update: {
                    comment_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "comment_likes_comment_id_fkey"
                        columns: ["comment_id"]
                        isOneToOne: false
                        referencedRelation: "comments"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "comment_likes_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            comments: {
                Row: {
                    anime_id: number
                    content: string
                    created_at: string
                    id: string
                    parent_id: string | null
                    user_id: string
                }
                Insert: {
                    anime_id: number
                    content: string
                    created_at?: string
                    id?: string
                    parent_id?: string | null
                    user_id: string
                }
                Update: {
                    anime_id?: number
                    content?: string
                    created_at?: string
                    id?: string
                    parent_id?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "comments_anime_id_fkey"
                        columns: ["anime_id"]
                        isOneToOne: false
                        referencedRelation: "animes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "comments_parent_id_fkey"
                        columns: ["parent_id"]
                        isOneToOne: false
                        referencedRelation: "comments"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "comments_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            favorites: {
                Row: {
                    anime_id: number
                    created_at: string
                    user_id: string
                }
                Insert: {
                    anime_id: number
                    created_at?: string
                    user_id: string
                }
                Update: {
                    anime_id?: number
                    created_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "favorites_anime_id_fkey"
                        columns: ["anime_id"]
                        isOneToOne: false
                        referencedRelation: "animes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "favorites_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            notes: {
                Row: {
                    anime_id: number
                    content: string
                    id: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    anime_id: number
                    content: string
                    id?: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    anime_id?: number
                    content?: string
                    id?: string
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "notes_anime_id_fkey"
                        columns: ["anime_id"]
                        isOneToOne: false
                        referencedRelation: "animes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "notes_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    bio: string | null
                    id: string
                    role: string | null
                    updated_at: string
                    username: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    bio?: string | null
                    id: string
                    role?: string | null
                    updated_at?: string
                    username?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    bio?: string | null
                    id?: string
                    role?: string | null
                    updated_at?: string
                    username?: string | null
                }
                Relationships: []
            }
            reports: {
                Row: {
                    comment_id: string
                    created_at: string
                    id: string
                    reason: string
                    reporter_id: string
                    status: string | null
                }
                Insert: {
                    comment_id: string
                    created_at?: string
                    id?: string
                    reason: string
                    reporter_id: string
                    status?: string | null
                }
                Update: {
                    comment_id?: string
                    created_at?: string
                    id?: string
                    reason?: string
                    reporter_id?: string
                    status?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "reports_comment_id_fkey"
                        columns: ["comment_id"]
                        isOneToOne: false
                        referencedRelation: "comments"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "reports_reporter_id_fkey"
                        columns: ["reporter_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            watchlist: {
                Row: {
                    anime_id: number
                    episode_progress: number | null
                    status: string | null
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    anime_id: number
                    episode_progress?: number | null
                    status?: string | null
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    anime_id?: number
                    episode_progress?: number | null
                    status?: string | null
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "watchlist_anime_id_fkey"
                        columns: ["anime_id"]
                        isOneToOne: false
                        referencedRelation: "animes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "watchlist_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
