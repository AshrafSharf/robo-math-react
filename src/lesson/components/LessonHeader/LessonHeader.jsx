import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useLesson } from '../../context';
import { AssetManagerModal } from '../../../components/AssetManager';
import { createLesson as apiCreateLesson, updateLesson, deleteLesson } from '../../../api';
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
  assets: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="14" height="14" rx="2" />
      <circle cx="6.5" cy="6.5" r="1.5" />
      <path d="M16 12l-4-4-6 6" />
      <path d="M10 16l-4-4-4 4" />
    </svg>
  )
};

const LessonHeader = () => {
  const { lesson, setLesson, setLessonName, newLesson } = useLesson();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(lesson.name);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  // Check if lesson has been saved (has a server-side ID)
  // Local IDs start with 'lesson_', server IDs are UUIDs
  const hasLessonId = lesson.id && !lesson.id.startsWith('lesson_');

  useEffect(() => {
    setEditValue(lesson.name);
  }, [lesson.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== lesson.name) {
      setLessonName(trimmed);
      // If lesson exists on server, update title immediately
      if (hasLessonId) {
        try {
          await updateLesson(lesson.id, { title: trimmed });
          toast.success('Title updated');
        } catch (err) {
          console.error('Title update failed:', err);
          toast.error(`Title update failed: ${err.message}`);
        }
      }
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

  const handleSaveLesson = async () => {
    console.log('handleSaveLesson called, saving:', saving, 'hasLessonId:', hasLessonId);
    if (saving) return;
    setSaving(true);

    try {
      // Prepare content for API
      const content = {
        pages: lesson.pages,
        latexVariables: lesson.latexVariables || [],
        assets: lesson.assets || [],
      };

      if (hasLessonId) {
        // Update existing lesson
        const payload = {
          title: lesson.name,
          content,
        };
        console.log('Updating lesson:', lesson.id);
        console.log('PUT payload:', JSON.stringify(payload, null, 2));
        await updateLesson(lesson.id, payload);
        console.log('Update successful');
        toast.success('Lesson saved');
      } else {
        // Create new lesson
        console.log('Creating new lesson');
        const response = await apiCreateLesson({
          title: lesson.name,
          content,
        });
        console.log('Create response:', response);
        // Update local lesson with server ID
        setLesson({
          ...lesson,
          id: response.lesson.id,
          updatedAt: Date.now(),
        });
        toast.success('Lesson created');
      }
    } catch (err) {
      console.error('Save failed:', err);
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!hasLessonId) {
      // Just clear local lesson if not saved to server
      if (window.confirm('Clear this lesson?')) {
        newLesson();
      }
      return;
    }

    if (window.confirm('Delete this lesson? This action cannot be undone.')) {
      try {
        await deleteLesson(lesson.id);
        toast.success('Lesson deleted');
        newLesson();
      } catch (err) {
        console.error('Delete failed:', err);
        toast.error(`Delete failed: ${err.message}`);
      }
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
        <button
          className="header-icon-btn"
          onClick={handleSaveLesson}
          disabled={saving}
          title={saving ? 'Saving...' : 'Save Lesson'}
        >
          {Icons.save}
        </button>
        <button className="header-icon-btn header-icon-btn--danger" onClick={handleDeleteLesson} title="Delete Lesson">
          {Icons.delete}
        </button>
        <div className="header-divider" />
        <button
          className={`header-icon-btn ${isAssetModalOpen ? 'active' : ''}`}
          onClick={() => setIsAssetModalOpen(true)}
          disabled={!hasLessonId}
          title={hasLessonId ? 'Assets' : 'Save lesson first to manage assets'}
        >
          {Icons.assets}
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

      {/* Asset Manager Modal */}
      <AssetManagerModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        lessonId={hasLessonId ? lesson.id : null}
      />
    </div>
  );
};

export default LessonHeader;
