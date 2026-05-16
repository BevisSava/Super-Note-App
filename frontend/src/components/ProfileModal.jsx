import  { useState, useEffect } from 'react';
import { updateProfileAPI, changePasswordAPI, BACKEND_URL } from '../service/api';
import toast from 'react-hot-toast';

const ProfileModal = ({ show, onClose, profile, onProfileUpdated, onLogout }) => {
    const [displayName, setDisplayName] = useState('');
    const [theme, setTheme] = useState('light');
    const [fontSize, setFontSize] = useState('medium');
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Đổi mật khẩu
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

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

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setIsPasswordLoading(true);
        try {
            const res = await changePasswordAPI(currentPassword, newPassword, confirmPassword);
            if (res.data && res.data.status === 'success') {
                toast.success('Đổi mật khẩu thành công!');
                setIsChangingPassword(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(res.data?.message || 'Lỗi khi đổi mật khẩu.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi kết nối.');
            console.error(error);
        } finally {
            setIsPasswordLoading(false);
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
                            <h5 className="modal-title fw-bold">{isChangingPassword ? "Đổi mật khẩu" : "Cài đặt Tài khoản"}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        {!isChangingPassword ? (
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


                                {/* Cỡ chữ */}
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Cỡ chữ ghi chú</label>
                                    <select className="form-select" value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
                                        <option value="small">Nhỏ (Small)</option>
                                        <option value="medium">Vừa (Medium) - Mặc định</option>
                                        <option value="large">Lớn (Large)</option>
                                    </select>
                                </div>
                                
                                {/* Đổi mật khẩu Button */}
                                <div className="mt-4 pt-3 border-top">
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary w-100 rounded-3" 
                                        onClick={() => setIsChangingPassword(true)}
                                    >
                                        Đổi mật khẩu
                                    </button>
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
                        ) : (
                        <form onSubmit={handlePasswordChange}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Mật khẩu hiện tại</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        placeholder="Nhập mật khẩu hiện tại" 
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Mật khẩu mới</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        placeholder="Ít nhất 6 ký tự" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength="6"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-medium">Xác nhận mật khẩu mới</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        placeholder="Nhập lại mật khẩu mới" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength="6"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer border-top-0 bg-transparent rounded-bottom-4 d-flex justify-content-between">
                                <button 
                                    type="button" 
                                    className="btn btn-outline-secondary rounded-pill px-4"
                                    onClick={() => setIsChangingPassword(false)}
                                >
                                    Quay lại
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary rounded-pill px-4"
                                    disabled={isPasswordLoading || !currentPassword || !newPassword || !confirmPassword}
                                >
                                    {isPasswordLoading ? 'Đang xử lý...' : 'Xác nhận đổi'}
                                </button>
                            </div>
                        </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfileModal;