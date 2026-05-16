import React, { useState } from 'react';
import { BACKEND_URL } from '../service/api';
import { AiFillPicture } from "react-icons/ai";
import { MdPushPin, MdOutlinePushPin, MdOutlineLock, MdOutlineLockOpen, MdOutlineShare, MdEdit, MdDelete, MdInsertDriveFile } from "react-icons/md";

const NoteCard = ({
    note,
    isSharedCard,
    viewMode,
    handleUnlockNote,
    handleRemoveLock,
    handleLockNote,
    handleShareNote,
    handleEditClick,
    handleDelete,
    handleTogglePin,
    onView
}) => {
    const isLocked = note.is_locked === true;
    const isPinned = note.is_pinned === 1 || note.is_pinned === true;
    const colClass = viewMode === 'grid' ? 'col-md-4 col-lg-3 mb-3' : 'col-12 mb-2';

    const [isHovered, setIsHovered] = useState(false);

    const ActionButtons = () => (
        <div className="d-flex gap-2 align-items-center">
            {isLocked && (
                <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleUnlockNote(note.id); }} title="Giải mã">
                    <MdOutlineLockOpen size={18} />
                </button>
            )}
            {!isLocked && note.temp_unlocked && !isSharedCard && (
                <button className="action-btn text-danger" onClick={(e) => { e.stopPropagation(); handleRemoveLock(note.id); }} title="Gỡ khóa">
                    <MdOutlineLockOpen size={18} />
                </button>
            )}

            {!isLocked && !note.temp_unlocked && !isSharedCard && (
                <>
                    <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleLockNote(note.id); }} title="Khóa ghi chú">
                        <MdOutlineLock size={18} />
                    </button>
                    <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleShareNote(note.id); }} title="Chia sẻ">
                        <MdOutlineShare size={18} />
                    </button>
                </>
            )}

            {!isLocked && !note.temp_unlocked && (
                <>
                    <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleEditClick(note); }} title="Sửa">
                        <MdEdit size={18} />
                    </button>
                    {!isSharedCard && (
                        <button className="action-btn text-danger" onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }} title="Xóa">
                            <MdDelete size={18} />
                        </button>
                    )}
                </>
            )}
        </div>
    );

    return (
        <div className={`${colClass} fade-in`}>
            <div
                className={`note-card h-100 position-relative`}
                style={{
                    backgroundColor: note.color || undefined
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => {
                    if (!isLocked && onView) onView();
                }}
            >
                <button
                    className={`btn btn-link text-decoration-none position-absolute top-0 end-0 p-2 m-1 transition-all ${isPinned || isHovered ? 'opacity-100' : 'opacity-0'}`}
                    style={{ zIndex: 10, color: isPinned ? '#000' : '#5f6368' }}
                    onClick={(e) => { e.stopPropagation(); handleTogglePin(note.id, isPinned ? 0 : 1); }}
                    title={isPinned ? "Bỏ ghim" : "Ghim ghi chú"}
                >
                    {isPinned ? <MdPushPin size={22} /> : <MdOutlinePushPin size={22} />}
                </button>

                {viewMode === 'grid' && note.image_url && !isLocked && (
                    <img
                        src={`${BACKEND_URL}/${note.image_url}`}
                        className="card-img-top border-bottom"
                        alt="Ảnh đính kèm"
                        style={{ height: '180px', objectFit: 'cover' }}
                    />
                )}

                <div className={`card-body ${viewMode === 'list' ? 'd-flex align-items-center py-2 px-3' : 'p-3 pb-2'}`}>

                    {viewMode === 'list' && note.image_url && !isLocked && (
                        <div className="me-3 text-secondary" title="Ghi chú có ảnh"><AiFillPicture size={20} /></div>
                    )}

                    <div className={viewMode === 'list' ? 'flex-grow-1' : ''}>
                        <h5 className={`card-title fw-bold mb-2 pe-4 ${isLocked ? 'text-secondary' : (note.color ? 'text-dark' : 'text-body')}`} style={{ fontSize: 'var(--title-font-size)' }}>
                            {isLocked ? <MdOutlineLock size={18} className="me-1 mb-1" /> : ''}{note.title || (isLocked ? 'Đã khóa' : 'Không tiêu đề')}
                        </h5>

                        {viewMode === 'grid' && (
                            <p className={`card-text mb-3 ${note.color ? 'text-dark' : 'text-body'}`} style={{
                                whiteSpace: 'pre-wrap',
                                fontSize: 'var(--base-font-size)',
                                opacity: 0.85,
                                display: '-webkit-box',
                                WebkitLineClamp: 8,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>
                                {isLocked ? <span className="fst-italic text-secondary">Nội dung đã được bảo mật.</span> : note.content}
                            </p>
                        )}

                        {note.label_names && !isLocked && (
                            <div className="mb-2 d-flex flex-wrap gap-1">
                                {note.label_names.split(',').map((labelName, index) => (
                                    <span key={index} className="badge bg-transparent text-secondary border rounded-pill fw-normal px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                        {labelName}
                                    </span>
                                ))}
                            </div>
                        )}

                        {note.file_url && !isLocked && (
                            <div className="file-chip mb-2" onClick={(e) => e.stopPropagation()}>
                                <MdInsertDriveFile className="text-secondary" size={16} />
                                <a href={`${BACKEND_URL}/${note.file_url}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-muted text-truncate" style={{ maxWidth: '140px' }}>
                                    {note.file_url.split('/').pop().split('_').slice(0, -1).join('_') || 'Tệp đính kèm'}
                                </a>
                            </div>
                        )}

                        {isSharedCard && !isLocked && (
                            <div className="mt-3 pt-2 border-top text-muted" style={{ fontSize: '0.75rem' }}>
                                <div className="d-flex align-items-center gap-1 mb-1">
                                    <span className="fw-medium">Shared by:</span> {note.owner_name || note.owner_email}
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className={`badge rounded-pill ${note.permission === 'edit' ? 'bg-success' : 'bg-secondary'} bg-opacity-10 text-${note.permission === 'edit' ? 'success' : 'secondary'} border border-${note.permission === 'edit' ? 'success' : 'secondary'} border-opacity-25`}>
                                        {note.permission === 'edit' ? 'Can Edit' : 'Read Only'}
                                    </span>
                                    <span>{new Date(note.shared_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {viewMode === 'list' && (
                        <div className="ms-3 d-flex gap-2 align-items-center pe-2">
                            <ActionButtons />
                        </div>
                    )}
                </div>

                {viewMode === 'grid' && (
                    <div className="card-actions px-3 pb-3 d-flex justify-content-between align-items-center mt-auto">
                        <ActionButtons />
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoteCard;