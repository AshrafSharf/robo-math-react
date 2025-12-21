/**
 * point_translate_handler.js
 * Point3D-specific logic for 3D translation
 */

import { translatePoint3D, interpolateTranslation } from '../translate_utils.js';

export const pointTranslateHandler = {
    getPoints(expression) {
        const coords = expression.getVariableAtomicValues();
        return [{ x: coords[0], y: coords[1], z: coords[2] }];
    },

    getTranslatedState(originalPoints, delta, progress) {
        const interpolatedDelta = interpolateTranslation(delta, progress);
        const translated = translatePoint3D(originalPoints[0], interpolatedDelta);
        return { point: translated };
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
