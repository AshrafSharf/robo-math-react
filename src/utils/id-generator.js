/**
 * Global unique ID generator for all Robo-Reveal elements
 * Ensures every element gets a unique ID for dynamic targeting
 */

let globalIdCounter = 1;

/**
 * Generate a unique ID with the format 'robo-{number}'
 * @returns {string} Unique ID
 */
export const generateUniqueId = () => `robo-${globalIdCounter++}`;

/**
 * Reset the counter (mainly for testing)
 */
export const resetIdCounter = () => {
  globalIdCounter = 1;
};

/**
 * Get the current counter value
 */
export const getCurrentCounter = () => globalIdCounter;