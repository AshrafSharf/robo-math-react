/**
 * line_scale_handler.js
 * Line3D-specific logic for 3D scaling
 */

import { scalePoints3D, interpolateScale } from '../scale_utils.js';

export const lineScaleHandler = {
    getPoints(expression) {
        const coords = expression.getVariableAtomicValues();
        return [
            { x: coords[0], y: coords[1], z: coords[2] },
            { x: coords[3], y: coords[4], z: coords[5] }
        ];
    },

    getScaledState(originalPoints, scaleFactor, center, progress) {
        const currentScale = interpolateScale(scaleFactor, progress);
        const scaled = scalePoints3D(originalPoints, currentScale, center);
        return {
            start: scaled[0],
            end: scaled[1]
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
