/**
 * vector_rotate_handler.js
 * Vector-specific logic for 3D rotation
 * Handles extracting points from vector expression and creating vector shapes
 */

import { rotatePoints3D } from '../rotation_utils.js';

/**
 * Handler for rotating vector3d shapes
 */
export const vectorRotateHandler = {
    /**
     * Extract start and end points from a vector expression
     * @param {Object} expression - Vector3DExpression
     * @returns {Array<Object>} [startPoint, endPoint]
     */
    getPoints(expression) {
        const coords = expression.getVariableAtomicValues();
        return [
            { x: coords[0], y: coords[1], z: coords[2] },
            { x: coords[3], y: coords[4], z: coords[5] }
        ];
    },

    /**
     * Compute rotated points at a given angle
     * @param {Array<Object>} originalPoints - [start, end]
     * @param {Object} axis - Rotation axis {x, y, z}
     * @param {number} angleDeg - Current rotation angle
     * @returns {Object} { start, end } - Rotated points
     */
    getRotatedState(originalPoints, axis, angleDeg) {
        const rotated = rotatePoints3D(originalPoints, axis, angleDeg);
        return {
            start: rotated[0],
            end: rotated[1]
        };
    },

    /**
     * Create a vector shape from rotated state
     * @param {Object} diagram3d - The 3D diagram instance
     * @param {Object} state - { start, end }
     * @param {Object} options - Style options
     * @returns {THREE.Object3D} The created vector
     */
    createShape(diagram3d, state, options = {}) {
        const { start, end } = state;
        const color = options.color;
        const vectorOptions = {
            shaftRadius: options.shaftRadius,
            headLength: options.headLength,
            headRadius: options.headRadius
        };
        return diagram3d.vector(start, end, '', color, vectorOptions);
    },

    /**
     * Get the geometry type this handler supports
     * @returns {string}
     */
    getGeometryType() {
        return 'vector3d';
    }
};
