// ─── Episode Info ───
export interface EpisodesInfo {
    sub: number;
    dub: number;
    eps: number;
}

// ─── Basic Anime (trending items, etc.) ───
export interface AnimeBasic {
    title: string;
    alternativeTitle: string;
    id: string;
    poster: string;
}

// ─── Anime with episode counts (most list items) ───
export interface AnimeWithEpisodes extends AnimeBasic {
    episodes: EpisodesInfo;
    type?: string;
    duration?: string;
    rank?: number;
}

// ─── Spotlight item (hero carousel) ───
export interface SpotlightAnime extends AnimeWithEpisodes {
    rank: number;
    type: string;
    quality: string;
    duration: string;
    aired: string;
    synopsis: string;
}

// ─── Full Anime Info (detail page) ───
export interface AnimeInfo extends AnimeWithEpisodes {
    rating: string;
    type: string;
    is18Plus: boolean;
    synopsis: string;
    synonyms: string;
    aired: {
        from: string;
        to: string;
    };
    premiered: string;
    duration: string;
    status: string;
    MAL_score: string;
    genres: string[];
    studios: string[];
    producers: string[];
    related?: AnimeWithEpisodes[];
    mostPopular?: AnimeWithEpisodes[];
    recommended?: AnimeWithEpisodes[];
}

// ─── Episode ───
export interface Episode {
    title: string;
    alternativeTitle: string;
    id: string;
    isFiller: boolean;
    episodeNumber: number;
}

// ─── Pagination ───
export interface PaginationInfo {
    currentPage: number;
    hasNextPage: boolean;
    totalPages: number;
}

// ─── API Response Wrappers ───
export interface ApiResponse<T> {
    success: boolean;
    data: T;
}

export interface PaginatedData<T> {
    pageInfo: PaginationInfo;
    response: T[];
}

// ─── Search Result (has type + duration) ───
export interface SearchResult extends AnimeWithEpisodes {
    type: string;
    duration: string;
}

// ─── Home Page Data ───
export interface HomeData {
    spotlight: SpotlightAnime[];
    trending: (AnimeBasic & { rank: number })[];
    topAiring: (AnimeWithEpisodes & { type: string })[];
    mostPopular: (AnimeWithEpisodes & { type: string })[];
    mostFavorite: (AnimeWithEpisodes & { type: string })[];
    latestCompleted: (AnimeWithEpisodes & { type: string })[];
    latestEpisode: AnimeWithEpisodes[];
    newAdded: AnimeWithEpisodes[];
    topUpcoming: AnimeWithEpisodes[];
    topTen: {
        today: AnimeWithEpisodes[];
        week: AnimeWithEpisodes[];
        month: AnimeWithEpisodes[];
    };
    genres: string[];
}

// ─── Suggestion ───
export interface SuggestionItem extends AnimeBasic {
    aired: string;
    type: string;
    duration: string;
}

// ─── Server Info ───
export interface ServerInfo {
    index: number;
    type: "sub" | "dub";
    id: number;
    name: string;
}

export interface ServersData {
    episode: number;
    sub: ServerInfo[];
    dub: ServerInfo[];
}

// ─── Stream Info ───
export interface StreamTrack {
    file: string;
    label: string;
    kind: "captions" | "thumbnails";
    default: boolean;
}

export interface StreamSource {
    id: string;
    type: "sub" | "dub";
    link: {
        file: string;
        type: string;
    };
    tracks: StreamTrack[];
    intro: { start: number; end: number };
    outro: { start: number; end: number };
    server: string;
    referer?: string;
}
