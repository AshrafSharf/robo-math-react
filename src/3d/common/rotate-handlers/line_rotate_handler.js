/**
 * line_rotate_handler.js
 * Line3D-specific logic for 3D rotation
 */

import { rotatePoints3D } from '../rotation_utils.js';

export const lineRotateHandler = {
    getPoints(expression) {
        const coords = expression.getVariableAtomicValues();
        return [
            { x: coords[0], y: coords[1], z: coords[2] },
            { x: coords[3], y: coords[4], z: coords[5] }
        ];
    },

    getRotatedState(originalPoints, axis, angleDeg) {
        const rotated = rotatePoints3D(originalPoints, axis, angleDeg);
        return {
            start: rotated[0],
            end: rotated[1]
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
