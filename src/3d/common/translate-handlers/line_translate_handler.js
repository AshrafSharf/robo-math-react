/**
 * line_translate_handler.js
 * Line3D-specific logic for 3D translation
 */

import { translatePoints3D, interpolateTranslation } from '../translate_utils.js';

export const lineTranslateHandler = {
    getPoints(expression) {
        const coords = expression.getVariableAtomicValues();
        return [
            { x: coords[0], y: coords[1], z: coords[2] },
            { x: coords[3], y: coords[4], z: coords[5] }
        ];
    },

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
        return diagram3d.lineByTwoPoints(start, end, options.color, {
            strokeWidth: options.strokeWidth
        });
    },

    getGeometryType() {
        return 'line3d';
    }
};
