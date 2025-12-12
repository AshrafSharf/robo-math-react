/**
 * TransformationUtil - Geometric transformation utilities using mathjs
 *
 * Provides functions to rotate geometric primitives (points, lines, circles, polygons)
 * around a specified center point by a given angle.
 */
import { cos, sin, multiply, matrix } from 'mathjs';

export class TransformationUtil {
    /**
     * Rotate a point around a center by an angle
     * @param {Object} point - {x, y} point to rotate
     * @param {number} angleDegrees - rotation angle in degrees (counterclockwise positive)
     * @param {Object} center - {x, y} rotation center (default: origin)
     * @returns {Object} rotated point {x, y}
     */
    static rotatePoint(point, angleDegrees, center = { x: 0, y: 0 }) {
        const angleRad = (angleDegrees * Math.PI) / 180;

        // Rotation matrix
        const cosA = cos(angleRad);
        const sinA = sin(angleRad);
        const rotationMatrix = matrix([
            [cosA, -sinA],
            [sinA, cosA]
        ]);

        // Translate point to origin (relative to center)
        const translated = matrix([[point.x - center.x], [point.y - center.y]]);

        // Apply rotation
        const rotated = multiply(rotationMatrix, translated);

        // Translate back
        return {
            x: rotated.get([0, 0]) + center.x,
            y: rotated.get([1, 0]) + center.y
        };
    }

    /**
     * Rotate a line (both endpoints) around a center
     * @param {Object} start - {x, y} start point
     * @param {Object} end - {x, y} end point
     * @param {number} angleDegrees - rotation angle in degrees
     * @param {Object} center - {x, y} rotation center (default: origin)
     * @returns {Object} { start: {x, y}, end: {x, y} }
     */
    static rotateLine(start, end, angleDegrees, center = { x: 0, y: 0 }) {
        return {
            start: TransformationUtil.rotatePoint(start, angleDegrees, center),
            end: TransformationUtil.rotatePoint(end, angleDegrees, center)
        };
    }

    /**
     * Rotate a circle (rotate center point, radius unchanged)
     * @param {Object} circleCenter - {x, y} center of the circle
     * @param {number} radius - circle radius
     * @param {number} angleDegrees - rotation angle in degrees
     * @param {Object} rotationCenter - {x, y} rotation center (default: origin)
     * @returns {Object} { center: {x, y}, radius: number }
     */
    static rotateCircle(circleCenter, radius, angleDegrees, rotationCenter = { x: 0, y: 0 }) {
        return {
            center: TransformationUtil.rotatePoint(circleCenter, angleDegrees, rotationCenter),
            radius: radius
        };
    }

    /**
     * Rotate a polygon (all vertices)
     * @param {Array} vertices - array of {x, y} points
     * @param {number} angleDegrees - rotation angle in degrees
     * @param {Object} center - {x, y} rotation center (default: origin)
     * @returns {Array} array of rotated {x, y} points
     */
    static rotatePolygon(vertices, angleDegrees, center = { x: 0, y: 0 }) {
        return vertices.map(v => TransformationUtil.rotatePoint(v, angleDegrees, center));
    }

    // ==================== TRANSLATION ====================

    /**
     * Translate a point by dx, dy
     * @param {Object} point - {x, y} point to translate
     * @param {number} dx - translation in x direction
     * @param {number} dy - translation in y direction
     * @returns {Object} translated point {x, y}
     */
    static translatePoint(point, dx, dy) {
        return {
            x: point.x + dx,
            y: point.y + dy
        };
    }

    /**
     * Translate a line (both endpoints)
     * @param {Object} start - {x, y} start point
     * @param {Object} end - {x, y} end point
     * @param {number} dx - translation in x direction
     * @param {number} dy - translation in y direction
     * @returns {Object} { start: {x, y}, end: {x, y} }
     */
    static translateLine(start, end, dx, dy) {
        return {
            start: TransformationUtil.translatePoint(start, dx, dy),
            end: TransformationUtil.translatePoint(end, dx, dy)
        };
    }

    /**
     * Translate a circle (translate center, radius unchanged)
     * @param {Object} center - {x, y} center of the circle
     * @param {number} radius - circle radius
     * @param {number} dx - translation in x direction
     * @param {number} dy - translation in y direction
     * @returns {Object} { center: {x, y}, radius: number }
     */
    static translateCircle(center, radius, dx, dy) {
        return {
            center: TransformationUtil.translatePoint(center, dx, dy),
            radius: radius
        };
    }

    /**
     * Translate a polygon (all vertices)
     * @param {Array} vertices - array of {x, y} points
     * @param {number} dx - translation in x direction
     * @param {number} dy - translation in y direction
     * @returns {Array} array of translated {x, y} points
     */
    static translatePolygon(vertices, dx, dy) {
        return vertices.map(v => TransformationUtil.translatePoint(v, dx, dy));
    }

    // ==================== UTILITIES ====================

    /**
     * Convert degrees to radians
     * @param {number} degrees
     * @returns {number} radians
     */
    static degreesToRadians(degrees) {
        return (degrees * Math.PI) / 180;
    }

    /**
     * Convert radians to degrees
     * @param {number} radians
     * @returns {number} degrees
     */
    static radiansToDegrees(radians) {
        return (radians * 180) / Math.PI;
    }
}
