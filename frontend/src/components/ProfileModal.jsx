import  { useState, useEffect } from 'react';
import { updateProfileAPI, BACKEND_URL } from '../service/api';
import toast from 'react-hot-toast';

const ProfileModal = ({ show, onClose, profile, onProfileUpdated, onLogout }) => {
    const [displayName, setDisplayName] = useState('');
    const [theme, setTheme] = useState('light');
    const [fontSize, setFontSize] = useState('medium');
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.display_name || '');
            setTheme(profile.theme || 'light');
            setFontSize(profile.font_size || 'medium');
            if (profile.avatar_url) {
                setPreviewImage(`${BACKEND_URL}/${profile.avatar_url}`);
            }
        }
    }, [profile]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData();
        formData.append('display_name', displayName);
        formData.append('theme', theme);
        formData.append('font_size', fontSize);
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        console.log("1. Dữ liệu ném xuống PHP:", Object.fromEntries(formData));
        try {
            const res = await updateProfileAPI(formData);
            console.log("2. Server PHP trả về:", res.data);
            if (res.data.status === 'success') {
                toast.success("Cập nhật thông tin thành công!");
                onProfileUpdated(res.data.data); 
                onClose(); 
            }
        } catch (error) {
            toast.error("Lỗi khi cập nhật profile!");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!show) return null;

    return (
        <>
            <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
            <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-4 border-0 shadow-lg">
                        <div className="modal-header border-bottom-0">
                            <h5 className="modal-title fw-bold">Cài đặt Tài khoản</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="text-center mb-4">
                                    <img 
                                        src={previewImage} 
                                        alt="Avatar" 
                                        className="rounded-circle object-fit-cover shadow-sm mb-2" 
                                        style={{ width: '100px', height: '100px', border: '3px solid #dee2e6' }}
                                    />
                                    <input type="file" className="form-control form-control-sm" accept="image/*" onChange={handleImageChange} />
                                </div>

                                {/* Tên hiển thị */}
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Tên hiển thị</label>
                                    <input type="text" className="form-control" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                                </div>

                                {/* Giao diện (Theme) */}
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Giao diện (Theme)</label>
                                    <select className="form-select" value={theme} onChange={(e) => setTheme(e.target.value)}>
                                        <option value="light">Chế độ Sáng (Light)</option>
                                        <option value="dark"> Chế độ Tối (Dark)</option>
                                    </select>
                                </div>

                                {/* Cỡ chữ */}
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Cỡ chữ ghi chú</label>
                                    <select className="form-select" value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
                                        <option value="small">Nhỏ (Small)</option>
                                        <option value="medium">Vừa (Medium) - Mặc định</option>
                                        <option value="large">Lớn (Large)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer border-top-0 bg-transparent rounded-bottom-4 d-flex justify-content-between">
                                <button type="button" className="btn btn-outline-danger rounded-pill px-4" onClick={onLogout}>Đăng xuất</button>
                                <div>
                                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4 me-2" onClick={onClose}>Hủy</button>
                                    <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={isLoading}>
                                        {isLoading ? 'Đang lưu...' : 'Lưu cài đặt'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfileModal;