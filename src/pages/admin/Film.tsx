import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/appUtil";
import type { FilmsListItem } from "../../types/Film";

function Film() {
    const [films, setFilms] = useState<FilmsListItem[]>();

    useEffect(() => {
        //tải dư liệu danh sách phim từ supabase
        supabase
        .from('films')
        .select(`
            id,
            name,
            poster_url,
            name,
            mst_film_genres(
            name
            ),
            mst_film_ratings(
            name
            ),
            release_date
        `)
        .then( (res) => {  
            setFilms(res.data as FilmsListItem[]);       
        });
    }, []);

    return (
        <>
            <h1>Danh sách phim</h1>
            <Link className="btn btn-primary" to="upsert">Thêm mới phim</Link>

            <table className="table table-bordered">
                <thead>
                <tr>
                    <th>STT</th>
                    <th>Tên phim</th>
                    <th>Poster</th>
                    <th>Thể loại</th>
                    <th>Phân loại</th>
                    <th>Ngày phát hành</th>
                    <th></th>
                </tr>
                </thead>
                {/*Hiển thị danh sách phim */}
                <tbody>
                {films?.map((film, idx) => (
                    <tr>
                        <td>{idx+1}</td>
                        <td>{film.name}</td>
                        <td><img src={film.poster_url} alt={film.name} width="100"  className="img-thumnail"/></td>
                        <td>{film.mst_film_genres?.name}</td>
                        <td>{film.mst_film_ratings?.name}</td>
                        <td>{new Date(film.release_date).toLocaleDateString()}</td>
                        <td>
                            <Link className="btn btn-warning" to={`film/create/${film.id}`}>Sửa</Link>
                            &nbsp;
                            <button className="btn btn-danger">Xóa</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            
        </>
    
    );
}

export default Film;
