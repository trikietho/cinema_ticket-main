export type FilmType = {
    name: string;
    director?: string;
    poster_url?: string;
    trailer_url?: string ;
    description?: string;
    release_date?: string;
    is_showing?: boolean;
    genre_id?: number;
    rating_id?: number;
}

export type FilmsListItem = FilmType & {
    id: number;
    name: string;
    poster_url: string;
    mst_film_genres: {
        name?: string;
    },
    mst_film_ratings: {
        name?: string;
    },
    release_date: string;
}