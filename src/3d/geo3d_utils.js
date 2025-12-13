/**
 * Pure mathematical geometry utilities for 3D calculations
 * No Three.js dependencies - works with plain {x, y, z} objects
 */

/**
 * Calculate the distance between two points
 * @param {Object} p1 - First point {x, y, z}
 * @param {Object} p2 - Second point {x, y, z}
 * @returns {number} Distance between the points
 */
export function distanceBetweenPoints(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate the midpoint between two points
 * @param {Object} p1 - First point {x, y, z}
 * @param {Object} p2 - Second point {x, y, z}
 * @returns {Object} Midpoint {x, y, z}
 */
export function midpoint(p1, p2) {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
        z: (p1.z + p2.z) / 2
    };
}

/**
 * Calculate vector from point p1 to point p2
 * @param {Object} p1 - Start point {x, y, z}
 * @param {Object} p2 - End point {x, y, z}
 * @returns {Object} Vector {x, y, z}
 */
export function vectorFromPoints(p1, p2) {
    return {
        x: p2.x - p1.x,
        y: p2.y - p1.y,
        z: p2.z - p1.z
    };
}

/**
 * Calculate the magnitude of a vector
 * @param {Object} v - Vector {x, y, z}
 * @returns {number} Magnitude
 */
export function magnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

/**
 * Normalize a vector
 * @param {Object} v - Vector {x, y, z}
 * @returns {Object} Normalized vector {x, y, z}
 */
export function normalize(v) {
    const mag = magnitude(v);
    if (mag === 0) return { x: 0, y: 0, z: 0 };
    return {
        x: v.x / mag,
        y: v.y / mag,
        z: v.z / mag
    };
}

/**
 * Calculate dot product of two vectors
 * @param {Object} v1 - First vector {x, y, z}
 * @param {Object} v2 - Second vector {x, y, z}
 * @returns {number} Dot product
 */
export function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

/**
 * Calculate cross product of two vectors
 * @param {Object} v1 - First vector {x, y, z}
 * @param {Object} v2 - Second vector {x, y, z}
 * @returns {Object} Cross product vector {x, y, z}
 */
export function crossProduct(v1, v2) {
    return {
        x: v1.y * v2.z - v1.z * v2.y,
        y: v1.z * v2.x - v1.x * v2.z,
        z: v1.x * v2.y - v1.y * v2.x
    };
}

/**
 * Scale a vector by a scalar
 * @param {Object} v - Vector {x, y, z}
 * @param {number} scalar - Scale factor
 * @returns {Object} Scaled vector {x, y, z}
 */
export function scaleVector(v, scalar) {
    return {
        x: v.x * scalar,
        y: v.y * scalar,
        z: v.z * scalar
    };
}

/**
 * Add two vectors
 * @param {Object} v1 - First vector {x, y, z}
 * @param {Object} v2 - Second vector {x, y, z}
 * @returns {Object} Sum vector {x, y, z}
 */
export function addVectors(v1, v2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y,
        z: v1.z + v2.z
    };
}

/**
 * Translate a point by a vector
 * @param {Object} point - Point to translate {x, y, z}
 * @param {Object} vector - Translation vector {x, y, z}
 * @returns {Object} Translated point {x, y, z}
 */
export function translatePoint(point, vector) {
    return {
        x: point.x + vector.x,
        y: point.y + vector.y,
        z: point.z + vector.z
    };
}

/**
 * Calculate a point on a line given a base point, direction, and parameter t
 * @param {Object} point - Base point on the line {x, y, z}
 * @param {Object} direction - Direction vector {x, y, z}
 * @param {number} t - Parameter value
 * @returns {Object} Point on the line at parameter t
 */
export function pointOnLine(point, direction, t) {
    return {
        x: point.x + direction.x * t,
        y: point.y + direction.y * t,
        z: point.z + direction.z * t
    };
}

/**
 * Subtract two vectors (v1 - v2)
 * @param {Object} v1 - First vector {x, y, z}
 * @param {Object} v2 - Second vector {x, y, z}
 * @returns {Object} Difference vector {x, y, z}
 */
export function subtractVectors(v1, v2) {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y,
        z: v1.z - v2.z
    };
}

/**
 * Calculate angle between two vectors in radians
 * @param {Object} v1 - First vector {x, y, z}
 * @param {Object} v2 - Second vector {x, y, z}
 * @returns {number} Angle in radians
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
 * Project a point onto a line defined by two points
 * @param {Object} point - Point to project {x, y, z}
 * @param {Object} lineStart - Start of line {x, y, z}
 * @param {Object} lineEnd - End of line {x, y, z}
 * @returns {Object} Projected point {x, y, z}
 */
export function projectPointOntoLine(point, lineStart, lineEnd) {
    const lineVector = vectorFromPoints(lineStart, lineEnd);
    const pointVector = vectorFromPoints(lineStart, point);
    
    const lineLengthSquared = dotProduct(lineVector, lineVector);
    if (lineLengthSquared === 0) return { ...lineStart };
    
    const t = dotProduct(pointVector, lineVector) / lineLengthSquared;
    
    return {
        x: lineStart.x + t * lineVector.x,
        y: lineStart.y + t * lineVector.y,
        z: lineStart.z + t * lineVector.z
    };
}

/**
 * Calculate the distance from a point to a line
 * @param {Object} point - Point {x, y, z}
 * @param {Object} lineStart - Start of line {x, y, z}
 * @param {Object} lineEnd - End of line {x, y, z}
 * @returns {number} Distance from point to line
 */
export function distanceFromPointToLine(point, lineStart, lineEnd) {
    const projection = projectPointOntoLine(point, lineStart, lineEnd);
    return distanceBetweenPoints(point, projection);
}

/**
 * Calculate the normal vector to a plane defined by three points
 * @param {Object} p1 - First point {x, y, z}
 * @param {Object} p2 - Second point {x, y, z}
 * @param {Object} p3 - Third point {x, y, z}
 * @returns {Object} Normal vector {x, y, z}
 */
export function planeNormalFromThreePoints(p1, p2, p3) {
    const v1 = vectorFromPoints(p1, p2);
    const v2 = vectorFromPoints(p1, p3);
    return normalize(crossProduct(v1, v2));
}

/**
 * Calculate plane equation coefficients from point and normal
 * Plane equation: ax + by + cz + d = 0
 * @param {Object} point - Point on plane {x, y, z}
 * @param {Object} normal - Normal vector {x, y, z}
 * @returns {Object} Plane coefficients {a, b, c, d}
 */
export function planeFromPointAndNormal(point, normal) {
    const n = normalize(normal);
    return {
        a: n.x,
        b: n.y,
        c: n.z,
        d: -(n.x * point.x + n.y * point.y + n.z * point.z)
    };
}

/**
 * Calculate plane equation coefficients from three points
 * @param {Object} p1 - First point {x, y, z}
 * @param {Object} p2 - Second point {x, y, z}
 * @param {Object} p3 - Third point {x, y, z}
 * @returns {Object} Plane coefficients {a, b, c, d}
 */
export function planeFromThreePoints(p1, p2, p3) {
    const normal = planeNormalFromThreePoints(p1, p2, p3);
    return planeFromPointAndNormal(p1, normal);
}

/**
 * Calculate distance from point to plane
 * @param {Object} point - Point {x, y, z}
 * @param {Object} plane - Plane coefficients {a, b, c, d}
 * @returns {number} Signed distance (positive if on normal side)
 */
export function distanceFromPointToPlane(point, plane) {
    const numerator = Math.abs(
        plane.a * point.x + 
        plane.b * point.y + 
        plane.c * point.z + 
        plane.d
    );
    const denominator = Math.sqrt(
        plane.a * plane.a + 
        plane.b * plane.b + 
        plane.c * plane.c
    );
    return numerator / denominator;
}

/**
 * Project a point onto a plane
 * @param {Object} point - Point to project {x, y, z}
 * @param {Object} planePoint - Point on plane {x, y, z}
 * @param {Object} planeNormal - Normal to plane {x, y, z}
 * @returns {Object} Projected point {x, y, z}
 */
export function projectPointOntoPlane(point, planePoint, planeNormal) {
    const n = normalize(planeNormal);
    const v = vectorFromPoints(planePoint, point);
    const distance = dotProduct(v, n);
    
    return {
        x: point.x - distance * n.x,
        y: point.y - distance * n.y,
        z: point.z - distance * n.z
    };
}

/**
 * Calculate the intersection point of a line and a plane
 * @param {Object} lineStart - Start of line {x, y, z}
 * @param {Object} lineEnd - End of line {x, y, z}
 * @param {Object} planePoint - Point on plane {x, y, z}
 * @param {Object} planeNormal - Normal to plane {x, y, z}
 * @returns {Object|null} Intersection point {x, y, z} or null if parallel
 */
export function linePlaneIntersection(lineStart, lineEnd, planePoint, planeNormal) {
    const lineDir = vectorFromPoints(lineStart, lineEnd);
    const n = normalize(planeNormal);
    
    const denominator = dotProduct(lineDir, n);
    if (Math.abs(denominator) < 0.000001) return null; // Line parallel to plane
    
    const v = vectorFromPoints(lineStart, planePoint);
    const t = dotProduct(v, n) / denominator;
    
    return {
        x: lineStart.x + t * lineDir.x,
        y: lineStart.y + t * lineDir.y,
        z: lineStart.z + t * lineDir.z
    };
}

/**
 * Calculate distance between two parallel lines in 3D
 * Lines are defined by a point and direction vector
 * @param {Object} point1 - Point on first line {x, y, z}
 * @param {Object} dir1 - Direction vector of first line {x, y, z}
 * @param {Object} point2 - Point on second line {x, y, z}
 * @param {Object} dir2 - Direction vector of second line {x, y, z}
 * @returns {number} Distance between the parallel lines
 */
export function distanceBetweenParallelLines(point1, dir1, point2, dir2) {
    // For parallel lines, distance = ||(p2-p1) × d|| / ||d||
    // where p1, p2 are points on each line and d is the direction vector
    // Note: dir2 is included for API consistency but not used since lines are parallel
    const p1p2 = vectorFromPoints(point1, point2);
    const cross = crossProduct(p1p2, dir1);
    return magnitude(cross) / magnitude(dir1);
}

/**
 * Project a point onto a line defined by point and direction
 * @param {Object} point - Point to project {x, y, z}
 * @param {Object} linePoint - Point on line {x, y, z}
 * @param {Object} lineDir - Direction vector of line {x, y, z}
 * @returns {Object} Projected point {x, y, z}
 */
export function projectPointOntoLineWithDirection(point, linePoint, lineDir) {
    const pointVector = vectorFromPoints(linePoint, point);
    const dirLengthSquared = dotProduct(lineDir, lineDir);
    if (dirLengthSquared === 0) return { ...linePoint };
    
    const t = dotProduct(pointVector, lineDir) / dirLengthSquared;
    
    return {
        x: linePoint.x + t * lineDir.x,
        y: linePoint.y + t * lineDir.y,
        z: linePoint.z + t * lineDir.z
    };
}

/**
 * Calculate parametric equation of a line from two points
 * Returns functions that give point at parameter t
 * @param {Object} p1 - First point {x, y, z}
 * @param {Object} p2 - Second point {x, y, z}
 * @returns {Object} Object with x(t), y(t), z(t) functions
 */
export function parametricLine(p1, p2) {
    const dir = vectorFromPoints(p1, p2);
    return {
        x: (t) => p1.x + t * dir.x,
        y: (t) => p1.y + t * dir.y,
        z: (t) => p1.z + t * dir.z,
        // Helper to get point at t
        pointAt: (t) => ({
            x: p1.x + t * dir.x,
            y: p1.y + t * dir.y,
            z: p1.z + t * dir.z
        })
    };
}

/**
 * Find the closest points between two lines in 3D
 * @param {Object} line1Start - Start of first line {x, y, z}
 * @param {Object} line1End - End of first line {x, y, z}
 * @param {Object} line2Start - Start of second line {x, y, z}
 * @param {Object} line2End - End of second line {x, y, z}
 * @returns {Object} {point1, point2, distance} closest points on each line
 */
export function closestPointsBetweenLines(line1Start, line1End, line2Start, line2End) {
    const d1 = vectorFromPoints(line1Start, line1End);
    const d2 = vectorFromPoints(line2Start, line2End);
    const r = vectorFromPoints(line2Start, line1Start);
    
    const a = dotProduct(d1, d1);
    const b = dotProduct(d1, d2);
    const c = dotProduct(d2, d2);
    const d = dotProduct(d1, r);
    const e = dotProduct(d2, r);
    
    const denominator = a * c - b * b;
    
    let t1, t2;
    if (Math.abs(denominator) < 0.000001) {
        // Lines are parallel
        t1 = 0;
        t2 = (b > c ? d / b : e / c);
    } else {
        t1 = (b * e - c * d) / denominator;
        t2 = (a * e - b * d) / denominator;
    }
    
    const point1 = {
        x: line1Start.x + t1 * d1.x,
        y: line1Start.y + t1 * d1.y,
        z: line1Start.z + t1 * d1.z
    };
    
    const point2 = {
        x: line2Start.x + t2 * d2.x,
        y: line2Start.y + t2 * d2.y,
        z: line2Start.z + t2 * d2.z
    };
    
    return {
        point1,
        point2,
        distance: distanceBetweenPoints(point1, point2)
    };
}

/**
 * Rotate a point around an axis
 * @param {Object} point - Point to rotate {x, y, z}
 * @param {Object} axis - Axis of rotation (normalized) {x, y, z}
 * @param {number} angle - Angle in radians
 * @param {Object} origin - Origin of rotation {x, y, z} (default: {0,0,0})
 * @returns {Object} Rotated point {x, y, z}
 */
export function rotatePointAroundAxis(point, axis, angle, origin = {x: 0, y: 0, z: 0}) {
    // Translate point to origin
    const p = subtractVectors(point, origin);
    const a = normalize(axis);
    
    // Rodrigues' rotation formula
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
    const oneMinusCos = 1 - cosAngle;
    
    const cross = crossProduct(a, p);
    const dot = dotProduct(a, p);
    
    const result = {
        x: p.x * cosAngle + cross.x * sinAngle + a.x * dot * oneMinusCos,
        y: p.y * cosAngle + cross.y * sinAngle + a.y * dot * oneMinusCos,
        z: p.z * cosAngle + cross.z * sinAngle + a.z * dot * oneMinusCos
    };
    
    // Translate back
    return addVectors(result, origin);
}

/**
 * Calculate area of triangle from three points
 * @param {Object} p1 - First vertex {x, y, z}
 * @param {Object} p2 - Second vertex {x, y, z}
 * @param {Object} p3 - Third vertex {x, y, z}
 * @returns {number} Area of triangle
 */
export function triangleArea(p1, p2, p3) {
    const v1 = vectorFromPoints(p1, p2);
    const v2 = vectorFromPoints(p1, p3);
    const cross = crossProduct(v1, v2);
    return magnitude(cross) / 2;
}

/**
 * Check if four points are coplanar
 * @param {Object} p1 - First point {x, y, z}
 * @param {Object} p2 - Second point {x, y, z}
 * @param {Object} p3 - Third point {x, y, z}
 * @param {Object} p4 - Fourth point {x, y, z}
 * @param {number} tolerance - Tolerance for coplanarity (default: 0.000001)
 * @returns {boolean} True if coplanar
 */
export function areCoplanar(p1, p2, p3, p4, tolerance = 0.000001) {
    const v1 = vectorFromPoints(p1, p2);
    const v2 = vectorFromPoints(p1, p3);
    const v3 = vectorFromPoints(p1, p4);
    
    // Points are coplanar if scalar triple product is zero
    const scalarTriple = dotProduct(v3, crossProduct(v1, v2));
    return Math.abs(scalarTriple) < tolerance;
}

/**
 * Calculate centroid of multiple points
 * @param {Array<Object>} points - Array of points {x, y, z}
 * @returns {Object} Centroid {x, y, z}
 */
export function centroid(points) {
    if (points.length === 0) return { x: 0, y: 0, z: 0 };
    
    const sum = points.reduce((acc, p) => ({
        x: acc.x + p.x,
        y: acc.y + p.y,
        z: acc.z + p.z
    }), { x: 0, y: 0, z: 0 });
    
    return {
        x: sum.x / points.length,
        y: sum.y / points.length,
        z: sum.z / points.length
    };
}

/**
 * Calculate centroid of a parallelogram defined by origin and two vectors
 * @param {Object} origin - Origin point {x, y, z}
 * @param {Object} vector1End - End point of first vector {x, y, z}
 * @param {Object} vector2End - End point of second vector {x, y, z}
 * @returns {Object} Centroid of the parallelogram {x, y, z}
 */
export function parallelogramCentroid(origin, vector1End, vector2End) {
    // The fourth vertex of the parallelogram
    const fourthVertex = {
        x: vector1End.x + vector2End.x - origin.x,
        y: vector1End.y + vector2End.y - origin.y,
        z: vector1End.z + vector2End.z - origin.z
    };
    
    // Centroid is the average of all four vertices
    return centroid([origin, vector1End, vector2End, fourthVertex]);
}

/**
 * Linear interpolation between two points
 * @param {Object} p1 - Start point {x, y, z}
 * @param {Object} p2 - End point {x, y, z}
 * @param {number} t - Interpolation parameter (0 to 1)
 * @returns {Object} Interpolated point {x, y, z}
 */
export function lerp(p1, p2, t) {
    return {
        x: p1.x + (p2.x - p1.x) * t,
        y: p1.y + (p2.y - p1.y) * t,
        z: p1.z + (p2.z - p1.z) * t
    };
}