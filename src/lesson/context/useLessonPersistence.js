import { useEffect, useCallback, useRef } from 'react';
import { serializeLesson, deserializeLesson } from '../models/lessonSerializer';

const STORAGE_KEY = 'robomath_lesson';
const DEBOUNCE_MS = 1000;

/**
 * Hook for lesson persistence (localStorage + download)
 * @param {Lesson} lesson - Current lesson state
 * @param {Function} setLesson - Function to update lesson state
 */
export function useLessonPersistence(lesson, setLesson) {
  const timerRef = useRef(null);

  // Auto-save to localStorage (debounced)
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      try {
        const serialized = serializeLesson(lesson);
        console.log('Saving to localStorage:', lesson.pages[0]?.commands?.length, 'commands');
        localStorage.setItem(STORAGE_KEY, serialized);
      } catch (e) {
        console.warn('Failed to save lesson to localStorage:', e);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [lesson]);

  // Load from localStorage
  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const lesson = deserializeLesson(stored);
        console.log('Loaded from localStorage:', lesson.pages[0]?.commands?.length, 'commands', lesson.pages[0]?.commands?.[0]?.expression);
        return lesson;
      }
    } catch (e) {
      console.warn('Failed to load lesson from localStorage:', e);
    }
    return null;
  }, []);

  // Download lesson as JSON file
  const downloadLesson = useCallback(() => {
    const json = serializeLesson(lesson);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lesson.name.replace(/[^a-z0-9]/gi, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [lesson]);

  // Clear localStorage
  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }
  }, []);

  return { loadFromStorage, downloadLesson, clearStorage };
}
