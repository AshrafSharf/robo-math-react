/**
 * point_rotate_handler.js
 * Point3D-specific logic for 3D rotation
 */

import { rotatePoint3D } from '../rotation_utils.js';

export const pointRotateHandler = {
    getPoints(expression) {
        const coords = expression.getVariableAtomicValues();
        return [{ x: coords[0], y: coords[1], z: coords[2] }];
    },

    getRotatedState(originalPoints, axis, angleDeg) {
        const rotated = rotatePoint3D(originalPoints[0], axis, angleDeg);
        return { point: rotated };
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
