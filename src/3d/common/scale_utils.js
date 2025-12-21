/**
 * scale_utils.js
 * Shared 3D scaling utilities
 * Reusable for any 3D shape (vector, line, point, polygon, etc.)
 */

/**
 * Scale a 3D point relative to a center point
 * scaled = center + (point - center) * scaleFactor
 *
 * @param {Object} point - Point to scale {x, y, z}
 * @param {number} scaleFactor - Scale factor (1 = no change, 2 = double, 0.5 = half)
 * @param {Object} center - Center of scaling {x, y, z}, defaults to origin
 * @returns {Object} Scaled point {x, y, z}
 */
export function scalePoint3D(point, scaleFactor, center = { x: 0, y: 0, z: 0 }) {
    return {
        x: center.x + (point.x - center.x) * scaleFactor,
        y: center.y + (point.y - center.y) * scaleFactor,
        z: center.z + (point.z - center.z) * scaleFactor
    };
}

/**
 * Scale multiple 3D points relative to a center point
 *
 * @param {Array<Object>} points - Array of points [{x, y, z}, ...]
 * @param {number} scaleFactor - Scale factor
 * @param {Object} center - Center of scaling {x, y, z}
 * @returns {Array<Object>} Array of scaled points
 */
export function scalePoints3D(points, scaleFactor, center = { x: 0, y: 0, z: 0 }) {
    return points.map(point => scalePoint3D(point, scaleFactor, center));
}

/**
 * Get interpolated scale factor at a given progress (0 to 1)
 * Interpolates from 1 (original) to target scaleFactor
 *
 * @param {number} targetScale - Target scale factor
 * @param {number} progress - Progress from 0 to 1
 * @returns {number} Interpolated scale factor
 */
export function interpolateScale(targetScale, progress) {
    return 1 + (targetScale - 1) * progress;
}
