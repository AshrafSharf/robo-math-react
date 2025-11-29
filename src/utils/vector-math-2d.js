/**
 * Pure mathematical geometry utilities for 2D calculations
 * Works with plain {x, y} objects - no dependencies
 * Adapted from 3D geo_utils for 2D use cases
 */

/**
 * Calculate the distance between two points
 * @param {Object} p1 - First point {x, y}
 * @param {Object} p2 - Second point {x, y}
 * @returns {number} Distance between the points
 */
export function distanceBetweenPoints(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the midpoint between two points
 * @param {Object} p1 - First point {x, y}
 * @param {Object} p2 - Second point {x, y}
 * @returns {Object} Midpoint {x, y}
 */
export function midpoint(p1, p2) {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
    };
}

/**
 * Calculate vector from point p1 to point p2
 * @param {Object} p1 - Start point {x, y}
 * @param {Object} p2 - End point {x, y}
 * @returns {Object} Vector {x, y}
 */
export function vectorFromPoints(p1, p2) {
    return {
        x: p2.x - p1.x,
        y: p2.y - p1.y
    };
}

/**
 * Calculate the magnitude of a vector
 * @param {Object} v - Vector {x, y}
 * @returns {number} Magnitude
 */
export function magnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

/**
 * Normalize a vector
 * @param {Object} v - Vector {x, y}
 * @returns {Object} Normalized vector {x, y}
 */
export function normalize(v) {
    const mag = magnitude(v);
    if (mag === 0) return { x: 0, y: 0 };
    return {
        x: v.x / mag,
        y: v.y / mag
    };
}

/**
 * Calculate dot product of two vectors
 * @param {Object} v1 - First vector {x, y}
 * @param {Object} v2 - Second vector {x, y}
 * @returns {number} Dot product
 */
export function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
}

/**
 * Calculate 2D cross product (returns scalar - the z-component)
 * In 2D, this gives the signed area of the parallelogram
 * @param {Object} v1 - First vector {x, y}
 * @param {Object} v2 - Second vector {x, y}
 * @returns {number} Z-component of cross product
 */
export function crossProduct2D(v1, v2) {
    return v1.x * v2.y - v1.y * v2.x;
}

/**
 * Scale a vector by a scalar
 * @param {Object} v - Vector {x, y}
 * @param {number} scalar - Scale factor
 * @returns {Object} Scaled vector {x, y}
 */
export function scaleVector(v, scalar) {
    return {
        x: v.x * scalar,
        y: v.y * scalar
    };
}

/**
 * Add two vectors
 * @param {Object} v1 - First vector {x, y}
 * @param {Object} v2 - Second vector {x, y}
 * @returns {Object} Sum vector {x, y}
 */
export function addVectors(v1, v2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y
    };
}

/**
 * Subtract two vectors (v1 - v2)
 * @param {Object} v1 - First vector {x, y}
 * @param {Object} v2 - Second vector {x, y}
 * @returns {Object} Difference vector {x, y}
 */
export function subtractVectors(v1, v2) {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y
    };
}

/**
 * Calculate angle between two vectors in radians
 * @param {Object} v1 - First vector {x, y}
 * @param {Object} v2 - Second vector {x, y}
 * @returns {number} Angle in radians (0 to π)
 */
export function angleBetweenVectors(v1, v2) {
    const dot = dotProduct(v1, v2);
    const mag1 = magnitude(v1);
    const mag2 = magnitude(v2);
    
    if (mag1 === 0 || mag2 === 0) return 0;
    
    const cosAngle = dot / (mag1 * mag2);
    // Clamp to avoid numerical errors
    const clampedCos = Math.max(-1, Math.min(1, cosAngle));
    return Math.acos(clampedCos);
}

/**
 * Rotate a vector by an angle (counterclockwise)
 * @param {Object} v - Vector {x, y}
 * @param {number} angle - Angle in radians
 * @returns {Object} Rotated vector {x, y}
 */
export function rotateVector(v, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: v.x * cos - v.y * sin,
        y: v.x * sin + v.y * cos
    };
}

/**
 * Rotate a point around a center
 * @param {Object} point - Point to rotate {x, y}
 * @param {Object} center - Center of rotation {x, y}
 * @param {number} angle - Angle in radians (counterclockwise)
 * @returns {Object} Rotated point {x, y}
 */
export function rotatePoint(point, center, angle) {
    // Translate to origin
    const translated = subtractVectors(point, center);
    // Rotate
    const rotated = rotateVector(translated, angle);
    // Translate back
    return addVectors(rotated, center);
}

/**
 * Linear interpolation between two points
 * @param {Object} p1 - Start point {x, y}
 * @param {Object} p2 - End point {x, y}
 * @param {number} t - Interpolation parameter (0 to 1)
 * @returns {Object} Interpolated point {x, y}
 */
export function lerp(p1, p2, t) {
    return {
        x: p1.x + (p2.x - p1.x) * t,
        y: p1.y + (p2.y - p1.y) * t
    };
}

/**
 * Project a point onto a line defined by two points
 * @param {Object} point - Point to project {x, y}
 * @param {Object} lineStart - Start of line {x, y}
 * @param {Object} lineEnd - End of line {x, y}
 * @returns {Object} Projected point {x, y}
 */
export function projectPointOntoLine(point, lineStart, lineEnd) {
    const lineVector = vectorFromPoints(lineStart, lineEnd);
    const pointVector = vectorFromPoints(lineStart, point);
    
    const lineLengthSquared = dotProduct(lineVector, lineVector);
    if (lineLengthSquared === 0) return { ...lineStart };
    
    const t = dotProduct(pointVector, lineVector) / lineLengthSquared;
    
    return {
        x: lineStart.x + t * lineVector.x,
        y: lineStart.y + t * lineVector.y
    };
}

/**
 * Calculate the distance from a point to a line
 * @param {Object} point - Point {x, y}
 * @param {Object} lineStart - Start of line {x, y}
 * @param {Object} lineEnd - End of line {x, y}
 * @returns {number} Distance from point to line
 */
export function distanceFromPointToLine(point, lineStart, lineEnd) {
    const projection = projectPointOntoLine(point, lineStart, lineEnd);
    return distanceBetweenPoints(point, projection);
}

/**
 * Calculate area of triangle from three points using cross product
 * @param {Object} p1 - First vertex {x, y}
 * @param {Object} p2 - Second vertex {x, y}
 * @param {Object} p3 - Third vertex {x, y}
 * @returns {number} Area of triangle
 */
export function triangleArea(p1, p2, p3) {
    const v1 = vectorFromPoints(p1, p2);
    const v2 = vectorFromPoints(p1, p3);
    return Math.abs(crossProduct2D(v1, v2)) / 2;
}

/**
 * Calculate centroid of multiple points
 * @param {Array<Object>} points - Array of points {x, y}
 * @returns {Object} Centroid {x, y}
 */
export function centroid(points) {
    if (points.length === 0) return { x: 0, y: 0 };
    
    const sum = points.reduce((acc, p) => ({
        x: acc.x + p.x,
        y: acc.y + p.y
    }), { x: 0, y: 0 });
    
    return {
        x: sum.x / points.length,
        y: sum.y / points.length
    };
}

/**
 * Calculate centroid of a parallelogram defined by origin and two vectors
 * @param {Object} origin - Origin point {x, y}
 * @param {Object} vector1End - End point of first vector {x, y}
 * @param {Object} vector2End - End point of second vector {x, y}
 * @returns {Object} Centroid of the parallelogram {x, y}
 */
export function parallelogramCentroid(origin, vector1End, vector2End) {
    // The fourth vertex of the parallelogram
    const fourthVertex = {
        x: vector1End.x + vector2End.x - origin.x,
        y: vector1End.y + vector2End.y - origin.y
    };
    
    // Centroid is the average of all four vertices
    return centroid([origin, vector1End, vector2End, fourthVertex]);
}

/**
 * Calculate the fourth vertex of a parallelogram given three vertices
 * @param {Object} origin - Origin point {x, y}
 * @param {Object} vector1End - End point of first vector {x, y}
 * @param {Object} vector2End - End point of second vector {x, y}
 * @returns {Object} Fourth vertex {x, y}
 */
export function parallelogramFourthVertex(origin, vector1End, vector2End) {
    return {
        x: vector1End.x + vector2End.x - origin.x,
        y: vector1End.y + vector2End.y - origin.y
    };
}

/**
 * Calculate the signed angle from vector1 to vector2
 * Positive angle means counterclockwise rotation
 * @param {Object} v1 - First vector {x, y}
 * @param {Object} v2 - Second vector {x, y}
 * @returns {number} Signed angle in radians (-π to π)
 */
export function signedAngleBetweenVectors(v1, v2) {
    const angle = Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);
    // Normalize to [-π, π]
    if (angle > Math.PI) return angle - 2 * Math.PI;
    if (angle < -Math.PI) return angle + 2 * Math.PI;
    return angle;
}

/**
 * Get perpendicular vector (rotated 90° counterclockwise)
 * @param {Object} v - Vector {x, y}
 * @returns {Object} Perpendicular vector {x, y}
 */
export function perpendicularVector(v) {
    return {
        x: -v.y,
        y: v.x
    };
}

/**
 * Reflect a vector across a normal
 * @param {Object} v - Vector to reflect {x, y}
 * @param {Object} normal - Normal vector (should be normalized) {x, y}
 * @returns {Object} Reflected vector {x, y}
 */
export function reflectVector(v, normal) {
    const n = normalize(normal);
    const dot = dotProduct(v, n);
    return {
        x: v.x - 2 * dot * n.x,
        y: v.y - 2 * dot * n.y
    };
}

/**
 * Calculate the scalar projection of v1 onto v2
 * @param {Object} v1 - Vector to project {x, y}
 * @param {Object} v2 - Vector to project onto {x, y}
 * @returns {number} Scalar projection
 */
export function scalarProjection(v1, v2) {
    const mag2 = magnitude(v2);
    if (mag2 === 0) return 0;
    return dotProduct(v1, v2) / mag2;
}

/**
 * Calculate the vector projection of v1 onto v2
 * @param {Object} v1 - Vector to project {x, y}
 * @param {Object} v2 - Vector to project onto {x, y}
 * @returns {Object} Vector projection {x, y}
 */
export function vectorProjection(v1, v2) {
    const mag2Squared = dotProduct(v2, v2);
    if (mag2Squared === 0) return { x: 0, y: 0 };
    
    const scalar = dotProduct(v1, v2) / mag2Squared;
    return scaleVector(v2, scalar);
}

/**
 * Check if two vectors are parallel (within tolerance)
 * @param {Object} v1 - First vector {x, y}
 * @param {Object} v2 - Second vector {x, y}
 * @param {number} tolerance - Angle tolerance in radians (default: 0.001)
 * @returns {boolean} True if parallel
 */
export function areParallel(v1, v2, tolerance = 0.001) {
    const angle = angleBetweenVectors(v1, v2);
    return angle < tolerance || Math.abs(angle - Math.PI) < tolerance;
}

/**
 * Check if two vectors are perpendicular (within tolerance)
 * @param {Object} v1 - First vector {x, y}
 * @param {Object} v2 - Second vector {x, y}
 * @param {number} tolerance - Angle tolerance in radians (default: 0.001)
 * @returns {boolean} True if perpendicular
 */
export function arePerpendicular(v1, v2, tolerance = 0.001) {
    const angle = angleBetweenVectors(v1, v2);
    return Math.abs(angle - Math.PI / 2) < tolerance;
}

/**
 * Convert angle from degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Convert angle from radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
export function radiansToDegrees(radians) {
    return radians * 180 / Math.PI;
}