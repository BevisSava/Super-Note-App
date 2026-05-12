import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '../service/api';
import { FaUser, FaLock  } from "react-icons/fa";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const handleLogin = async (e) => {
        e.preventDefault(); 
        setError('');
        
        try {
            const data = await loginAPI(email, password);
            if (data.status === 'success') {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user_name', data.user.display_name);
                localStorage.setItem('user_id', data.user.id);
                alert('Đăng nhập thành công, chào mừng ' + data.user.display_name + '!');
                navigate('/home');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể kết nối đến Máy chủ!');
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
                                    <h2 className="fw-bold text-primary mb-2">Super Note</h2>
                                    <p className="text-muted small">Đăng nhập để quản lý ghi chú của bạn</p>
                                </div>
                                
                                {error && <div className="alert alert-danger rounded-3 py-2 text-center small">{error}</div>}

                                <form onSubmit={handleLogin}>
                                    {/* Nhóm Email */}
                                    <div className="mb-4">
                                        <label className="form-label fw-medium text-secondary small mb-1">Email</label>
                                        <div className="input-group input-group-lg rounded-3 overflow-hidden shadow-sm border">
                                            <span className="input-group-text bg-white border-0 px-3 text-primary" id="email-icon">
                                                <FaUser />
                                            </span>
                                            <input 
                                                type="email" 
                                                className="form-control border-0 bg-white shadow-none fs-6 px-2" 
                                                placeholder="Nhập email..."
                                                value={email} 
                                                onChange={(e) => setEmail(e.target.value)} 
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Nhóm Mật khẩu */}
                                    <div className="mb-4">
                                        <label className="form-label fw-medium text-secondary small mb-1">Mật khẩu</label>
                                        <div className="input-group input-group-lg rounded-3 overflow-hidden shadow-sm border">
                                            <span className="input-group-text bg-white border-0 px-3 text-primary" id="password-icon">
                                                <FaLock />
                                            </span>
                                            <input 
                                                type="password" 
                                                className="form-control border-0 bg-white shadow-none fs-6 px-2" 
                                                placeholder="Nhập mật khẩu..."
                                                value={password} 
                                                onChange={(e) => setPassword(e.target.value)} 
                                                required
                                            />
                                        </div>
                                    </div>  

                                    <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill shadow-sm fw-bold mt-2">
                                        Đăng nhập
                                    </button>
                                </form>
                                
                                <div className="text-center mt-4">
                                    <a href="/forgot-password" className="text-decoration-none small text-muted hover-primary"> Quên mật khẩu?</a>
                                </div>
                                <div className="text-center mt-3 small">
                                    <span className="text-secondary">Chưa có tài khoản? </span>
                                    <a href="/register" className="text-decoration-none fw-bold text-primary">Đăng ký</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;