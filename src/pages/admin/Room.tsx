import { supabase } from "../../utils/appUtil";
import { useEffect, useState } from "react";
import type { RoomListItem } from "../../types/room";
import AppModal from "../../components/AppModal";


function Room() {
    const [rooms, setRooms] = useState<RoomListItem[]>([]);
    const [show, setShow] = useState(false)


    async function loadRooms() {
        const { data, error } = await supabase.from("rooms").select();
        if (error) {
            alert("Xảy ra lỗi khi lấy dữ liệu. " + error);
            return;
        }
        setRooms(data as RoomListItem[]);
    }
//Xóa phòng
    async function deleteRoom(id: number) {
        const res = confirm("Bạn có chắc chắn xóa phòng này không")
        if(!res) return;
        const result = await supabase
            .from('rooms')
            .delete()
            .eq('id', id)
        if (result.status === 204) {
            loadRooms()
            
        }
    }
    // Xử lý khi vừa tải trang xong
    useEffect(() => {
        loadRooms();
    }, []);

    const [roomName, setRoomName] = useState('')
    async function upsertRoom(id: number) {
        let res;
        if(roomId === 0 ) {
            res = await supabase
            .from('rooms')
            .insert({ 
                id: roomId, room_name: roomName})
        } else {
            res = await supabase
                .from('rooms')
                .update({ id: roomId, room_name: roomName })
                .eq('id', id)
        }
    }

    //sửa
    const [roomId, setRoomId] = useState<number | null>()
    const [mHeader, setmHeader] = useState('')
    function showModal(headerText:string) {
        setmHeader(headerText);
        setRoomName('')
        setShow(true);
        setRoomId(0);
    }
    async function editRoom (id: number) {
        showModal('Sửa thông tin phòng');
        setRoomName('')
        setRoomId(null)
        const {data, status} = await supabase.from('rooms').select().eq('id', id);
        if(status == 200 && data) {
            const room = (data as RoomListItem[])[0];
            if(room ) {
                setRoomName(room.room_name ?? '')
                setRoomId(room.id)
            }
        }
    }
        const [checkedIds, setCheckedIds] = useState<number[]>();
        function addIdToList(id: number) {
            if (checkedIds) {
                setCheckedIds([...checkedIds, id])
            } else {
                setCheckedIds([id])
            }
        }
        function delIdToList(id: number ) {
            const idx = checkedIds?.indexOf(id);
            if (!checkedIds) return;
            if (idx != undefined && idx >= 0) {
                setCheckedIds([
                    ...checkedIds?.slice(0, idx),
                    ...checkedIds?.slice(idx + 1)
                ])
            }
        }
        function handleCheckedIds(isChecked: boolean, id: number) {
            if(isChecked) {
                addIdToList(id)
            } else {
                delIdToList(id)
            }
        }
        async function multipleDelte() {
            if(!checkedIds || checkedIds.length == 0){
                alert ("chưa chọn dữ liệu cần xóa")
                return;
            }
            if(!confirm(`Xác nhận xóa ${checkedIds.length} phòng?`)) {
                return;
            }
            await supabase.from('rooms').delete().in('id', checkedIds)
            await loadRooms()
            //reset checked
            setCheckedIds([])
        }
        
    return (
        <>
            <h1>Danh sách phòng</h1>
            <div className="my-3">
                <button onClick={() => showModal('Thêm mới phòng')} className="btn btn-primary">Thêm phòng</button>
                
                <button  className="btn btn-outline-danger" onClick={() => multipleDelte()}>Xóa hàng loạt</button>
            </div>
            <table className="table table-bordered">
                <tbody>
                    <tr>
                        <th><input className="form-check-input" type="checkbox" value="" id="defaultCheck1"/></th>
                        <th>ID</th> 
                        <th>Tên phòng</th>
                        <th></th>
                    </tr>
                    {rooms.map((room) => (
                        <tr key={room.id}>
                            <td><input className="form-check-input" type="checkbox" value="" id="defaultCheck1" onChange={(ev) => handleCheckedIds(ev.currentTarget.checked, room.id)}/></td>
                            <td>{room.id}</td>
                            <td>{room.room_name}</td>
                            <td>
                                <button className="btn btn-primary me-2"
                                        onClick={() => {
                                            editRoom(room.id)
                                            }}>
                                    <i className="bi bi-pencil-square me-1"></i> 
                                        Sửa
                                </button>
                                <button onClick={() => deleteRoom(room.id)} className="btn btn-danger me-2">
                                    <i className="bi bi-trash3 me-1">
                                            Xóa
                                    </i> 
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Form thêm/sửa phòng */}
            
            <AppModal showAdd={show} onHide={() => setShow(false)} headerText={mHeader}>
                    <form>
                        <div className="mt-3">
                            <label className="form-label">Tên phòng</label>
                            <input type="text" className="form-control" 
                                value={roomName}
                                onChange={(ev) => setRoomName(ev.target.value)} />
                        </div>
                        <div className="mt-3">
                            <button type="button" onClick={() => upsertRoom} className="btn btn-success">
                                Lưu dữ liệu
                            </button>
                        </div>
                    </form>
            </AppModal>
        </>
    );
}

export default Room;
