import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resetPasswordAPI } from '../service/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState(''); // Đây giờ là OTP code nhập tay
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu không khớp!');
            return;
        }
        setIsLoading(true);
        try {
            const res = await resetPasswordAPI(token, newPassword, confirmPassword);
            if (res.status === 'success') {
                toast.success('Đổi mật khẩu thành công! Đang chuyển về trang đăng nhập...');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi đổi mật khẩu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="vh-100 d-flex justify-content-center align-items-center bg-light bg-gradient">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-11 col-sm-9 col-md-7 col-lg-5 col-xl-4">
                        <div className="card shadow-lg border-0 rounded-4">
                            <div className="card-body p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <h4 className="fw-bold text-danger mb-2">Mật Khẩu Mới</h4>
                                    <p className="text-muted small">Vui lòng nhập mật khẩu mới của bạn</p>
                                </div>
                                {/* Notification handled by Toast */}
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-medium text-secondary small mb-1">Mã xác thực (OTP)</label>
                                        <input type="text" className="form-control form-control-lg bg-light border-0 shadow-none fs-6 fw-bold text-center" placeholder="Nhập mã 6 số" value={token} onChange={e => setToken(e.target.value)} required maxLength="6" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-medium text-secondary small mb-1">Mật khẩu mới</label>
                                        <input type="password" className="form-control form-control-lg bg-light border-0 shadow-none fs-6" placeholder="Mật khẩu mới..." value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-medium text-secondary small mb-1">Xác nhận mật khẩu</label>
                                        <input type="password" className="form-control form-control-lg bg-light border-0 shadow-none fs-6" placeholder="Xác nhận mật khẩu..." value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                                    </div>
                                    <button type="submit" className="btn btn-danger btn-lg w-100 rounded-pill shadow-sm fw-bold" disabled={isLoading || token.length < 6}>Xác nhận Đổi</button>
                                </form>
                                <div className="text-center mt-4 small">
                                    <Link to="/login" className="text-decoration-none fw-bold text-danger">Về Đăng nhập</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ResetPassword;