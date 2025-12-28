import React, { useState, useRef, useEffect } from 'react';
import { useLesson } from '../../context';
import './LessonHeader.css';

const Icons = {
  new: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 3v12M3 9h12" />
    </svg>
  ),
  save: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 17H4a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h8l4 4v10a2 2 0 0 1-2 2z" />
      <path d="M12 17v-5H6v5" />
      <path d="M6 1v4h6" />
    </svg>
  ),
  delete: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 5h12M7 5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1" />
      <path d="M14 5v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5" />
      <path d="M7 8v5M11 8v5" />
    </svg>
  ),
  grid: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="16" height="16" rx="2" />
      <line x1="6" y1="1" x2="6" y2="17" />
      <line x1="12" y1="1" x2="12" y2="17" />
      <line x1="1" y1="6" x2="17" y2="6" />
      <line x1="1" y1="12" x2="17" y2="12" />
    </svg>
  ),
  import: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 12V2M9 12l-4-4M9 12l4-4" />
      <path d="M2 14v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1" />
    </svg>
  )
};

const LessonHeader = ({ showGrid, onShowGridChange, onOpenImport }) => {
  const { lesson, setLessonName, newLesson } = useLesson();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(lesson.name);
  const inputRef = useRef(null);

  useEffect(() => {
    setEditValue(lesson.name);
  }, [lesson.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed) {
      setLessonName(trimmed);
    } else {
      setEditValue(lesson.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(lesson.name);
      setIsEditing(false);
    }
  };

  const handleNewLesson = () => {
    if (window.confirm('Create a new lesson? Current lesson will be cleared.')) {
      newLesson();
    }
  };

  const handleSaveLesson = () => {
    // TODO: Implement save to API
    console.log('Save lesson:', lesson);
  };

  const handleDeleteLesson = () => {
    if (window.confirm('Delete this lesson? This action cannot be undone.')) {
      // TODO: Implement delete via API
      console.log('Delete lesson:', lesson.id);
    }
  };

  return (
    <div className="lesson-header">
      {/* Logo */}
      <div className="lesson-header-logo">
        <div className="logo-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12" fill="#4A9EFF" />
            <circle cx="14" cy="14" r="5" fill="#fff" />
          </svg>
        </div>
      </div>

      {/* Divider */}
      <div className="header-divider" />

      {/* Action Buttons */}
      <div className="header-actions">
        <button className="header-icon-btn" onClick={handleNewLesson} title="New Lesson">
          {Icons.new}
        </button>
        <button className="header-icon-btn" onClick={handleSaveLesson} title="Save Lesson">
          {Icons.save}
        </button>
        <button className="header-icon-btn header-icon-btn--danger" onClick={handleDeleteLesson} title="Delete Lesson">
          {Icons.delete}
        </button>
      </div>

      {/* Center - Lesson Name */}
      <div className="lesson-header-center">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="lesson-name-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder="Lesson name"
          />
        ) : (
          <span
            className="lesson-name-display"
            onClick={() => setIsEditing(true)}
            title="Click to edit"
          >
            {lesson.name || 'Untitled Lesson'}
          </span>
        )}
      </div>

      {/* Right Side */}
      <div className="lesson-header-right">
        <button className="header-icon-btn" onClick={onOpenImport} title="Import">
          {Icons.import}
        </button>
        <button
          className={`header-icon-btn ${showGrid ? 'active' : ''}`}
          onClick={() => onShowGridChange(!showGrid)}
          title={showGrid ? 'Hide Grid' : 'Show Grid'}
        >
          {Icons.grid}
        </button>
      </div>
    </div>
  );
};

export default LessonHeader;
