/**
 * Lesson API
 *
 * API functions for managing lessons.
 */

import { get, post, put, del } from './apiClient.js';

// Default channel ID from env
const DEFAULT_CHANNEL_ID = import.meta.env.VITE_DEFAULT_CHANNEL_ID;

/**
 * Create a new lesson
 * @param {Object} lessonData - { channel_id, title, description, content, tags, thumbnail_url }
 * @returns {Promise<{ lesson: Object }>}
 */
export async function createLesson(lessonData) {
  // Use provided channel_id or default from env
  const data = {
    channel_id: lessonData.channel_id || DEFAULT_CHANNEL_ID,
    ...lessonData,
  };
  const response = await post('/lessons', data);
  return response;
}

/**
 * Get a lesson by ID
 * @param {string} lessonId - UUID of the lesson
 * @returns {Promise<{ lesson: Object }>}
 */
export async function getLesson(lessonId) {
  const response = await get(`/lessons/${lessonId}`);
  return response;
}

/**
 * Update an existing lesson
 * @param {string} lessonId - UUID of the lesson
 * @param {Object} lessonData - { title, description, content, tags }
 * @returns {Promise<{ lesson: Object }>}
 */
export async function updateLesson(lessonId, lessonData) {
  const response = await put(`/lessons/${lessonId}`, lessonData);
  return response;
}

/**
 * Delete a lesson
 * @param {string} lessonId - UUID of the lesson
 * @returns {Promise<{ message: string }>}
 */
export async function deleteLesson(lessonId) {
  const response = await del(`/lessons/${lessonId}`);
  return response;
}

/**
 * Get all lessons for the current user
 * @param {Object} params - { status, channel, limit, offset }
 * @returns {Promise<{ lessons: Object[], total: number }>}
 */
export async function getMyLessons(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/lessons/my?${query}` : '/lessons/my';
  const response = await get(endpoint);
  return response;
}

export default {
  createLesson,
  getLesson,
  updateLesson,
  deleteLesson,
  getMyLessons,
};
