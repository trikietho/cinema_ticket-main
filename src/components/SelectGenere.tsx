import { useEffect, useState } from "react"
import { supabase } from "../utils/appUtil";

type GenreType = {
    id: number;
    name: string;
}

function SelectGenre({onChange, selectedId}: {onChange?: (genreId: number) => void, selectedId?: number}) {
    const [genres, setGenres] = useState<GenreType[]>([])
    async function loadRooms() {
        const { data, error } = await supabase.from('mst_film_genres').select().order('id', { ascending: true });
        if (error) {
            alert('Xảy ra lỗi khi lấy dữ liệu');
        }
        setGenres(data as GenreType[]);
        
    }
    useEffect(() => {
        loadRooms()
    }, [])
    return (
        <>
            <select value={selectedId} className="form-select" onChange={(ev) => onChange && onChange(Number(ev.target.value))}>
                <option value={0}>-- chọn --</option>
                {genres.map(genre => (
                <option key={genre.id}  
                value={genre.id}>{genre.name}
                </option>
                ))}
            </select>
        </>
    )
}
export default SelectGenre