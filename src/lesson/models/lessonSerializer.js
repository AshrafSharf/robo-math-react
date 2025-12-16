import { createLesson, createPage } from './lessonModel';

/**
 * Serialize lesson to JSON string
 * @param {Lesson} lesson
 * @returns {string}
 */
export const serializeLesson = (lesson) => {
  return JSON.stringify(lesson, null, 2);
};

/**
 * Deserialize JSON string to lesson object
 * Validates structure and provides defaults
 * @param {string} jsonString
 * @returns {Lesson}
 */
export const deserializeLesson = (jsonString) => {
  const parsed = JSON.parse(jsonString);
  return validateLesson(parsed);
};

/**
 * Validate and normalize lesson structure
 * Ensures all required fields exist with defaults
 * @param {object} lesson
 * @returns {Lesson}
 */
export const validateLesson = (lesson) => {
  const defaultLesson = createLesson();

  // Validate pages array
  const pages = Array.isArray(lesson.pages) && lesson.pages.length > 0
    ? lesson.pages.map(p => ({
        ...createPage(p.id),
        ...p,
        commands: Array.isArray(p.commands) ? p.commands : []
      }))
    : [createPage(1)];

  // Ensure activePageId is valid
  const activePageId = pages.some(p => p.id === lesson.activePageId)
    ? lesson.activePageId
    : pages[0].id;

  return {
    ...defaultLesson,
    ...lesson,
    pages,
    activePageId
  };
};
