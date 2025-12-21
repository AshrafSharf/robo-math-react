/**
 * rotation_utils.js
 * Shared 3D rotation utilities using Rodrigues' rotation formula
 * Reusable for any 3D shape (vector, line, polygon, etc.)
 */

/**
 * Rotate a 3D point around an axis through the origin
 * Uses Rodrigues' rotation formula:
 * P_rot = P*cos(θ) + (K × P)*sin(θ) + K*(K·P)*(1 - cos(θ))
 *
 * @param {Object} point - Point to rotate {x, y, z}
 * @param {Object} axis - Rotation axis {x, y, z} (will be normalized)
 * @param {number} angleDeg - Rotation angle in degrees
 * @returns {Object} Rotated point {x, y, z}
 */
export function rotatePoint3D(point, axis, angleDeg) {
    const theta = angleDeg * Math.PI / 180;
    const cos_t = Math.cos(theta);
    const sin_t = Math.sin(theta);

    // Normalize axis
    const len = Math.sqrt(axis.x * axis.x + axis.y * axis.y + axis.z * axis.z);
    if (len === 0) {
        return { x: point.x, y: point.y, z: point.z };
    }
    const k = { x: axis.x / len, y: axis.y / len, z: axis.z / len };

    // K × P (cross product)
    const cross = {
        x: k.y * point.z - k.z * point.y,
        y: k.z * point.x - k.x * point.z,
        z: k.x * point.y - k.y * point.x
    };

    // K · P (dot product)
    const dot = k.x * point.x + k.y * point.y + k.z * point.z;

    return {
        x: point.x * cos_t + cross.x * sin_t + k.x * dot * (1 - cos_t),
        y: point.y * cos_t + cross.y * sin_t + k.y * dot * (1 - cos_t),
        z: point.z * cos_t + cross.z * sin_t + k.z * dot * (1 - cos_t)
    };
}

/**
 * Rotate a 3D point around an axis through a specified center point
 *
 * @param {Object} point - Point to rotate {x, y, z}
 * @param {Object} axis - Rotation axis {x, y, z} (will be normalized)
 * @param {number} angleDeg - Rotation angle in degrees
 * @param {Object} center - Center of rotation {x, y, z}
 * @returns {Object} Rotated point {x, y, z}
 */
export function rotatePoint3DAroundCenter(point, axis, angleDeg, center) {
    // Translate to origin
    const translated = {
        x: point.x - center.x,
        y: point.y - center.y,
        z: point.z - center.z
    };

    // Rotate around origin
    const rotated = rotatePoint3D(translated, axis, angleDeg);

    // Translate back
    return {
        x: rotated.x + center.x,
        y: rotated.y + center.y,
        z: rotated.z + center.z
    };
}

/**
 * Rotate multiple 3D points around an axis through the origin
 *
 * @param {Array<Object>} points - Array of points [{x, y, z}, ...]
 * @param {Object} axis - Rotation axis {x, y, z}
 * @param {number} angleDeg - Rotation angle in degrees
 * @returns {Array<Object>} Array of rotated points
 */
export function rotatePoints3D(points, axis, angleDeg) {
    return points.map(point => rotatePoint3D(point, axis, angleDeg));
}

/**
 * Rotate multiple 3D points around an axis through a specified center
 *
 * @param {Array<Object>} points - Array of points [{x, y, z}, ...]
 * @param {Object} axis - Rotation axis {x, y, z}
 * @param {number} angleDeg - Rotation angle in degrees
 * @param {Object} center - Center of rotation {x, y, z}
 * @returns {Array<Object>} Array of rotated points
 */
export function rotatePoints3DAroundCenter(points, axis, angleDeg, center) {
    return points.map(point => rotatePoint3DAroundCenter(point, axis, angleDeg, center));
}
