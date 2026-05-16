import { useState, useEffect, useRef } from 'react';
import { createNoteAPI, updateNoteAPI, getLabelsAPI, BACKEND_URL } from '../service/api';
import { MdEditNote, MdOutlineImage, MdAdd, MdClose, MdOutlineColorLens, MdAttachFile, MdInsertDriveFile, MdPersonAdd } from "react-icons/md";
import ShareModal from './ShareModal';

const NoteForm = ({ noteToEdit, onSaveSuccess, onClearEdit, isViewing = false, onEditMode }) => {
    const [title, setTitle] = useState(noteToEdit?.title || '');
    const [content, setContent] = useState(noteToEdit?.content || '');
    const [currentNoteId, setCurrentNoteId] = useState(noteToEdit?.id || null);
    const [saveStatus, setSaveStatus] = useState(noteToEdit ? 'Đã tải' : '');
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(noteToEdit?.image_url ? `${BACKEND_URL}/${noteToEdit.image_url}` : null);
    const [attachedFile, setAttachedFile] = useState(null);
    const [attachedFileUrl, setAttachedFileUrl] = useState(noteToEdit?.file_url ? `${BACKEND_URL}/${noteToEdit.file_url}` : null);
    const [availableLabels, setAvailableLabels] = useState([]);
    const [selectedLabels, setSelectedLabels] = useState(noteToEdit?.label_ids ? noteToEdit.label_ids.split(',').map(Number) : []);
    const [color, setColor] = useState(noteToEdit?.color || '');
    const [showPalette, setShowPalette] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const wsRef = useRef(null);
    const isOwner = !noteToEdit || noteToEdit.is_owner == 1;
    const isReadOnly = isViewing || (noteToEdit && noteToEdit.is_owner == 0 && noteToEdit.permission === 'read');

    const presetColors = [
        '', '#f28b82', '#fbbc04', '#fff475', '#ccff90', '#a7ffeb', 
        '#cbf0f8', '#aecbfa', '#d7aefb', '#fdcfe8', '#e6c9a8', '#e8eaed'
    ];

    useEffect(() => {
        if (noteToEdit) {
            setTitle(noteToEdit.title || '');
            setContent(noteToEdit.content || '');
            setCurrentNoteId(noteToEdit.id);
            setSaveStatus('Đã tải');
            setSelectedLabels(noteToEdit.label_ids ? noteToEdit.label_ids.split(',').map(Number) : []);
            if (noteToEdit.image_url) {
                setImagePreview(`${BACKEND_URL}/${noteToEdit.image_url}`);
            } else {
                setImagePreview(null);
            }
            if (noteToEdit.file_url) {
                setAttachedFileUrl(`${BACKEND_URL}/${noteToEdit.file_url}`);
            } else {
                setAttachedFileUrl(null);
            }
            setImageFile(null);
            setAttachedFile(null);
            setColor(noteToEdit.color || '');

            // Connect WebSocket
            const wsUrl = import.meta.env.VITE_WS_URL;
            const ws = new WebSocket(wsUrl);
            ws.onopen = () => {
                ws.send(JSON.stringify({ action: 'join', note_id: noteToEdit.id }));
            };
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.action === 'update' && data.note_id === noteToEdit.id) {
                    setTitle(data.title);
                    setContent(data.content);
                }
            };
            wsRef.current = ws;

        } else {
            setTitle('');
            setContent('');
            setSelectedLabels([]);
            setColor('');
            setAttachedFileUrl(null);
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [noteToEdit]);

    useEffect(() => {
        const fetchLabels = async () => {
            try {
                const res = await getLabelsAPI();
                if (res.data.status === 'success') {
                    setAvailableLabels(res.data.data);
                }
            } catch (error) { console.error("Lỗi lấy nhãn", error); }
        };
        fetchLabels();
    }, []);

    const resetFormStates = () => {
        setTitle('');
        setContent('');
        setCurrentNoteId(null);
        setImageFile(null);
        setImagePreview(null);
        setAttachedFile(null);
        setAttachedFileUrl(null);
        setSaveStatus('');
        setSelectedLabels([]);
        setColor('');
        setShowPalette(false);
        if (typingTimeout) clearTimeout(typingTimeout);
    };

    const handleTyping = (newTitle, newContent, newImageFile = imageFile, newLabels = selectedLabels, newColor = color, newAttachedFile = attachedFile, isRemovingImage = false, isRemovingFile = false) => {
        setTitle(newTitle);
        setContent(newContent);
        setSaveStatus('Đang lưu...');

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && currentNoteId) {
            wsRef.current.send(JSON.stringify({
                action: 'edit',
                note_id: currentNoteId,
                title: newTitle,
                content: newContent
            }));
        }

        if (typingTimeout) clearTimeout(typingTimeout);

        const timeout = setTimeout(async () => {
            if (!newTitle.trim() && !newContent.trim() && !newImageFile && !imagePreview && !newAttachedFile && !attachedFileUrl && !isRemovingImage && !isRemovingFile) {
                setSaveStatus('');
                return;
            }
            
            try {
                const formData = new FormData();
                formData.append('title', newTitle);
                formData.append('content', newContent);
                formData.append('label_ids', JSON.stringify(newLabels));
                if (newColor) formData.append('color', newColor);
                if (newImageFile) formData.append('image', newImageFile);
                if (newAttachedFile) formData.append('attached_file', newAttachedFile);

                if (currentNoteId) {
                    formData.append('id', currentNoteId);
                }
                
                // Thêm flag xóa nếu cần
                if (isRemovingImage || (!newImageFile && !imagePreview)) formData.append('remove_image', '1');
                if (isRemovingFile || (!newAttachedFile && !attachedFileUrl)) formData.append('remove_file', '1');

                const res = await (currentNoteId ? updateNoteAPI(formData) : createNoteAPI(formData));
                if (res.note_id && !currentNoteId) setCurrentNoteId(res.note_id);
                
                // Tránh upload lại cùng một file khi gõ phím tiếp theo
                if (newImageFile) setImageFile(null);
                if (newAttachedFile) setAttachedFile(null);

                setSaveStatus('Đã lưu');
                if (onSaveSuccess) onSaveSuccess();
            } catch (err) {
                setSaveStatus('Lỗi lưu');
                if (err.response && err.response.data && err.response.data.message) {
                    toast.error(err.response.data.message);
                }
            }
        }, 1000);
        setTypingTimeout(timeout);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            handleTyping(title, content, file, selectedLabels, color, attachedFile);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        handleTyping(title, content, null, selectedLabels, color, attachedFile, true, false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachedFile(file);
            setAttachedFileUrl(URL.createObjectURL(file)); // Cập nhật URL xem trước ngay lập tức
            handleTyping(title, content, imageFile, selectedLabels, color, file);
        }
    };

    const handleRemoveFile = () => {
        setAttachedFile(null);
        setAttachedFileUrl(null);
        handleTyping(title, content, imageFile, selectedLabels, color, null, false, true); 
    };

    const toggleLabel = (labelId) => {
        const updatedLabels = selectedLabels.includes(labelId)
            ? selectedLabels.filter(id => id !== labelId)
            : [...selectedLabels, labelId];
            
        setSelectedLabels(updatedLabels);
        handleTyping(title, content, imageFile, updatedLabels);
    };

    const handleCreateNew = () => {
        resetFormStates(); 
        if (onClearEdit) onClearEdit();
    };

    return (
        <div className="w-100 rounded-4 overflow-hidden" style={{ backgroundColor: color || 'transparent', transition: 'background-color 0.3s' }}>
            <div className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        {saveStatus === 'Đang lưu...' ? (
                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Lưu...</>
                        ) : (saveStatus || 'Ghi chú mới')}
                    </span>
                    <button type="button" className="btn btn-light rounded-circle p-2 text-secondary hover-bg-light border-0 d-flex" onClick={handleCreateNew} title="Đóng">
                        <MdClose size={20} />
                    </button>
                </div>
                
                <input 
                    className={`form-control border-0 bg-transparent fw-bold mb-2 px-0 shadow-none ${color ? 'text-dark' : 'text-body'}`} 
                    style={{ fontSize: 'var(--modal-title-size)', letterSpacing: '-0.5px' }}
                    placeholder="Tiêu đề" 
                    value={title} 
                    onChange={(e) => handleTyping(e.target.value, content)} 
                    readOnly={isReadOnly}
                />
                
                <textarea 
                    className={`form-control border-0 bg-transparent px-0 shadow-none mb-3 ${color ? 'text-dark' : 'text-body'}`} 
                    rows="6" 
                    style={{ fontSize: 'var(--modal-text-size)', lineHeight: '1.6', resize: 'none' }}
                    placeholder="Bắt đầu ghi chú..." 
                    value={content} 
                    onChange={(e) => handleTyping(title, e.target.value)} 
                    readOnly={isReadOnly}
                />
                
                {availableLabels.length > 0 && (
                    <div className="mb-4 d-flex flex-wrap gap-2 align-items-center">
                        {availableLabels.map(label => (
                            <button
                                key={label.id}
                                type="button"
                                onClick={() => toggleLabel(label.id)}
                                className={`btn btn-sm rounded-pill px-3 py-1 border transition-all ${
                                    selectedLabels.includes(label.id) 
                                    ? (color ? 'btn-dark' : 'btn-dark') 
                                    : (color ? 'border-dark text-dark border-opacity-25 bg-transparent' : 'bg-light text-secondary border-opacity-50')
                                }`}
                                style={{ fontSize: '0.75rem', fontWeight: '600' }}
                            >
                                {label.name}
                            </button>
                        ))}
                    </div>
                )}
                
                {imagePreview && (
                    <div className="position-relative d-inline-block mb-4">
                        <img src={imagePreview} alt="Preview" className="rounded-4 shadow-sm border" style={{ maxHeight: '300px', objectFit: 'contain', maxWidth: '100%' }} />
                        {!isViewing && (
                            <button className="btn btn-sm btn-dark position-absolute top-0 end-0 m-3 rounded-circle p-1 d-flex shadow" onClick={handleRemoveImage} title="Xóa ảnh">
                                <MdClose size={18} />
                            </button>
                        )}
                    </div>
                )}

                {attachedFileUrl && (
                    <div className="file-chip mb-4 shadow-sm" style={{ padding: '8px 16px' }}>
                        <MdInsertDriveFile size={22} className="text-secondary" />
                        <div className="d-flex flex-column">
                            <a href={attachedFileUrl} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-dark fw-bold text-truncate" style={{ maxWidth: '250px', fontSize: '0.9rem' }}>
                                {attachedFile ? attachedFile.name : (attachedFileUrl.split('/').pop().split('_').slice(0, -1).join('_') || 'Tệp đính kèm')}
                            </a>
                        </div>
                        {!isViewing && (
                            <button className="btn btn-link text-danger p-1 ms-2" onClick={handleRemoveFile} title="Xóa tệp">
                                <MdClose size={20} />
                            </button>
                        )}
                    </div>
                )}
                
                <div className="d-flex justify-content-between align-items-center pt-3 border-top border-dark border-opacity-10">
                    <div className="d-flex gap-2 position-relative">
                        {!isReadOnly && !isViewing && (
                            <>
                                <label className="btn btn-light rounded-circle p-2 text-secondary hover-bg-light border-0 cursor-pointer d-flex" title="Thêm ảnh">
                                    <MdOutlineImage size={24} />
                                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                </label>
                                
                                <label className="btn btn-light rounded-circle p-2 text-secondary hover-bg-light border-0 cursor-pointer d-flex" title="Đính kèm tệp">
                                    <MdAttachFile size={24} />
                                    <input type="file" hidden onChange={handleFileChange} />
                                </label>
                                
                                <button 
                                    type="button" 
                                    className="btn btn-light rounded-circle p-2 text-secondary hover-bg-light border-0 d-flex" 
                                    title="Đổi màu"
                                    onClick={() => setShowPalette(!showPalette)}
                                >
                                    <MdOutlineColorLens size={24} />
                                </button>
                            </>
                        )}
                        
                        {isOwner && currentNoteId && !isViewing && (
                            <button 
                                type="button" 
                                className="btn btn-light rounded-circle p-2 text-secondary hover-bg-light border-0 d-flex" 
                                title="Chia sẻ"
                                onClick={() => setShowShareModal(true)}
                            >
                                <MdPersonAdd size={22} />
                            </button>
                        )}

                        {showPalette && (
                            <div className="color-palette">
                                {presetColors.map((c, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => {
                                            setColor(c);
                                            handleTyping(title, content, imageFile, selectedLabels, c);
                                            setShowPalette(false);
                                        }}
                                        className={`color-swatch ${color === c ? 'active' : ''}`}
                                        style={{ 
                                            backgroundColor: c || 'var(--card-bg)',
                                        }}
                                        title={c === '' ? 'Mặc định' : 'Màu'}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="d-flex gap-2">
                        {isViewing ? (
                            <button 
                                className="btn btn-dark rounded-3 px-4 fw-bold shadow-sm"
                                onClick={onEditMode}
                            >
                                Sửa ghi chú
                            </button>
                        ) : (
                            <button 
                                className={`btn rounded-3 px-4 fw-bold shadow-sm transition-all ${color ? 'btn-dark' : 'btn-outline-dark'}`}
                                style={{ padding: '10px 24px' }}
                                onClick={handleCreateNew}
                            >
                                Xong
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <ShareModal 
                show={showShareModal} 
                onClose={() => setShowShareModal(false)} 
                noteId={currentNoteId} 
            />
        </div>
    );
};

export default NoteForm;