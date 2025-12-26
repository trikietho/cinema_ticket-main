import { useRef, useState } from "react";
import type { FilmType } from "../../types/Film";
import { supabase } from "../../utils/appUtil";
import SelectGenre from "../../components/SelectGenere";
import SelectRating from "../../components/SelectRating";
import { useNavigate } from "react-router-dom";

function FilmUpsert() {

    const [filmName, setFilmName] = useState('');
    const [director, setDirector] = useState('');
    
    const [description, setDescription] = useState('');
    const [genreId, setGenreId] = useState<number>();
    const [ratingId, setRatingId] = useState<number>();
    const [releaseDate, setReleaseDate] = useState('');
    const [isShowing, setIsShowing] = useState(false);

    const posterRef = useRef<HTMLInputElement>(null);
    const trailerRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();//gửi dữ  liệu lên supabase
    
    

async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    let posterUrl = '';
    let trailerUrl = '';

    ev.preventDefault();
//upload hình poster
    const posters = posterRef.current?.files;
    if(posters && posters.length > 0) {
        const file = posters[0];
        const res = await supabase.storage
        .from('cinema_ticket')
        .upload(`thumbnails/${Date.now()}-${file.name}`, file);
        if(res.data){
            const url = supabase.storage.from('cinema_ticket').getPublicUrl(res.data.path)

            posterUrl=url.data.publicUrl
        }
    }

//upload trailer
    const trailers = trailerRef.current?.files;
    if(trailers && trailers.length > 0) {
        const file = trailers[0];
        const res = await supabase.storage
        .from('cinema_ticket')
        .upload(`trailers/${Date.now()}-${file.name}`, file);
        if(res.data){
            const url = supabase.storage.from('cinema_ticket').getPublicUrl(res.data.path)
            trailerUrl =url.data.publicUrl
        }
    }

    
    const data:FilmType =  {
        name  : filmName,
        director : director,
        poster_url  : posterUrl,
        trailer_url : trailerUrl,
        description :  description,
        genre_id  : genreId,
        rating_id  : ratingId,
        release_date : releaseDate,
        is_showing : isShowing,
    }
    //gửi dữ liệu lên supabase
    // Sửa lại đoạn cuối hàm handleSubmit
        const res = await supabase.from("films").insert(data);

        if (!res.error) {
            // Không có lỗi -> Thành công
            navigate("/admin/film");
        } else {
            // Có lỗi -> In ra để debug
            console.error("Lỗi thêm phim:", res.error);
            alert("Có lỗi xảy ra: " + res.error.message);
        }
}

    return (
        <>
        <div className="container mt-4" style={{ maxWidth: '800px' }}>
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
                    <h4 className="fw-bold text-primary">
                        <i className="bi bi-film me-2"></i>Thêm Phim Mới
                    </h4>
                    <p className="text-muted small">Vui lòng điền đầy đủ thông tin bên dưới</p>
                </div>
                
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        {/* Hàng 1: Tên phim & Đạo diễn */}
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Tên phim</label>
                                <input 
                                    onChange={(ev) => setFilmName(ev.target.value)} 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Nhập tên phim..." 
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Đạo diễn</label>
                                <input 
                                    onChange={(ev) => setDirector(ev.target.value)} 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Tên đạo diễn" 
                                />
                            </div>
                        </div>

                        {/* Hàng 2: URLs (Poster & Trailer) */}
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Ảnh Poster (URL)</label>
                                <div className="input-group">
                                    <span className="input-group-text"><i className="bi bi-image"></i></span>
                                    <input 
                                        type="file" 
                                        ref={posterRef}
                                        className="form-control" 
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Trailer (URL)</label>
                                <div className="input-group">
                                    <span className="input-group-text"><i className="bi bi-youtube"></i></span>
                                    <input 
                                        type="file"
                                        ref={trailerRef}
                                        className="form-control" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Hàng 3: Mô tả (Dùng Textarea) */}
                        <div className="mb-3">
                            <label className="form-label fw-bold">Mô tả nội dung</label>
                            <textarea 
                                onChange={(ev) => setDescription(ev.target.value)} 
                                className="form-control" 
                                rows={3} 
                                placeholder="Tóm tắt nội dung phim..."
                            ></textarea>
                        </div>

                        {/* Hàng 4: Ngày chiếu & Phân loại (3 cột) */}
                        <div className="row mb-3">
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Ngày khởi chiếu</label>
                                <input 
                                    onChange={(ev) => setReleaseDate(ev.target.value)} 
                                    type="date" 
                                    className="form-control" 
                                />
                            </div>
                            
                            {/* Chuyển sang Select box thay vì nhập số */}
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Thể loại</label>
                                <SelectGenre
                                onChange={setGenreId}
                                >
                                </SelectGenre>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-bold">Độ tuổi</label>
                                <SelectRating onChange={setRatingId} />
                            </div>
                        </div>

                        {/* Hàng 5: Trạng thái & Nút bấm */}
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            {/* Toggle Switch đẹp hơn Checkbox thường */}
                            <div className="form-check form-switch">
                                <input 
                                    onChange={(ev) => setIsShowing(ev.target.checked)} 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    role="switch" 
                                    id="flexSwitchCheckDefault" 
                                    style={{ width: '3em', height: '1.5em' }}
                                />
                                <label className="form-check-label ms-2 mt-1" htmlFor="flexSwitchCheckDefault">
                                    Đang công chiếu
                                </label>
                            </div>

                            <button type="submit" className="btn btn-primary px-4 py-2 fw-bold shadow">
                                <i className="bi bi-save2 me-2"></i>
                                Lưu thông tin
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
            </>
    )
}
export default FilmUpsert;