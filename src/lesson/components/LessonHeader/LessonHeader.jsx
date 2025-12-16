import React, { useCallback } from 'react';
import { useLesson } from '../../context';
import { useLessonPersistence } from '../../context/useLessonPersistence';
import './LessonHeader.css';

const LessonHeader = ({ showGrid, onShowGridChange }) => {
  const { lesson, setLessonName, newLesson } = useLesson();
  const { downloadLesson } = useLessonPersistence(lesson, null);

  const handleNewLesson = useCallback(() => {
    if (window.confirm('Create a new lesson? Current lesson will be cleared.')) {
      newLesson();
    }
  }, [newLesson]);

  return (
    <div className="lesson-header">
      <button
        className="lesson-header-btn"
        onClick={handleNewLesson}
        title="New Lesson"
      >
        New
      </button>
      <input
        type="text"
        className="lesson-name-input"
        value={lesson.name}
        onChange={(e) => setLessonName(e.target.value)}
        placeholder="Lesson name"
      />
      <button
        className="lesson-header-btn"
        onClick={downloadLesson}
        title="Download Lesson"
      >
        Download
      </button>
      <label className="grid-toggle">
        <input
          type="checkbox"
          checked={showGrid}
          onChange={(e) => onShowGridChange(e.target.checked)}
        />
        <span>Grid</span>
      </label>
    </div>
  );
};

export default LessonHeader;
