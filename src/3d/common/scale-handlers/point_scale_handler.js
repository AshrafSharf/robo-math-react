/**
 * point_scale_handler.js
 * Point3D-specific logic for 3D scaling
 */

import { scalePoint3D, interpolateScale } from '../scale_utils.js';

export const pointScaleHandler = {
    getPoints(expression) {
        const coords = expression.getVariableAtomicValues();
        return [{ x: coords[0], y: coords[1], z: coords[2] }];
    },

    getScaledState(originalPoints, scaleFactor, center, progress) {
        const currentScale = interpolateScale(scaleFactor, progress);
        const scaled = scalePoint3D(originalPoints[0], currentScale, center);
        return { point: scaled };
    },

    createShape(diagram3d, state, options = {}) {
        const { point } = state;
        return diagram3d.point3d(point, '', options.color, {
            radius: options.radius
        });
    },

    getGeometryType() {
        return 'point3d';
    }
};
