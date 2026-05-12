import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resetPasswordAPI } from '../service/api';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const urlToken = new URLSearchParams(window.location.search).get('token');
        setToken(urlToken);
        if (!urlToken) setMessage({ type: 'danger', text: 'Đường dẫn không hợp lệ!' });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'warning', text: 'Mật khẩu không khớp!' });
            return;
        }
        setIsLoading(true);
        try {
            const res = await resetPasswordAPI(token, newPassword, confirmPassword);
            setMessage({ type: 'success', text: res.message });
            setTimeout(() => navigate('/login'), 3000); // Đá về Login
        } catch (err) {
            setMessage({ type: 'danger', text: err.response?.data?.message || 'Lỗi đổi mật khẩu.' });
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
                                {message.text && <div className={`alert alert-${message.type} rounded-3 py-2 text-center small`}>{message.text}</div>}
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-medium text-secondary small mb-1">Mật khẩu mới</label>
                                        <input type="password" className="form-control form-control-lg bg-light border-0 shadow-none fs-6" placeholder="Mật khẩu mới..." value={newPassword} onChange={e => setNewPassword(e.target.value)} required disabled={!token} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-medium text-secondary small mb-1">Xác nhận mật khẩu</label>
                                        <input type="password" className="form-control form-control-lg bg-light border-0 shadow-none fs-6" placeholder="Xác nhận mật khẩu..." value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required disabled={!token} />
                                    </div>
                                    <button type="submit" className="btn btn-danger btn-lg w-100 rounded-pill shadow-sm fw-bold" disabled={isLoading || !token}>Xác nhận Đổi</button>
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