import { useState, useEffect } from 'react';
import { createNoteAPI, updateNoteAPI, getLabelsAPI, BACKEND_URL } from '../service/api';
import { MdEditNote, MdOutlineImage, MdAdd, MdClose, MdOutlineColorLens } from "react-icons/md";

const NoteForm = ({ noteToEdit, onSaveSuccess, onClearEdit }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [currentNoteId, setCurrentNoteId] = useState(null);
    const [saveStatus, setSaveStatus] = useState('');
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [availableLabels, setAvailableLabels] = useState([]);
    const [selectedLabels, setSelectedLabels] = useState([]);
    const [color, setColor] = useState('');
    const [showPalette, setShowPalette] = useState(false);

    const presetColors = [
        '', '#f28b82', '#fbbc04', '#fff475', '#ccff90', '#a7ffeb', 
        '#cbf0f8', '#aecbfa', '#d7aefb', '#fdcfe8', '#e6c9a8', '#e8eaed'
    ];

    useEffect(() => {
        if (noteToEdit) {
            setTitle(noteToEdit.title);
            setContent(noteToEdit.content );
            setCurrentNoteId(noteToEdit.id);
            setSaveStatus('Đã tải');
            setSelectedLabels(noteToEdit.label_ids ? noteToEdit.label_ids.split(',').map(Number) : []);
            if (noteToEdit.image_url) {
                setImagePreview(`${BACKEND_URL}/${noteToEdit.image_url}`);
            } else {
                setImagePreview(null);
            }
            setImageFile(null);
            setColor(noteToEdit.color || '');
        } else {
            setTitle('');
            setContent('');
            setSelectedLabels([]);
            setColor('');
        }
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
        setSaveStatus('');
        setSelectedLabels([]);
        setColor('');
        setShowPalette(false);
        if (typingTimeout) clearTimeout(typingTimeout);
    };

    const handleTyping = (newTitle, newContent, newImageFile = imageFile, newLabels = selectedLabels, newColor = color) => {
        setTitle(newTitle);
        setContent(newContent);
        setSaveStatus('Đang lưu...');

        if (typingTimeout) clearTimeout(typingTimeout);

        const timeout = setTimeout(async () => {
            if (!newTitle.trim() && !newContent.trim() && !newImageFile && !imagePreview) {
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

                if (currentNoteId) {
                    formData.append('id', currentNoteId);
                    await updateNoteAPI(formData);
                } else {
                    const res = await createNoteAPI(formData);
                    if (res.note_id) setCurrentNoteId(res.note_id);
                }
                
                setSaveStatus('Đã lưu');
                if (onSaveSuccess) onSaveSuccess();
            } catch (err) {
                setSaveStatus('Lỗi lưu');
            }
        }, 1000);
        setTypingTimeout(timeout);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            handleTyping(title, content, file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        handleTyping(title, content, null);
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
        <div className="w-100" style={{ backgroundColor: color || 'transparent', transition: 'background-color 0.3s' }}>
            <div className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small fw-medium">{saveStatus}</span>
                    <button type="button" className="btn btn-sm btn-light rounded-circle p-2 text-secondary hover-bg-light bg-transparent" onClick={handleCreateNew} title="Đóng">
                        <MdClose size={20} />
                    </button>
                </div>
                
                <input 
                    className={`form-control border-0 bg-transparent fw-bold mb-2 px-1 shadow-none ${color ? 'text-dark' : 'text-body'}`} 
                    style={{ fontSize: '1.25rem', letterSpacing: '0.01428571em' }}
                    placeholder="Tiêu đề" 
                    value={title} 
                    onChange={(e) => handleTyping(e.target.value, content)} 
                />
                
                <textarea 
                    className={`form-control border-0 bg-transparent px-1 shadow-none mb-3 ${color ? 'text-dark' : 'text-body'}`} 
                    rows="4" 
                    style={{ fontSize: '1rem', letterSpacing: '0.01428571em', resize: 'none' }}
                    placeholder="Tạo ghi chú..." 
                    value={content} 
                    onChange={(e) => handleTyping(title, e.target.value)} 
                />
                
                {availableLabels.length > 0 && (
                    <div className="mb-3 d-flex flex-wrap gap-2 align-items-center px-1">
                        {availableLabels.map(label => (
                            <button
                                key={label.id}
                                type="button"
                                onClick={() => toggleLabel(label.id)}
                                className={`btn btn-sm rounded-pill transition-all px-3 py-1 ${
                                    selectedLabels.includes(label.id) 
                                    ? 'btn-dark' 
                                    : (color ? 'border-dark text-dark border-opacity-50' : 'btn-outline-secondary border')
                                }`}
                                style={{ fontSize: '0.8rem', fontWeight: '500' }}
                            >
                                {label.name}
                            </button>
                        ))}
                    </div>
                )}
                
                {imagePreview && (
                    <div className="position-relative d-inline-block mb-3 px-1">
                        <img src={imagePreview} alt="Preview" className="rounded-3" style={{ maxHeight: '200px', objectFit: 'contain', maxWidth: '100%' }} />
                        <button className="btn btn-sm btn-dark position-absolute top-0 end-0 m-2 rounded-circle p-1 d-flex" onClick={handleRemoveImage} title="Xóa ảnh">
                            <MdClose size={16} />
                        </button>
                    </div>
                )}
                
                <div className="d-flex justify-content-between align-items-center pt-2 px-1">
                    <div className="d-flex gap-2 position-relative">
                        <label className="btn btn-light rounded-circle p-2 text-secondary hover-bg-light bg-transparent m-0 cursor-pointer d-flex" title="Thêm ảnh">
                            <MdOutlineImage size={22} />
                            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                        </label>
                        
                        <button 
                            type="button" 
                            className="btn btn-light rounded-circle p-2 text-secondary hover-bg-light bg-transparent m-0 d-flex" 
                            title="Đổi màu"
                            onClick={() => setShowPalette(!showPalette)}
                        >
                            <MdOutlineColorLens size={22} />
                        </button>

                        {showPalette && (
                            <div className="position-absolute bottom-100 start-0 mb-2 p-2 bg-body border rounded-3 shadow d-flex flex-wrap gap-2" style={{ width: '180px', zIndex: 10 }}>
                                {presetColors.map((c, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => {
                                            setColor(c);
                                            handleTyping(title, content, imageFile, selectedLabels, c);
                                            setShowPalette(false);
                                        }}
                                        className="rounded-circle border"
                                        style={{ 
                                            width: '30px', height: '30px', cursor: 'pointer', 
                                            backgroundColor: c || 'var(--bs-body-bg)',
                                            borderColor: color === c ? '#000' : 'var(--bs-border-color)' 
                                        }}
                                        title={c === '' ? 'Mặc định' : 'Màu'}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <button 
                        className="btn btn-light rounded-3 px-4 fw-medium text-body hover-bg-light bg-transparent border" 
                        onClick={handleCreateNew}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoteForm;