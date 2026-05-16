import { Link } from 'react-router-dom';
import { MdCheckCircle, MdArrowForward } from 'react-icons/md';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

const VerifySuccess = () => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="vh-100 d-flex justify-content-center align-items-center bg-light position-relative overflow-hidden">
            {/* Pháo hoa giấy chúc mừng */}
            <Confetti
                width={windowSize.width}
                height={windowSize.height}
                numberOfPieces={200}
                recycle={false}
                colors={['#0d6efd', '#6610f2', '#6f42c1', '#d63384', '#dc3545', '#fd7e14', '#ffc107', '#198754', '#20c997', '#0dcaf0']}
            />

            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-11 col-sm-9 col-md-7 col-lg-5 col-xl-4">
                        <div className="card shadow-lg border-0 rounded-4 text-center animate__animated animate__zoomIn">
                            <div className="card-body p-5">
                                <div className="mb-4">
                                    <MdCheckCircle size={100} className="text-success animate__animated animate__bounceIn animate__delay-1s" />
                                </div>
                                
                                <h2 className="fw-bold text-dark mb-3">Xác Thực Thành Công!</h2>
                                <p className="text-muted mb-4 fs-5">
                                    Chào mừng bạn đến với <strong>Super Note</strong>. Tài khoản của bạn đã được kích hoạt và sẵn sàng để sử dụng.
                                </p>

                                <div className="p-3 bg-light rounded-3 mb-4 border border-dashed">
                                    <p className="small text-secondary mb-0">
                                        Bây giờ bạn có thể tạo ghi chú, đính kèm file và chia sẻ chúng với mọi người.
                                    </p>
                                </div>

                                <Link 
                                    to="/login" 
                                    className="btn btn-primary btn-lg w-100 rounded-pill shadow-sm fw-bold d-flex align-items-center justify-content-center gap-2 hover-scale"
                                >
                                    Đăng Nhập Ngay <MdArrowForward size={20} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .border-dashed { border-style: dashed !important; }
                .hover-scale { transition: transform 0.2s; }
                .hover-scale:hover { transform: scale(1.03); }
                @keyframes zoomIn {
                    from { opacity: 0; transform: scale3d(0.3, 0.3, 0.3); }
                    50% { opacity: 1; }
                }
                .animate__zoomIn { animation: zoomIn 0.6s both; }
                @keyframes bounceIn {
                    from, 20%, 40%, 60%, 80%, to { animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); }
                    0% { opacity: 0; transform: scale3d(0.3, 0.3, 0.3); }
                    20% { transform: scale3d(1.1, 1.1, 1.1); }
                    40% { transform: scale3d(0.9, 0.9, 0.9); }
                    60% { opacity: 1; transform: scale3d(1.03, 1.03, 1.03); }
                    80% { transform: scale3d(0.97, 0.97, 0.97); }
                    to { opacity: 1; transform: scale3d(1, 1, 1); }
                }
                .animate__bounceIn { animation: bounceIn 0.8s both; }
            `}</style>
        </div>
    );
};

export default VerifySuccess;
