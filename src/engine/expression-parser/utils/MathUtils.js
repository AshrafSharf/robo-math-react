/**
 * Math utility functions
 */

const EPSILON = 0.0000001;

export const MathUtils = {
    /**
     * Check if two numbers are equal within epsilon tolerance
     */
    isEqual(a, b, epsilon = EPSILON) {
        return Math.abs(a - b) < epsilon;
    },

    /**
     * Clamp a value between min and max
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Convert degrees to radians
     */
    degToRad(degrees) {
        return degrees * (Math.PI / 180);
    },

    /**
     * Convert radians to degrees
     */
    radToDeg(radians) {
        return radians * (180 / Math.PI);
    }
};
