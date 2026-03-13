import axios from 'axios';
import type {
    ApiResponse,
    HomeData,
    AnimeInfo,
    SearchResult,
    PaginatedData,
    Episode,
    ServersData,
    StreamSource,
    SuggestionItem,
    SpotlightAnime,
    AnimeWithEpisodes,
} from '@/types/Anime';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3030';

export const api = axios.create({
    baseURL: `${API_BASE}/api/v1`,
});

// ─── Search / Filter Params ───
export interface SearchParams {
    keyword?: string;
    page?: number;
    type?: string;
    status?: string;
    rated?: string;
    score?: string;
    season?: string;
    language?: string;
    sort?: string;
    genres?: string;
}

// ─── Anime Service ───
export const animeService = {
    // ── Home Page ──
    getHome: async (): Promise<ApiResponse<HomeData>> => {
        const { data } = await api.get('/home');
        return data;
    },

    getSpotlight: async (): Promise<ApiResponse<SpotlightAnime[]>> => {
        const { data } = await api.get('/spotlight');
        return data;
    },

    // ── Anime Details ──
    getAnimeDetails: async (id: string): Promise<ApiResponse<AnimeInfo>> => {
        const { data } = await api.get(`/anime/${id}`);
        return data;
    },

    // ── Episodes ──
    getEpisodes: async (id: string): Promise<ApiResponse<Episode[]>> => {
        const { data } = await api.get(`/episodes/${id}`);
        return data;
    },

    // ── Servers ──
    getServers: async (episodeId: string): Promise<ApiResponse<ServersData>> => {
        const { data } = await api.get(`/servers/${episodeId}`);
        return data;
    },

    // ── Stream ──
    getStream: async (server: string, type: string, id: string): Promise<ApiResponse<StreamSource[]>> => {
        const { data } = await api.get('/stream', { params: { server, type, id } });
        return data;
    },

    // ── Search ──
    searchAnime: async (params: SearchParams): Promise<ApiResponse<PaginatedData<SearchResult>>> => {
        const { data } = await api.get('/search', {
            params: { keyword: params.keyword, page: params.page }
        });
        return data;
    },

    // ── Suggestions ──
    getSuggestions: async (keyword: string): Promise<ApiResponse<SuggestionItem[]>> => {
        const { data } = await api.get('/suggestion', { params: { keyword } });
        return data;
    },

    // ── Filtered Search ──
    getFilteredAnime: async (params: SearchParams): Promise<ApiResponse<PaginatedData<SearchResult>>> => {
        const { data } = await api.get('/filter', { params });
        return data;
    },

    // ── Genre ──
    getAnimeByGenre: async (genre: string, page = 1): Promise<ApiResponse<PaginatedData<SearchResult>>> => {
        const { data } = await api.get(`/genre/${genre}`, { params: { page } });
        return data;
    },

    // ── Category (top-airing, most-popular, etc.) ──
    getAnimeByCategory: async (category: string, page = 1): Promise<ApiResponse<PaginatedData<SearchResult>>> => {
        const { data } = await api.get(`/${category}`, { params: { page } });
        return data;
    },

    // ── Top Ten ──
    getTopTen: async (): Promise<ApiResponse<{ today: AnimeWithEpisodes[]; week: AnimeWithEpisodes[]; month: AnimeWithEpisodes[] }>> => {
        const { data } = await api.get('/topten');
        return data;
    },

    // ── Random Anime ──
    getRandomAnime: async (): Promise<ApiResponse<AnimeInfo>> => {
        const { data } = await api.get('/anime/random');
        return data;
    },
};
