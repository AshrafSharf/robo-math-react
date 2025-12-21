/**
 * translate_utils.js
 * Shared 3D translation utilities
 * Reusable for any 3D shape (vector, line, point, polygon, etc.)
 */

/**
 * Translate a 3D point by (dx, dy, dz)
 *
 * @param {Object} point - Point to translate {x, y, z}
 * @param {Object} delta - Translation delta {x, y, z} or {dx, dy, dz}
 * @returns {Object} Translated point {x, y, z}
 */
export function translatePoint3D(point, delta) {
    const dx = delta.dx !== undefined ? delta.dx : delta.x;
    const dy = delta.dy !== undefined ? delta.dy : delta.y;
    const dz = delta.dz !== undefined ? delta.dz : delta.z;

    return {
        x: point.x + dx,
        y: point.y + dy,
        z: point.z + dz
    };
}

/**
 * Translate multiple 3D points by (dx, dy, dz)
 *
 * @param {Array<Object>} points - Array of points [{x, y, z}, ...]
 * @param {Object} delta - Translation delta {x, y, z} or {dx, dy, dz}
 * @returns {Array<Object>} Array of translated points
 */
export function translatePoints3D(points, delta) {
    return points.map(point => translatePoint3D(point, delta));
}

/**
 * Get interpolated translation at a given progress (0 to 1)
 *
 * @param {Object} delta - Full translation delta {dx, dy, dz}
 * @param {number} progress - Progress from 0 to 1
 * @returns {Object} Interpolated delta {dx, dy, dz}
 */
export function interpolateTranslation(delta, progress) {
    const dx = delta.dx !== undefined ? delta.dx : delta.x;
    const dy = delta.dy !== undefined ? delta.dy : delta.y;
    const dz = delta.dz !== undefined ? delta.dz : delta.z;

    return {
        dx: dx * progress,
        dy: dy * progress,
        dz: dz * progress
    };
}
