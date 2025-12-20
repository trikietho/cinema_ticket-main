export type FilmType = {
    name: string;
    director?: string;
    thumbnail_url?: string;
    trailer_url?: string ;
    description?: string;
    release_date?: string;
    is_showing?: boolean;
    genre_id?: number;
    rating_id?: number;
}