import { useState, useEffect } from 'react';
import { getLabelsAPI, createLabelAPI, updateLabelAPI, deleteLabelAPI } from '../service/api';
import toast from 'react-hot-toast';

const LabelModal = ({ show, onClose }) => {
    const [labels, setLabels] = useState([]);
    const [newLabelName, setNewLabelName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    
    const userId = localStorage.getItem('user_id');

    // Tự động tải danh sách nhãn khi mở cửa sổ
    useEffect(() => {
        if (show && userId) fetchLabels();
    }, [show, userId]);

    const fetchLabels = async () => {
        try {
            const res = await getLabelsAPI();
            if (res.data.status === 'success') {
                setLabels(res.data.data);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách nhãn:", error);
        }
    };

    // Hàm Thêm nhãn
    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newLabelName.trim()) return;
        try {
            await createLabelAPI(newLabelName);
            setNewLabelName('');
            fetchLabels();
        } catch (err) { toast.error("Lỗi khi thêm nhãn!"); }
    };

    // Hàm Xóa nhãn
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa nhãn này? Ghi chú của bạn vẫn sẽ được giữ nguyên an toàn.")) return;
        try {
            await deleteLabelAPI(id);
            fetchLabels();
        } catch (err) { toast.error("Lỗi khi xóa nhãn!"); }
    };

    // Hàm Bật chế độ sửa
    const startEdit = (label) => {
        setEditingId(label.id);
        setEditingName(label.name);
    };

    // Hàm Lưu nhãn sau khi sửa
    const handleSaveEdit = async (id) => {
        if (!editingName.trim()) return;
        try {
            await updateLabelAPI(id, editingName);
            setEditingId(null);
            fetchLabels();
        } catch (err) { toast.error("Lỗi khi đổi tên nhãn!"); }
    };

    if (!show) return null;

    return (
        <>
            <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
            <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content rounded-4 border-0 shadow-lg">
                        <div className="modal-header border-bottom-0 bg-transparent rounded-top-4">
                            <h5 className="modal-title fw-bold text-primary"> Quản lý Nhãn</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body p-4">
                            
                            {/* Form Thêm nhãn mới */}
                            <form onSubmit={handleAdd} className="d-flex gap-2 mb-4">
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Tạo nhãn mới..." 
                                    value={newLabelName} 
                                    onChange={(e) => setNewLabelName(e.target.value)} 
                                />
                                <button type="submit" className="btn btn-primary fw-medium px-3">Thêm</button>
                            </form>

                            {/* Danh sách nhãn */}
                            <h6 className="fw-bold text-secondary mb-3">Danh sách hiện tại</h6>
                            {labels.length === 0 ? (
                                <p className="text-muted fst-italic">Bạn chưa có nhãn nào.</p>
                            ) : (
                                <ul className="list-group">
                                    {labels.map(label => (
                                        <li key={label.id} className="list-group-item d-flex justify-content-between align-items-center border-0 border-bottom">
                                            
                                            {/* Hiển thị Input nếu đang sửa, ngược lại hiện tên nhãn */}
                                            {editingId === label.id ? (
                                                <div className="d-flex gap-2 w-100 me-2">
                                                    <input 
                                                        type="text" 
                                                        className="form-control form-control-sm" 
                                                        value={editingName} 
                                                        onChange={(e) => setEditingName(e.target.value)} 
                                                        autoFocus
                                                    />
                                                    <button className="btn btn-sm btn-success" onClick={() => handleSaveEdit(label.id)}>Lưu</button>
                                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingId(null)}>Hủy</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="fw-medium">{label.name}</span>
                                                    <div className="btn-group">
                                                        <button className="btn btn-sm text-primary" onClick={() => startEdit(label)}>Sửa</button>
                                                        <button className="btn btn-sm text-danger" onClick={() => handleDelete(label.id)}>Xóa</button>
                                                    </div>
                                                </>
                                            )}

                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LabelModal;