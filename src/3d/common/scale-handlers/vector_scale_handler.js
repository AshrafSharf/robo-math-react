/**
 * vector_scale_handler.js
 * Vector3D-specific logic for 3D scaling
 */

import { scalePoints3D, interpolateScale } from '../scale_utils.js';

export const vectorScaleHandler = {
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
