import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerAPI } from '../service/api';

const Register = () => {
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        try {
            const data = await registerAPI(email, displayName, password, confirmPassword);
            if (data.status === 'success') {
                setSuccess('Đăng ký thành công! Đang chuyển về trang Đăng nhập...');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể kết nối đến Máy chủ!');
        }
    };

    return (
        <div className="vh-100 d-flex justify-content-center align-items-center bg-light bg-gradient py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-11 col-sm-9 col-md-7 col-lg-5 col-xl-4">
                        <div className="card shadow-lg border-0 rounded-4">
                            <div className="card-body p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <h3 className="fw-bold text-primary mb-2">Tạo Tài Khoản</h3>
                                    <p className="text-muted small">Bắt đầu ghi chú với Super Note</p>
                                </div>
                                
                                {error && <div className="alert alert-danger rounded-3 py-2 text-center small">{error}</div>}
                                {success && <div className="alert alert-success rounded-3 py-2 text-center small">{success}</div>}

                                <form onSubmit={handleRegister}>
                                    <div className="mb-3">
                                        <label className="form-label fw-medium text-secondary small mb-1">Tên hiển thị</label>
                                        <input type="text" className="form-control form-control-lg bg-light border-0 shadow-none fs-6" placeholder="Ví dụ: Cậu Vàng..." value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-medium text-secondary small mb-1">Email</label>
                                        <input type="email" className="form-control form-control-lg bg-light border-0 shadow-none fs-6" placeholder="Nhập email..." value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-medium text-secondary small mb-1">Mật khẩu</label>
                                        <input type="password" className="form-control form-control-lg bg-light border-0 shadow-none fs-6" placeholder="Tạo mật khẩu..." value={password} onChange={(e) => setPassword(e.target.value)} required />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-medium text-secondary small mb-1">Xác nhận Mật khẩu</label>
                                        <input type="password" className="form-control form-control-lg bg-light border-0 shadow-none fs-6" placeholder="Nhập lại mật khẩu..." value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill shadow-sm fw-bold mt-2">Đăng Ký Ngay</button>
                                </form>
                                
                                <div className="text-center mt-4 small">
                                    <span className="text-secondary">Đã có tài khoản? </span>
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

export default Register;