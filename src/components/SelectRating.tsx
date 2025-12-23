import { useEffect, useState } from "react";
import { supabase } from "../utils/appUtil";

type SelectRatingProps = {
    selectedId?: number,
    onChange?: (genreId: number) => void;
};

function SelectRating({ selectedId, onChange }: SelectRatingProps)   {
    const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
    useEffect( () => 
    {
        supabase.from('mst_film_ratings').select().then(res => 
        {
            if (!res.data) return ;
            setGenres(res.data?.map ( i =>
            {
                return { id : i.id ,
                    name : i.name}
            }
            ))
        }
        )
    },[]);
    return (
    <select onChange={ (ev) => onChange && (Number(ev.target.value))} className="form-select">
    <option value="">--Chọn 1 giá trị--</option>
    {
        genres.map ( rating =>
            <option key={rating.id}
            value={rating.id} 
            selected={ selectedId === rating.id}>
                {rating.name}
            </option>
        )
    }
    </select>
    );   
}
export default SelectRating;