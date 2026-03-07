import axios from 'axios';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

export const jikanApi = axios.create({
    baseURL: JIKAN_BASE_URL,
});

export interface Anime {
    mal_id: number;
    title: string;
    synopsis: string;
    images: {
        webp: {
            large_image_url: string;
            image_url: string;
        };
    };
    score: number;
    episodes: number;
    status: string;
    year: number;
    season: string;
    genres: Array<{ mal_id: number; name: string }>;
    type: string;
    duration: string;
    rating: string;
    title_japanese: string;
    studios: Array<{ mal_id: number; name: string }>;
    source: string;
    background: string;
    trailer: {
        youtube_id: string | null;
        url: string | null;
        embed_url: string | null;
    };
}

export interface JikanPagination {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: {
        count: number;
        total: number;
        per_page: number;
    };
}

export interface JikanResponse<T> {
    data: T;
    pagination: JikanPagination;
}

export interface AnimeSearchParams {
    q?: string;
    page?: number;
    status?: string;
    type?: string;
    order_by?: string;
    sort?: 'asc' | 'desc';
    genres?: string;
    limit?: number;
}

export const animeService = {
    getTopAnime: async (page = 1): Promise<JikanResponse<Anime[]>> => {
        const { data } = await jikanApi.get(`/top/anime?page=${page}`);
        return data;
    },
    getAnimeDetails: async (id: number): Promise<{ data: Anime }> => {
        const { data } = await jikanApi.get(`/anime/${id}/full`);
        return data;
    },
    searchAnime: async (params: AnimeSearchParams): Promise<JikanResponse<Anime[]>> => {
        const { data } = await jikanApi.get('/anime', { params });
        return data;
    },
    getAdvancedAnime: async (params: AnimeSearchParams): Promise<JikanResponse<Anime[]>> => {
        const { data } = await jikanApi.get('/anime', { params });
        return data;
    },
    getAnimeByGenre: async (genreId: number, page = 1, limit = 12): Promise<JikanResponse<Anime[]>> => {
        const { data } = await jikanApi.get('/anime', {
            params: {
                genres: genreId,
                page,
                limit,
                order_by: 'score',
                sort: 'desc'
            }
        });
        return data;
    },
    getRecentAnime: async (): Promise<JikanResponse<Anime[]>> => {
        const { data } = await jikanApi.get('/seasons/now');
        return data;
    }
};
