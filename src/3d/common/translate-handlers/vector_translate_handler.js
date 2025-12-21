/**
 * vector_translate_handler.js
 * Vector3D-specific logic for 3D translation
 */

import { translatePoints3D, interpolateTranslation } from '../translate_utils.js';

export const vectorTranslateHandler = {
    getPoints(expression) {
        const coords = expression.getVariableAtomicValues();
        return [
            { x: coords[0], y: coords[1], z: coords[2] },
            { x: coords[3], y: coords[4], z: coords[5] }
        ];
    },

    /**
     * Get translated state at a given progress
     * @param {Array<Object>} originalPoints - [start, end]
     * @param {Object} delta - Full translation {dx, dy, dz}
     * @param {number} progress - 0 to 1
     * @returns {Object} { start, end }
     */
    getTranslatedState(originalPoints, delta, progress) {
        const interpolatedDelta = interpolateTranslation(delta, progress);
        const translated = translatePoints3D(originalPoints, interpolatedDelta);
        return {
            start: translated[0],
            end: translated[1]
        };
    },

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

    getGeometryType() {
        return 'vector3d';
    }
};
