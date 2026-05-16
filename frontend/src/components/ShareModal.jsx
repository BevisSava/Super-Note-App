import React, { useState, useEffect } from 'react';
import { MdClose, MdPersonAdd } from 'react-icons/md';
import { BACKEND_URL } from '../service/api';

const ShareModal = ({ show, onClose, noteId }) => {
    const [shares, setShares] = useState([]);
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('read');
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchShares = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BACKEND_URL}/index.php?action=get_shares&note_id=${noteId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status === 'success') {
                setShares(data.data);
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách chia sẻ:', error);
        }
    };

    useEffect(() => {
        if (show && noteId) {
            fetchShares();
            setMessage({ type: '', text: '' });
            setEmail('');
        }
    }, [show, noteId]);

    const handleShare = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BACKEND_URL}/index.php?action=share_note`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ note_id: noteId, email, permission })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setMessage({ type: 'success', text: data.message });
                setEmail('');
                fetchShares();
            } else {
                setMessage({ type: 'danger', text: data.message });
            }
        } catch (error) {
            setMessage({ type: 'danger', text: 'Lỗi kết nối' });
        }
    };

    const updatePermission = async (shareEmail, newPermission) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BACKEND_URL}/index.php?action=update_share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ note_id: noteId, email: shareEmail, permission: newPermission })
            });
            const data = await res.json();
            if (data.status === 'success') {
                fetchShares();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const revokeShare = async (shareEmail) => {
        if (!window.confirm(`Bạn có chắc muốn thu hồi quyền của ${shareEmail}?`)) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BACKEND_URL}/index.php?action=revoke_share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ note_id: noteId, email: shareEmail })
            });
            const data = await res.json();
            if (data.status === 'success') {
                fetchShares();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 1100 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg p-2">
                    <div className="modal-header border-bottom-0 pb-2 pt-3 px-3">
                        <h5 className="modal-title fw-bold" style={{ letterSpacing: '-0.5px' }}>Quản lý chia sẻ</h5>
                        <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
                    </div>
                    <div className="modal-body pt-0">
                        {message.text && (
                            <div className={`alert alert-${message.type} border-0 rounded-3 py-2 mb-3`} style={{ fontSize: '0.85rem' }}>
                                {message.text}
                            </div>
                        )}
                        <form onSubmit={handleShare} className="d-flex gap-2 mb-4 bg-light p-2 rounded-3 border">
                            <input 
                                type="email" 
                                className="form-control bg-transparent border-0 shadow-none px-2" 
                                placeholder="Email người nhận..." 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                                style={{ fontSize: '0.9rem' }}
                            />
                            <select className="form-select bg-transparent border-0 shadow-none w-auto fw-medium" style={{ fontSize: '0.85rem', cursor: 'pointer' }} value={permission} onChange={(e) => setPermission(e.target.value)}>
                                <option value="read">Chỉ xem</option>
                                <option value="edit">Được sửa</option>
                            </select>
                            <button type="submit" className="btn btn-dark rounded-3 px-3 d-flex align-items-center fw-bold" style={{ fontSize: '0.85rem' }}>
                                <MdPersonAdd size={18} className="me-1" /> Thêm
                            </button>
                        </form>

                        <h6 className="fw-bold mb-3 px-1" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>NGƯỜI CÓ QUYỀN TRUY CẬP</h6>
                        <div className="shares-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {shares.length === 0 ? (
                                <p className="text-muted small px-1">Chưa có ai được chia sẻ ghi chú này.</p>
                            ) : (
                                <ul className="list-group list-group-flush">
                                    {shares.map(share => (
                                        <li key={share.id} className="list-group-item d-flex justify-content-between align-items-center px-1 py-3 bg-transparent border-bottom-0">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold border border-primary border-opacity-10" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                                                    {share.display_name?.charAt(0).toUpperCase() || share.shared_with_email.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>{share.display_name || 'Người dùng'}</div>
                                                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{share.shared_with_email}</div>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <select 
                                                    className="form-select form-select-sm shadow-none border-0 bg-light rounded-pill px-3 fw-medium" 
                                                    style={{ width: '110px', cursor: 'pointer', fontSize: '0.75rem' }}
                                                    value={share.permission}
                                                    onChange={(e) => updatePermission(share.shared_with_email, e.target.value)}
                                                >
                                                    <option value="read">Chỉ xem</option>
                                                    <option value="edit">Được sửa</option>
                                                </select>
                                                <button 
                                                    className="btn btn-sm text-danger border-0 p-1 rounded-circle hover-bg-light"
                                                    onClick={() => revokeShare(share.shared_with_email)}
                                                    title="Thu hồi"
                                                >
                                                    <MdClose size={20} />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer border-0 pt-0">
                        <button className="btn btn-outline-secondary btn-sm rounded-3 px-3" onClick={onClose}>Đóng</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
