import { useRef, useState } from "react";
import type { FilmType } from "../../types/Film";
import { supabase } from "../../utils/appUtil";
import SelectGenre from "../../components/SelectGenere";
import SelectRating from "../../components/SelectRating";
import { useNavigate } from "react-router-dom";
import * as yup from 'yup';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/src/index.js";
import { Controller } from "react-hook-form";

type FilmUpsertFormData = {
    name  : string;
    director : string;
    poster_url  : FileList;
    trailer_url : FileList ;
    description : string;
    release_date : string;
    is_showing : boolean;
    genre_id  : number;
    rating_id  : number;
}


const schema = yup.object({
        name  : yup.string().required("Tên phim là bắt buộc"),
        director :  yup.string(),
        poster_url  : yup.mixed()
        .test("required", "Poster là bắt buộc",  (value, cxt)  => {
            const files = value as FileList;
            return files && files.length > 0;
        })
        .test("fileType", "Poster không phù hợp",  (value, cxt)  => {
            const files = value as FileList;
            if (!files || files.length === 0) {
                return false; // Không có file, trả về false
            }
            const file = files?.[0];
            //lấy extension của file
            const fileExt = file?.name.split('.').pop(); 
            return ['jpg', 'jpeg', 'png', 'gif'].includes(fileExt?.toLowerCase() || '');
        }),
        trailer_url : yup.mixed()
        .test('trailerMaxlenght', "kích thước trailer không vượt quá 5MB",  (value, cxt)  => {
            const files = value as FileList;
            if (files.length == 0)  return true;

            const file =  files?.[0];
            return (file.size / 1024 / 1024) <= 5.00; // nhỏ hơn 5MB
        }),
        description : yup.string(),
        genre_id  : yup.number().min(0).required("Thể loại là bắt buộc"),
        rating_id  : yup.number().min(0).required("Độ tuổi là bắt buộc"),
        release_date : yup.string().required("Ngày khởi chiếu là bắt buộc"),
        is_showing : yup.boolean(),
})

function FilmUpsert() {

    const posterRef = useRef<HTMLInputElement>(null);
    const trailerRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();//gửi dữ  liệu lên supabase
    
    
    

async function handleSubmitForm(fData  : any) {
    console.log(fData);
    let posterUrl = '';
    let trailerUrl = '';

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
        name  : fData.name,
        director : fData.director,
        poster_url  : posterUrl,
        trailer_url : trailerUrl,
        description :  fData.description,
        genre_id  : fData.genre_id,
        rating_id  : fData.rating_id,
        release_date : fData.release_date,
        is_showing : fData.is_showing,
    }
    //gửi dữ liệu lên supabase
    // Sửa lại đoạn cuối hàm handleSubmit
        const res = await supabase.from("films").insert(data);

        if (!res.error) {
            // Không có lỗi -> Thành công
            navigate("/admin/film");
        } //else {
            // Có lỗi -> In ra để debug
            //console.error("Lỗi thêm phim:", res.error);
            //alert("Có lỗi xảy ra: " + res.error.message);
        //}
}
    const {
        handleSubmit,
        register,
        control,
        formState: { errors },
        } = useForm({
        resolver: yupResolver(schema),
        })

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
                    <form onSubmit={handleSubmit(handleSubmitForm)}>
                        {/* Hàng 1: Tên phim & Đạo diễn */}
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Tên phim</label>
                                <input 
                                    {...register('name')} 
                                    type="text" 
                                    className="form-control" 
                                />
                                <span  className="text-danger">{errors.name?.message}</span>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Đạo diễn</label>
                                <input 
                                    {...register('director')} 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Tên đạo diễn" 
                                />
                                <span  className="text-danger">{errors.director?.message}</span>
                            </div>
                        </div>

                        {/* Hàng 2: URLs (Poster & Trailer) */}
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Ảnh Poster (URL)</label>
                                <div className="input-group">
                                    <span className="input-group-text"><i className="bi bi-image"></i></span>
                                    <input 
                                        {...register('poster_url')}
                                        type="file" 
                                        className="form-control" 
                                    />
                                    <br />
                                    <span className="text-danger">{errors.poster_url?.message}</span>
                                </div>
                            </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Trailer (URL)</label>
                                <div className="input-group">
                                    <span className="input-group-text"><i className="bi bi-youtube"></i></span>
                                    <input 
                                        {...register('trailer_url')}
                                        type="file"
                                        className="form-control" 
                                    />
                                    <span className="text-danger">{errors?.trailer_url?.message}</span>
                            </div>
                        </div>

                        {/* Hàng 3: Mô tả (Dùng Textarea) */}
                        <div className="mb-3">
                            <label className="form-label fw-bold">Mô tả nội dung</label>
                            <textarea 
                                {...register('description')} 
                                className="form-control" 
                                rows={3} 
                                placeholder="Tóm tắt nội dung phim..."
                            ></textarea>
                            <span className="text-danger">{errors.description?.message}</span>
                        </div>

                        {/* Hàng 4: Ngày chiếu & Phân loại (3 cột) */}
                        <div className="row mb-3">
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Ngày khởi chiếu</label>
                                <input 
                                    {...register('release_date')} 
                                    type="date" 
                                    className="form-control" 
                                />
                                <span className="text-danger">{errors.release_date?.message}</span>
                            </div>
                            
                            {/* Chuyển sang Select box thay vì nhập số */}
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Thể loại</label>
                                <Controller
                                    name='genre_id'
                                    control={control}
                                    render={({ field }) => (
                                    <SelectGenre onChange={field.onChange} />
                                )}
                                />
                                <span className="text-danger">{errors.genre_id?.message}</span>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Độ tuổi</label>
                                <Controller
                                    name="rating_id"
                                    control={control}
                                    render={({field}) =>
                                <SelectRating onChange={field.onChange} />
                        }
                    />
                    <span className="text-danger">{errors.rating_id?.message}</span>
                            </div>
                        </div>

                        {/* Hàng 5: Trạng thái & Nút bấm */}
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            {/* Toggle Switch đẹp hơn Checkbox thường */}
                            <div className="form-check form-switch">
                                <input 
                                    {...register('is_showing')} 
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