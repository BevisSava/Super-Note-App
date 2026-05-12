import React, { useState } from 'react';
import { BACKEND_URL } from '../service/api';
import { AiFillPicture } from "react-icons/ai";
import { MdPushPin, MdOutlinePushPin, MdOutlineLock, MdOutlineLockOpen, MdOutlineShare, MdEdit, MdDelete } from "react-icons/md";

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
        <div className={`d-flex gap-2 align-items-center transition-all ${isHovered || viewMode === 'list' ? 'opacity-100' : 'opacity-0'}`} style={{ transition: 'opacity 0.2s' }}>
            {isLocked && (
                <button className="btn btn-sm btn-light rounded-circle p-2 text-secondary d-flex" onClick={(e) => { e.stopPropagation(); handleUnlockNote(note.id); }} title="Giải mã">
                    <MdOutlineLockOpen size={18} />
                </button>
            )}
            {!isLocked && note.temp_unlocked && !isSharedCard && (
                <button className="btn btn-sm btn-light rounded-circle p-2 text-danger d-flex" onClick={(e) => { e.stopPropagation(); handleRemoveLock(note.id); }} title="Gỡ khóa">
                    <MdOutlineLockOpen size={18} />
                </button>
            )}

            {!isLocked && !note.temp_unlocked && !isSharedCard && (
                <>
                    <button className="btn btn-sm btn-light rounded-circle p-2 text-secondary d-flex hover-bg-light" onClick={(e) => { e.stopPropagation(); handleLockNote(note.id); }} title="Khóa ghi chú">
                        <MdOutlineLock size={18} />
                    </button>
                    <button className="btn btn-sm btn-light rounded-circle p-2 text-secondary d-flex hover-bg-light" onClick={(e) => { e.stopPropagation(); handleShareNote(note.id); }} title="Chia sẻ">
                        <MdOutlineShare size={18} />
                    </button>
                </>
            )}

            {!isLocked && !note.temp_unlocked && (
                <>
                    <button className="btn btn-sm btn-light rounded-circle p-2 text-secondary d-flex hover-bg-light" onClick={(e) => { e.stopPropagation(); handleEditClick(note); }} title="Sửa">
                        <MdEdit size={18} />
                    </button>
                    {!isSharedCard && (
                        <button className="btn btn-sm btn-light rounded-circle p-2 text-secondary d-flex hover-bg-light" onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }} title="Xóa">
                            <MdDelete size={18} />
                        </button>
                    )}
                </>
            )}
        </div>
    );

    return (
        <div className={colClass}>
            <div
                className={`card h-100 border rounded-3 position-relative`}
                style={{
                    cursor: isLocked ? 'default' : 'default',
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                    boxShadow: isHovered ? '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)' : 'none',
                    borderColor: isHovered ? 'transparent' : 'var(--bs-border-color)',
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
                    style={{ zIndex: 10, color: isPinned ? '#000' : '#5f6368', transition: 'opacity 0.2s' }}
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
                        style={{ height: '180px', objectFit: 'cover', borderTopLeftRadius: '0.375rem', borderTopRightRadius: '0.375rem' }}
                    />
                )}

                <div className={`card-body ${viewMode === 'list' ? 'd-flex align-items-center py-2 px-3' : 'p-3 pb-2'}`}>

                    {viewMode === 'list' && note.image_url && !isLocked && (
                        <div className="me-3 text-secondary" title="Ghi chú có ảnh"><AiFillPicture size={20} /></div>
                    )}

                    <div className={viewMode === 'list' ? 'flex-grow-1' : ''}>
                        <h5 className={`card-title fw-bold mb-2 pe-4 ${isLocked ? 'text-secondary' : (note.color ? 'text-dark' : 'text-body')}`} style={{ fontSize: '1rem', letterSpacing: '0.01428571em' }}>
                            {isLocked ? <MdOutlineLock size={18} className="me-1 mb-1" /> : ''}{note.title}
                        </h5>

                        {viewMode === 'grid' && (
                            <p className={`card-text mb-3 ${note.color ? 'text-dark' : 'text-body'}`} style={{
                                whiteSpace: 'pre-wrap',
                                fontSize: '0.875rem',
                                letterSpacing: '0.01428571em',
                                display: '-webkit-box',
                                WebkitLineClamp: 8,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>
                                {isLocked ? <span className="fst-italic text-secondary">Nội dung đã được bảo mật.</span> : note.content}
                            </p>
                        )}

                        {note.label_names && !isLocked && (
                            <div className="mb-1 d-flex flex-wrap gap-1">
                                {note.label_names.split(',').map((labelName, index) => (
                                    <span key={index} className="badge bg-transparent text-secondary border rounded-pill fw-normal px-2 py-1" style={{ fontSize: '0.75rem' }}>
                                        {labelName}
                                    </span>
                                ))}
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
                    <div className="card-footer bg-transparent border-0 px-3 pb-2 pt-0 d-flex justify-content-between align-items-center mt-auto" style={{ minHeight: '40px' }}>
                        <ActionButtons />
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoteCard;