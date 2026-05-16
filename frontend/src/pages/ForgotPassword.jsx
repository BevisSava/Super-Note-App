import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPasswordAPI } from '../service/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await forgotPasswordAPI(email);
            toast.success(res.message + " Đang chuyển hướng...");
            // Chuyển hướng sang trang nhập OTP sau 1.5s để người dùng kịp đọc thông báo
            setTimeout(() => navigate('/reset-password'), 1500);
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi gửi yêu cầu.");
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
                                    <h4 className="fw-bold text-primary mb-2">Quên Mật Khẩu</h4>
                                    <p className="text-muted small">Nhập email của bạn để nhận link khôi phục mật khẩu</p>
                                </div>
                                {/* Notification handled by Toast */}
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label className="form-label fw-medium text-secondary small mb-1">Email</label>
                                        <input type="email" className="form-control form-control-lg bg-light border-0 shadow-none fs-6" placeholder="Nhập email..." value={email} onChange={e => setEmail(e.target.value)} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill shadow-sm fw-bold" disabled={isLoading}>
                                        {isLoading ? 'Đang gửi...' : 'Gửi Link Kích Hoạt'}
                                    </button>
                                </form>
                                <div className="text-center mt-4 small">
                                    <Link to="/login" className="text-decoration-none fw-bold text-primary">Quay lại Đăng nhập</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ForgotPassword;