import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotesAPI, deleteNoteAPI, lockNoteAPI, unlockNoteAPI, shareNoteAPI, togglePinAPI, getProfileAPI, getLabelsAPI, BACKEND_URL } from '../service/api';
import toast from 'react-hot-toast';
import { MdMenu, MdSearch, MdLightbulbOutline, MdOutlinePeopleAlt, MdOutlineLabel, MdEdit, MdGridView, MdViewAgenda } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import NoteCard from '../components/NoteCard';
import NoteForm from '../components/NoteForm';
import ProfileModal from '../components/ProfileModal';
import LabelModal from '../components/LabelModal';

const Home = () => {
    const [notes, setNotes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [noteToEdit, setNoteToEdit] = useState(null);
    const [viewingNote, setViewingNote] = useState(null);
    const [profile, setProfile] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const navigate = useNavigate();
    const [showLabelModal, setShowLabelModal] = useState(false);
    const [allLabels, setAllLabels] = useState([]);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('notes');

    const fetchNotes = async () => {
        try {
            const response = await getNotesAPI();
            if (response.data) setNotes(response.data);
        } catch (err) { console.error(err); }
    };

    const fetchProfile = async () => {
        try {
            const res = await getProfileAPI();
            if (res.data.status === 'success') {
                const userData = res.data.data;
                setProfile(userData);
                document.documentElement.setAttribute('data-bs-theme', userData.theme);
            }
        } catch (error) { console.error("Lỗi lấy profile", error); }
    };

    const fetchLabelsForFilter = async () => {
        try {
            const res = await getLabelsAPI();
            if (res.data.status === 'success') {
                setAllLabels(res.data.data);
            }
        } catch (error) { console.error("Lỗi lấy nhãn:", error); }
    };

    useEffect(() => {
        fetchNotes();
        fetchProfile();
        fetchLabelsForFilter();
    }, []);

    const handleLogout = () => {
        if(window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    const handleEditClick = (note) => {
        setNoteToEdit(note);
        setShowNoteModal(true);
    };

    const handleLockNote = async (id) => {
        const pass1 = window.prompt("Nhập mật khẩu bạn muốn đặt cho ghi chú này:");
        if (!pass1) return;
        const pass2 = window.prompt("Vui lòng nhập LẠI mật khẩu lần nữa để xác nhận:");
        if (!pass2) return;
        if (pass1 !== pass2) { toast.error("Mật khẩu hai lần nhập không khớp!"); return; }
        try { await lockNoteAPI(id, pass1); toast.success("Đã khóa ghi chú!"); fetchNotes(); }
        catch { toast.error("Lỗi khi khóa!"); }
    };

    const handleUnlockNote = async (id) => {
        const password = window.prompt("Nhập mật khẩu để mở khóa:");
        if (password) {
            try {
                const response = await unlockNoteAPI(id, password);
                if (response.status === 'success') {
                    setNotes(prev => prev.map(n => n.id === id ? { ...n, is_locked: false, temp_unlocked: true, content: response.data?.content } : n));
                } else toast.error("Sai mật khẩu!");
            } catch { toast.error("Sai mật khẩu!"); }
        }
    };

    const handleRemoveLock = async (id) => {
        if (window.confirm("Bỏ mật khẩu để Sửa/Xóa ghi chú này?")) {
            try { await lockNoteAPI(id, ""); toast.success("Đã gỡ khóa ghi chú"); fetchNotes(); } catch { toast.error("Lỗi gỡ khóa!"); }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Xóa ghi chú này?")) {
            try { await deleteNoteAPI(id); toast.success("Đã xóa ghi chú"); fetchNotes(); } catch { toast.error("Lỗi khi xóa!"); }
        }
    };

    const handleShareNote = async (id) => {
        const email = window.prompt("Nhập Email người nhận:");
        if (email) {
            try { await shareNoteAPI(id, email); toast.success("Đã chia sẻ thành công!"); }
            catch (err) { toast.error("Thất bại: " + (err.response?.data?.message || "Lỗi")); }
        }
    };


    const handleTogglePin = async (id, newPinnedStatus) => {
        try {
            await togglePinAPI(id, newPinnedStatus);
            fetchNotes();
        } catch (err) { toast.error("Lỗi khi ghim/bỏ ghim!"); }
    };

    const displayedNotes = notes.filter(note => {
        const searchContent = note.is_locked ? "" : note.content.toLowerCase();
        const searchTitle = note.title.toLowerCase();
        const query = searchQuery.toLowerCase();
        const matchesSearch = searchTitle.includes(query) || searchContent.includes(query);

        let matchesTab = true;
        if (activeTab === 'notes') {
            matchesTab = note.is_owner === 1 || note.is_owner === "1";
        } else if (activeTab === 'shared') {
            matchesTab = note.is_owner === 0 || note.is_owner === "0";
        } else {
            matchesTab = note.label_ids && note.label_ids.split(',').includes(String(activeTab));
        }

        return matchesSearch && matchesTab;
    });

    const getFontSizeClass = () => {
        if (!profile) return '';
        if (profile.font_size === 'large') return 'fs-4';
        if (profile.font_size === 'small') return 'small';
        return '';
    };

    return (
        <div className={`d-flex flex-column vh-100 bg-body ${getFontSizeClass()}`} style={{ overflow: 'hidden' }}>
            {/* Top Navbar */}
            <header className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom bg-body" style={{ height: '64px', zIndex: 1000 }}>
                <div className="d-flex align-items-center gap-3" style={{ minWidth: '240px' }}>
                    <button
                        className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border-0 hover-bg-light bg-transparent"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <MdMenu size={24} className="text-secondary" />
                    </button>
                    <div className="d-flex align-items-center gap-2">
                        <img src="/picture/fairytaillogo.png" alt="Logo" style={{ width: '45px', height: '45px' }} />
                        <span className="fs-4 text-secondary" style={{ fontWeight: '500' }}>Super Note</span>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex-grow-1 max-w-md mx-4 d-none d-md-block" style={{ maxWidth: '720px' }}>
                    <div className="input-group bg-body-tertiary rounded-3 overflow-hidden border-0" style={{ transition: 'background-color 0.2s', boxShadow: 'none' }}>
                        <span className="input-group-text bg-transparent border-0 ps-3 text-secondary">
                            <MdSearch size={22} />
                        </span>
                        <input
                            type="text"
                            className="form-control bg-transparent border-0 shadow-none fs-6 py-2 text-body"
                            placeholder="Tìm kiếm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Right Actions */}
                <div className="d-flex align-items-center gap-2">
                    <button
                        className="btn btn-light rounded-circle p-2 d-flex align-items-center border-0 text-secondary hover-bg-light bg-transparent"
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        title={viewMode === 'grid' ? 'Chế độ danh sách' : 'Chế độ lưới'}
                    >
                        {viewMode === 'grid' ? <MdViewAgenda size={24} /> : <MdGridView size={24} />}
                    </button>

                    <div
                        className="d-flex align-items-center p-1 rounded-circle"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setShowProfileModal(true)}
                        title="Tài khoản"
                    >
                        {profile?.avatar_url ? (
                            <img
                                src={`${BACKEND_URL}/${profile.avatar_url}`}
                                alt="Avatar"
                                className="rounded-circle object-fit-cover"
                                style={{ width: '36px', height: '36px' }}
                            />
                        ) : (
                            <FaUserCircle className="text-secondary" style={{ width: '36px', height: '36px' }} />
                        )}
                    </div>
                </div>
            </header>

            <div className="d-flex flex-grow-1 overflow-hidden">
                {/* Sidebar */}
                <aside
                    className={`bg-body transition-all d-flex flex-column py-2 ${isSidebarOpen ? 'd-block' : 'd-none'}`}
                    style={{ width: '280px', minWidth: '280px', transition: 'width 0.2s', overflowY: 'auto' }}
                >
                    <ul className="nav flex-column mb-auto">
                        <li className="nav-item">
                            <button
                                className={`nav-link d-flex align-items-center gap-4 py-3 px-4 rounded-end-pill mx-0 w-100 text-start border-0 ${activeTab === 'notes' ? 'bg-warning-subtle text-body-emphasis fw-bold' : 'text-secondary hover-bg-light bg-transparent'}`}
                                onClick={() => setActiveTab('notes')}
                            >
                                <MdLightbulbOutline size={24} />
                                <span className="fs-6">Ghi chú</span>
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link d-flex align-items-center gap-4 py-3 px-4 rounded-end-pill mx-0 w-100 text-start border-0 ${activeTab === 'shared' ? 'bg-warning-subtle text-body-emphasis fw-bold' : 'text-secondary hover-bg-light bg-transparent'}`}
                                onClick={() => setActiveTab('shared')}
                            >
                                <MdOutlinePeopleAlt size={24} />
                                <span className="fs-6">Được chia sẻ với tôi</span>
                            </button>
                        </li>

                        {allLabels.length > 0 && (
                            <div className="mt-3 mb-1 px-4 text-muted small fw-medium" style={{ letterSpacing: '0.5px' }}>
                                NHÃN
                            </div>
                        )}
                        {allLabels.map(label => (
                            <li className="nav-item" key={label.id}>
                                <button
                                    className={`nav-link d-flex align-items-center gap-4 py-3 px-4 rounded-end-pill mx-0 w-100 text-start border-0 ${activeTab === label.id ? 'bg-warning-subtle text-body-emphasis fw-bold' : 'text-secondary hover-bg-light bg-transparent'}`}
                                    onClick={() => setActiveTab(label.id)}
                                >
                                    <MdOutlineLabel size={24} />
                                    <span className="fs-6 text-truncate">{label.name}</span>
                                </button>
                            </li>
                        ))}

                        <li className="nav-item mt-2">
                            <button
                                className="nav-link d-flex align-items-center gap-4 py-3 px-4 rounded-end-pill mx-0 w-100 text-start border-0 text-secondary hover-bg-light bg-transparent"
                                onClick={() => setShowLabelModal(true)}
                            >
                                <MdEdit size={24} />
                                <span className="fs-6">Chỉnh sửa nhãn</span>
                            </button>
                        </li>
                    </ul>
                </aside>

                {/* Main Content */}
                <main className="flex-grow-1 bg-body overflow-auto p-4">
                    <div className="mx-auto" style={{ maxWidth: '900px' }}>

                        {/* Dummy Input */}
                        <div className="mb-5 d-flex justify-content-center">
                            <div
                                className="card shadow-sm border rounded-3 px-3 py-2 w-100"
                                style={{ maxWidth: '600px', cursor: 'text', boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)' }}
                                onClick={() => { setNoteToEdit(null); setShowNoteModal(true); }}
                            >
                                <div className="d-flex align-items-center text-muted fw-medium py-1">
                                    <span className="fs-6 flex-grow-1 ps-2">Tạo ghi chú...</span>
                                </div>
                            </div>
                        </div>

                        {/* Note Grid */}
                        <div className="row g-3">
                            {displayedNotes.length === 0 ? (
                                <div className="text-center w-100 text-muted mt-5 pt-5">
                                    <MdLightbulbOutline size={100} className="text-light mb-3" />
                                    <h5>Không có ghi chú nào.</h5>
                                </div>
                            ) : displayedNotes.map(note => (
                                <NoteCard key={note.id} note={note} isSharedCard={activeTab === 'shared' || note.is_owner == 0} viewMode={viewMode}
                                    handleUnlockNote={handleUnlockNote} handleRemoveLock={handleRemoveLock}
                                    handleLockNote={handleLockNote} handleShareNote={handleShareNote}
                                    handleEditClick={handleEditClick} handleDelete={handleDelete}
                                    handleTogglePin={handleTogglePin}
                                    onView={() => setViewingNote(note)}
                                />
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            {/* Modals */}
            {showNoteModal && (
                <>
                    <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}></div>
                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        style={{ zIndex: 1070 }}
                        onClick={() => { setShowNoteModal(false); fetchNotes(); }}
                    >
                        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                            <div className="modal-content border-0 shadow-lg rounded-4 bg-body">
                                <NoteForm
                                    noteToEdit={noteToEdit}
                                    onSaveSuccess={fetchNotes}
                                    onClearEdit={() => { setNoteToEdit(null); setShowNoteModal(false); fetchNotes(); }}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {viewingNote && (
                <>
                    <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}></div>
                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        style={{ zIndex: 1050 }}
                        onClick={() => setViewingNote(null)}
                    >
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-content border-0 rounded-3 shadow-lg overflow-hidden bg-body" style={{ backgroundColor: viewingNote.color || undefined }}>
                                <div className="modal-header border-0 pb-0 justify-content-end">
                                    <button type="button" className="btn-close" onClick={() => setViewingNote(null)}></button>
                                </div>
                                <div className="modal-body p-0">
                                    {viewingNote.image_url && (
                                        <div className="text-center">
                                            <img
                                                src={`${BACKEND_URL}/${viewingNote.image_url}`}
                                                alt="Ảnh đính kèm"
                                                className="w-100"
                                                style={{ maxHeight: '400px', objectFit: 'contain' }}
                                            />
                                        </div>
                                    )}
                                    <div className="p-4 pt-3">
                                        <h3 className={`fw-bold mb-3 ${viewingNote.color ? 'text-dark' : 'text-body'}`}>{viewingNote.title}</h3>
                                        <p className={`fs-6 ${viewingNote.color ? 'text-dark' : 'text-body'}`} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{viewingNote.content}</p>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button className="btn btn-light rounded-pill px-4" onClick={() => setViewingNote(null)}>Đóng</button>
                                    <button className="btn btn-dark rounded-pill px-4" onClick={() => { handleEditClick(viewingNote); setViewingNote(null); }}>Sửa ghi chú</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <ProfileModal
                show={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                profile={profile}
                onProfileUpdated={(updatedData) => {
                    setProfile(updatedData);
                    document.documentElement.setAttribute('data-bs-theme', updatedData.theme);
                }}
                onLogout={handleLogout}
            />
            <LabelModal show={showLabelModal} onClose={() => { setShowLabelModal(false); fetchLabelsForFilter(); }} />

            {/* Custom CSS for hover effects */}
            <style>{`
                .hover-bg-light:hover { background-color: #f1f3f4 !important; }
            `}</style>
        </div>
    );
};

export default Home;