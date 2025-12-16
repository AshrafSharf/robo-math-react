import { createCommand } from '../../components/CommandEditor/utils/commandModel';

/**
 * Generates a unique lesson ID
 */
export const generateLessonId = () =>
  `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Creates a new Page object
 * @param {number} id - Unique page ID
 * @param {string} name - Page display name
 * @returns {Page}
 */
export const createPage = (id, name = `Page ${id}`) => ({
  id,
  name,
  commands: [createCommand(1)]
});

/**
 * Creates a new Lesson object
 * @param {string} name - Lesson name
 * @returns {Lesson}
 */
export const createLesson = (name = 'Untitled Lesson') => ({
  id: generateLessonId(),
  name,
  pages: [createPage(1)],
  activePageId: 1,
  createdAt: Date.now(),
  updatedAt: Date.now()
});

/**
 * Get next available page ID from lesson
 * @param {Lesson} lesson
 * @returns {number}
 */
export const getNextPageId = (lesson) => {
  if (!lesson.pages || lesson.pages.length === 0) return 1;
  return Math.max(...lesson.pages.map(p => p.id)) + 1;
};
