import * as THREE from 'three';

/**
 * Pure geometric utility functions that work in Three.js coordinate system
 * Uses Three.js Vector3 internally for efficient calculations
 */

/**
 * Calculates the midpoint between two points
 * @param {Object} point1 - First point {x, y, z}
 * @param {Object} point2 - Second point {x, y, z}
 * @returns {Object} Midpoint {x, y, z}
 */
export function midPoint(point1, point2) {
    const v1 = new THREE.Vector3(point1.x, point1.y, point1.z);
    const v2 = new THREE.Vector3(point2.x, point2.y, point2.z);
    const mid = v1.add(v2).multiplyScalar(0.5);
    
    return {
        x: mid.x,
        y: mid.y,
        z: mid.z
    };
}

/**
 * Normalizes a vector (makes it unit length)
 * @param {Object} vector - Vector to normalize {x, y, z}
 * @returns {Object} Normalized vector {x, y, z}
 */
export function normalize(vector) {
    const v = new THREE.Vector3(vector.x, vector.y, vector.z);
    v.normalize();
    
    return {
        x: v.x,
        y: v.y,
        z: v.z
    };
}

/**
 * Finds the intersection point(s) of two lines in 3D space
 * Lines are defined by two points each
 * @param {Object} line1Start - Start point of first line {x, y, z}
 * @param {Object} line1End - End point of first line {x, y, z}
 * @param {Object} line2Start - Start point of second line {x, y, z}
 * @param {Object} line2End - End point of second line {x, y, z}
 * @param {number} tolerance - Distance tolerance for intersection (default: 0.001)
 * @returns {Array} Empty array if no intersection, or array with intersection point
 */
export function lineIntersection(line1Start, line1End, line2Start, line2End, tolerance = 0.001) {
    const p1 = new THREE.Vector3(line1Start.x, line1Start.y, line1Start.z);
    const p2 = new THREE.Vector3(line1End.x, line1End.y, line1End.z);
    const p3 = new THREE.Vector3(line2Start.x, line2Start.y, line2Start.z);
    const p4 = new THREE.Vector3(line2End.x, line2End.y, line2End.z);
    
    // Direction vectors
    const d1 = new THREE.Vector3().subVectors(p2, p1);
    const d2 = new THREE.Vector3().subVectors(p4, p3);
    const w = new THREE.Vector3().subVectors(p1, p3);
    
    // Calculate dot products using Three.js
    const a = d1.dot(d1);
    const b = d1.dot(d2);
    const c = d2.dot(d2);
    const d = d1.dot(w);
    const e = d2.dot(w);
    
    const denominator = a * c - b * b;
    
    // Lines are parallel
    if (Math.abs(denominator) < 0.000001) {
        return [];
    }
    
    // Calculate parameters for closest points
    const s = (b * e - c * d) / denominator;
    const t = (a * e - b * d) / denominator;
    
    // Calculate closest points on each line
    const closest1 = p1.clone().add(d1.multiplyScalar(s));
    const closest2 = p3.clone().add(d2.multiplyScalar(t));
    
    // Check if closest points are within tolerance
    const distance = closest1.distanceTo(closest2);
    
    if (distance < tolerance) {
        // Lines intersect (or nearly intersect)
        // Return the midpoint of the two closest points
        const intersection = closest1.add(closest2).multiplyScalar(0.5);
        return [{
            x: intersection.x,
            y: intersection.y,
            z: intersection.z
        }];
    }
    
    // Lines don't intersect
    return [];
}

/**
 * Projects a point onto a plane defined by equation ax + by + cz + d = 0
 * @param {Object} point - Point to project {x, y, z}
 * @param {Object} plane - Plane equation coefficients {a, b, c, d}
 * @returns {Object} Projected point on the plane {x, y, z}
 */
export function projectionOnPlane(point, plane) {
    const { a, b, c, d } = plane;
    
    const p = new THREE.Vector3(point.x, point.y, point.z);
    const normal = new THREE.Vector3(a, b, c);
    const normalMagSq = normal.lengthSq();
    
    if (normalMagSq < 0.000001) {
        console.warn('Invalid plane equation: normal vector is zero');
        return point;
    }
    
    // Distance from point to plane along normal
    const distance = (normal.dot(p) + d) / normalMagSq;
    
    // Project point onto plane
    const projected = p.sub(normal.multiplyScalar(distance));
    
    return {
        x: projected.x,
        y: projected.y,
        z: projected.z
    };
}

/**
 * Calculates the distance between two points
 * @param {Object} point1 - First point {x, y, z}
 * @param {Object} point2 - Second point {x, y, z}
 * @returns {number} Distance between points
 */
export function distance(point1, point2) {
    const v1 = new THREE.Vector3(point1.x, point1.y, point1.z);
    const v2 = new THREE.Vector3(point2.x, point2.y, point2.z);
    return v1.distanceTo(v2);
}

/**
 * Calculates the cross product of two vectors
 * @param {Object} vector1 - First vector {x, y, z}
 * @param {Object} vector2 - Second vector {x, y, z}
 * @returns {Object} Cross product vector {x, y, z}
 */
export function crossProduct(vector1, vector2) {
    const v1 = new THREE.Vector3(vector1.x, vector1.y, vector1.z);
    const v2 = new THREE.Vector3(vector2.x, vector2.y, vector2.z);
    const cross = v1.cross(v2);
    
    return {
        x: cross.x,
        y: cross.y,
        z: cross.z
    };
}

/**
 * Calculates the dot product of two vectors
 * @param {Object} vector1 - First vector {x, y, z}
 * @param {Object} vector2 - Second vector {x, y, z}
 * @returns {number} Dot product value
 */
export function dotProduct(vector1, vector2) {
    const v1 = new THREE.Vector3(vector1.x, vector1.y, vector1.z);
    const v2 = new THREE.Vector3(vector2.x, vector2.y, vector2.z);
    return v1.dot(v2);
}

/**
 * Calculates the magnitude (length) of a vector
 * @param {Object} vector - Vector {x, y, z}
 * @returns {number} Magnitude of the vector
 */
export function magnitude(vector) {
    const v = new THREE.Vector3(vector.x, vector.y, vector.z);
    return v.length();
}

/**
 * Adds two vectors
 * @param {Object} vector1 - First vector {x, y, z}
 * @param {Object} vector2 - Second vector {x, y, z}
 * @returns {Object} Sum vector {x, y, z}
 */
export function addVectors(vector1, vector2) {
    const v1 = new THREE.Vector3(vector1.x, vector1.y, vector1.z);
    const v2 = new THREE.Vector3(vector2.x, vector2.y, vector2.z);
    const sum = v1.add(v2);
    
    return {
        x: sum.x,
        y: sum.y,
        z: sum.z
    };
}

/**
 * Subtracts vector2 from vector1
 * @param {Object} vector1 - First vector {x, y, z}
 * @param {Object} vector2 - Second vector {x, y, z}
 * @returns {Object} Difference vector {x, y, z}
 */
export function subtractVectors(vector1, vector2) {
    const v1 = new THREE.Vector3(vector1.x, vector1.y, vector1.z);
    const v2 = new THREE.Vector3(vector2.x, vector2.y, vector2.z);
    const diff = v1.sub(v2);
    
    return {
        x: diff.x,
        y: diff.y,
        z: diff.z
    };
}

/**
 * Scales a vector by a scalar value
 * @param {Object} vector - Vector to scale {x, y, z}
 * @param {number} scalar - Scalar value
 * @returns {Object} Scaled vector {x, y, z}
 */
export function scaleVector(vector, scalar) {
    const v = new THREE.Vector3(vector.x, vector.y, vector.z);
    v.multiplyScalar(scalar);
    
    return {
        x: v.x,
        y: v.y,
        z: v.z
    };
}

/**
 * Calculates the angle between two vectors in radians
 * @param {Object} vector1 - First vector {x, y, z}
 * @param {Object} vector2 - Second vector {x, y, z}
 * @returns {number} Angle in radians
 */
export function angleBetween(vector1, vector2) {
    const v1 = new THREE.Vector3(vector1.x, vector1.y, vector1.z);
    const v2 = new THREE.Vector3(vector2.x, vector2.y, vector2.z);
    return v1.angleTo(v2);
}

/**
 * Finds the point on a line segment closest to a given point
 * @param {Object} point - Point to find closest to {x, y, z}
 * @param {Object} lineStart - Start of line segment {x, y, z}
 * @param {Object} lineEnd - End of line segment {x, y, z}
 * @returns {Object} Closest point on the line segment {x, y, z}
 */
export function closestPointOnLineSegment(point, lineStart, lineEnd) {
    const p = new THREE.Vector3(point.x, point.y, point.z);
    const a = new THREE.Vector3(lineStart.x, lineStart.y, lineStart.z);
    const b = new THREE.Vector3(lineEnd.x, lineEnd.y, lineEnd.z);
    
    const lineVec = b.clone().sub(a);
    const pointVec = p.clone().sub(a);
    const lineLengthSq = lineVec.lengthSq();
    
    if (lineLengthSq < 0.000001) {
        return lineStart;
    }
    
    // Calculate parameter t for the closest point
    const t = Math.max(0, Math.min(1, pointVec.dot(lineVec) / lineLengthSq));
    
    // Calculate the closest point
    const closest = a.add(lineVec.multiplyScalar(t));
    
    return {
        x: closest.x,
        y: closest.y,
        z: closest.z
    };
}

/**
 * Linear interpolation between two points/vectors
 * @param {Object} start - Start point/vector {x, y, z}
 * @param {Object} end - End point/vector {x, y, z}
 * @param {number} t - Interpolation factor (0 to 1)
 * @returns {Object} Interpolated point/vector {x, y, z}
 */
export function lerp(start, end, t) {
    const v1 = new THREE.Vector3(start.x, start.y, start.z);
    const v2 = new THREE.Vector3(end.x, end.y, end.z);
    v1.lerp(v2, t);
    
    return {
        x: v1.x,
        y: v1.y,
        z: v1.z
    };
}

/**
 * Maps a value from one range to another
 * @param {number} value - Input value
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} Mapped value
 */
export function map(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Clamps a value between minimum and maximum bounds
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum bound
 * @param {number} max - Maximum bound
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Creates a line that passes through a given point
 * @param {Object} point - Point the line passes through {x, y, z}
 * @param {Object} direction - Direction vector {x, y, z}
 * @param {number} length - Total length of the line (default: 2)
 * @param {number} t - Parameter for where the point lies on the line (0-1, default: 0.5 for midpoint)
 * @returns {Object} Object with {from, to} points defining the line
 */
export function lineThroughPoint(point, direction, length = 2, t = 0.5) {
    // Normalize the direction
    const dir = new THREE.Vector3(direction.x, direction.y, direction.z);
    dir.normalize();
    
    // Calculate how far back and forward from the point
    const backDistance = length * t;
    const forwardDistance = length * (1 - t);
    
    // Calculate from and to points
    const p = new THREE.Vector3(point.x, point.y, point.z);
    const from = p.clone().sub(dir.clone().multiplyScalar(backDistance));
    const to = p.clone().add(dir.clone().multiplyScalar(forwardDistance));
    
    return {
        from: { x: from.x, y: from.y, z: from.z },
        to: { x: to.x, y: to.y, z: to.z }
    };
}

/**
 * Creates a perpendicular line to a given line, passing through a point
 * @param {Object} lineStart - Start point of the reference line {x, y, z}
 * @param {Object} lineEnd - End point of the reference line {x, y, z}
 * @param {Object} point - Point the perpendicular passes through {x, y, z}
 * @param {number} length - Length of the perpendicular line (default: 2)
 * @param {Object} planeNormal - Normal to the plane containing both lines (optional) {x, y, z}
 * @returns {Object} Object with {from, to} points defining the perpendicular line
 */
export function perpendicularLineThroughPoint(lineStart, lineEnd, point, length = 2, planeNormal = null) {
    const lineDir = new THREE.Vector3(
        lineEnd.x - lineStart.x,
        lineEnd.y - lineStart.y,
        lineEnd.z - lineStart.z
    ).normalize();
    
    let perpDir;
    
    if (planeNormal) {
        // Use provided plane normal to determine perpendicular direction
        const normal = new THREE.Vector3(planeNormal.x, planeNormal.y, planeNormal.z).normalize();
        perpDir = new THREE.Vector3().crossVectors(lineDir, normal).normalize();
    } else {
        // Find perpendicular in the plane containing the point and line
        const p = new THREE.Vector3(point.x, point.y, point.z);
        const linePoint = new THREE.Vector3(lineStart.x, lineStart.y, lineStart.z);
        const toPoint = p.clone().sub(linePoint);
        
        // Project toPoint onto lineDir to find closest point on line
        const projection = lineDir.clone().multiplyScalar(toPoint.dot(lineDir));
        
        // Perpendicular direction is from projection to point
        perpDir = toPoint.clone().sub(projection);
        
        // If point is on the line, choose arbitrary perpendicular
        if (perpDir.length() < 0.001) {
            // Create arbitrary perpendicular using cross product
            const arbitrary = Math.abs(lineDir.x) < 0.9 ? 
                new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
            perpDir = new THREE.Vector3().crossVectors(lineDir, arbitrary);
        }
        perpDir.normalize();
    }
    
    // Create line through point in perpendicular direction
    return lineThroughPoint(point, perpDir, length);
}

/**
 * Creates a parallel line to a given line, passing through a point
 * @param {Object} lineStart - Start point of the reference line {x, y, z}
 * @param {Object} lineEnd - End point of the reference line {x, y, z}
 * @param {Object} point - Point the parallel line passes through {x, y, z}
 * @param {number} length - Length of the parallel line (default: same as reference line)
 * @returns {Object} Object with {from, to} points defining the parallel line
 */
export function parallelLineThroughPoint(lineStart, lineEnd, point, length = null) {
    // Calculate line direction
    const lineDir = {
        x: lineEnd.x - lineStart.x,
        y: lineEnd.y - lineStart.y,
        z: lineEnd.z - lineStart.z
    };
    
    // If no length specified, use same length as reference line
    if (length === null) {
        length = Math.sqrt(lineDir.x * lineDir.x + lineDir.y * lineDir.y + lineDir.z * lineDir.z);
    }
    
    // Create parallel line through point with same direction
    return lineThroughPoint(point, lineDir, length);
}

/**
 * Computes a tangent line to a parametric curve at a given parameter value
 * @param {Function} curveFunction - Function that takes parameter t and returns {x, y, z}
 * @param {number} t - Parameter value where to compute the tangent
 * @param {number} length - Length of the tangent line (default: 1)
 * @param {number} epsilon - Small value for numerical derivative (default: 0.0001)
 * @returns {Object} Object with {from, to} points defining the tangent line
 */
export function curveTangentLine(curveFunction, t, length = 1, epsilon = 0.0001) {
    // Compute position at t
    const position = curveFunction(t);
    
    // Compute tangent using numerical derivative
    const tNext = t + epsilon;
    const tPrev = t - epsilon;
    const posNext = curveFunction(tNext);
    const posPrev = curveFunction(tPrev);
    
    // Tangent direction (derivative)
    const tangent = {
        x: (posNext.x - posPrev.x) / (2 * epsilon),
        y: (posNext.y - posPrev.y) / (2 * epsilon),
        z: (posNext.z - posPrev.z) / (2 * epsilon)
    };
    
    // Normalize and scale tangent
    const tangentVec = new THREE.Vector3(tangent.x, tangent.y, tangent.z);
    tangentVec.normalize().multiplyScalar(length);
    
    // Create tangent line from position to position + tangent
    return {
        from: position,
        to: {
            x: position.x + tangentVec.x,
            y: position.y + tangentVec.y,
            z: position.z + tangentVec.z
        }
    };
}

/**
 * Calculates the minimum distance between two skew lines in 3D space
 * Lines are defined by two points each
 * @param {Object} line1Start - Start point of first line {x, y, z}
 * @param {Object} line1End - End point of first line {x, y, z}
 * @param {Object} line2Start - Start point of second line {x, y, z}
 * @param {Object} line2End - End point of second line {x, y, z}
 * @returns {number} Minimum distance between the two lines
 */
export function lineLineDistance(line1Start, line1End, line2Start, line2End) {
    // Points on the lines
    const p1 = new THREE.Vector3(line1Start.x, line1Start.y, line1Start.z);
    const p2 = new THREE.Vector3(line2Start.x, line2Start.y, line2Start.z);
    
    // Calculate direction vectors from start to end points
    const d1 = new THREE.Vector3().subVectors(
        new THREE.Vector3(line1End.x, line1End.y, line1End.z),
        p1
    );
    const d2 = new THREE.Vector3().subVectors(
        new THREE.Vector3(line2End.x, line2End.y, line2End.z),
        p2
    );
    d1.normalize();
    d2.normalize();
    
    // Vector between the two points
    const w = new THREE.Vector3().subVectors(p1, p2);
    
    // Calculate the cross product of the two direction vectors
    const crossDir = new THREE.Vector3().crossVectors(d1, d2);
    const crossMag = crossDir.length();
    
    // Check if lines are parallel
    if (crossMag < 0.000001) {
        // Lines are parallel, distance is the distance from point to line
        // Use the cross product method: |w × d1| / |d1|
        const crossWD = new THREE.Vector3().crossVectors(w, d1);
        return crossWD.length() / d1.length();
    }
    
    // For skew lines, the distance is |w · (d1 × d2)| / |d1 × d2|
    const distance = Math.abs(w.dot(crossDir)) / crossMag;
    
    return distance;
}

/**
 * Calculates the perpendicular distance from a point to a plane
 * @param {Object} point - Point {x, y, z}
 * @param {Object} plane - Plane defined by equation ax + by + cz + d = 0, given as {a, b, c, d}
 * @returns {number} Perpendicular distance from point to plane
 */
export function pointToPlaneDistance(point, plane) {
    const { a, b, c, d } = plane;
    
    // Create normal vector
    const normal = new THREE.Vector3(a, b, c);
    
    // Calculate the magnitude of the normal vector
    const normalMag = normal.length();
    
    // Check for degenerate plane
    if (normalMag < 0.000001) {
        console.warn('Invalid plane equation: normal vector is zero');
        return 0;
    }
    
    // Distance formula: |ax + by + cz + d| / sqrt(a² + b² + c²)
    const distance = Math.abs(a * point.x + b * point.y + c * point.z + d) / normalMag;
    
    return distance;
}

/**
 * Generate three points for creating a right angle marker
 * Given a vertex and two direction vectors, returns points suitable for rightAngle() function
 * @param {Object} vertex - The vertex point where the angle is located {x, y, z}
 * @param {Object} vector1 - First direction vector {x, y, z}
 * @param {Object} vector2 - Second direction vector {x, y, z}
 * @param {number} distance - Distance from vertex to place the points (default: 0.5)
 * @returns {Object} Object with {point1, vertex, point2} for use with rightAngle()
 */
export function getRightAnglePoints(vertex, vector1, vector2, distance = 0.5) {
    // Normalize the vectors
    const dir1 = normalize(vector1);
    const dir2 = normalize(vector2);
    
    // Create points at specified distance along each direction
    const point1 = addVectors(vertex, scaleVector(dir1, distance));
    const point2 = addVectors(vertex, scaleVector(dir2, distance));
    
    return {
        point1: point1,
        vertex: vertex,
        point2: point2
    };
}

/**
 * Finds the line of intersection between two planes
 * @param {Object} plane1 - First plane {a, b, c, d} where ax + by + cz + d = 0
 * @param {Object} plane2 - Second plane {a, b, c, d} where ax + by + cz + d = 0
 * @param {number} length - Length of the intersection line segment (default: 10)
 * @returns {Object|null} Line of intersection as {from: {x, y, z}, to: {x, y, z}} or null if planes are parallel
 */
export function planesIntersectionLine(plane1, plane2, length = 10) {
    // Normal vectors of the planes
    const n1 = new THREE.Vector3(plane1.a, plane1.b, plane1.c);
    const n2 = new THREE.Vector3(plane2.a, plane2.b, plane2.c);
    
    // Direction of the intersection line is the cross product of the normals
    const direction = new THREE.Vector3().crossVectors(n1, n2);
    const dirMag = direction.length();
    
    // Check if planes are parallel (cross product is zero)
    if (dirMag < 0.000001) {
        return null; // Planes are parallel or coincident
    }
    
    // Normalize the direction vector
    direction.normalize();
    
    // Find a point on the intersection line
    // We need to solve the system of equations:
    // a1*x + b1*y + c1*z + d1 = 0
    // a2*x + b2*y + c2*z + d2 = 0
    // We'll set one coordinate to 0 and solve for the other two
    
    let point;
    const { a: a1, b: b1, c: c1, d: d1 } = plane1;
    const { a: a2, b: b2, c: c2, d: d2 } = plane2;
    
    // Try setting z = 0 and solve for x and y
    const detXY = a1 * b2 - a2 * b1;
    if (Math.abs(detXY) > 0.000001) {
        const x = (b1 * d2 - b2 * d1) / detXY;
        const y = (a2 * d1 - a1 * d2) / detXY;
        point = { x, y, z: 0 };
    }
    // Try setting y = 0 and solve for x and z
    else {
        const detXZ = a1 * c2 - a2 * c1;
        if (Math.abs(detXZ) > 0.000001) {
            const x = (c1 * d2 - c2 * d1) / detXZ;
            const z = (a2 * d1 - a1 * d2) / detXZ;
            point = { x, y: 0, z };
        }
        // Try setting x = 0 and solve for y and z
        else {
            const detYZ = b1 * c2 - b2 * c1;
            if (Math.abs(detYZ) > 0.000001) {
                const y = (c1 * d2 - c2 * d1) / detYZ;
                const z = (b2 * d1 - b1 * d2) / detYZ;
                point = { x: 0, y, z };
            } else {
                // This shouldn't happen if planes are not parallel
                return null;
            }
        }
    }
    
    // Create line segment from point in both directions
    const halfLength = length / 2;
    const dirScaled = direction.multiplyScalar(halfLength);
    
    const from = {
        x: point.x - dirScaled.x,
        y: point.y - dirScaled.y,
        z: point.z - dirScaled.z
    };
    
    const to = {
        x: point.x + dirScaled.x,
        y: point.y + dirScaled.y,
        z: point.z + dirScaled.z
    };
    
    return { from, to };
}

/**
 * Gets a visible point on a plane for visualization purposes (e.g., normal vector placement)
 * Finds the point on the plane closest to the origin, or a simple point if that's too far
 * @param {Object} plane - Plane equation coefficients {a, b, c, d} where ax + by + cz + d = 0
 * @returns {Object} A point on the plane {x, y, z}
 */
export function getVisiblePointOnPlane(plane) {
    const { a, b, c, d } = plane;
    
    // Find the point on plane closest to origin
    const denominator = a * a + b * b + c * c;
    if (denominator > 0.001) {
        // The point on the plane closest to origin is at distance d/|n| along the normal
        // Note: We use -d here because the plane equation is ax + by + cz + d = 0
        const t = -d / denominator;
        return {
            x: a * t,
            y: b * t,
            z: c * t
        };
    }
    
    // Fallback: find a point by setting two coordinates to 0
    if (Math.abs(a) > 0.001) {
        // Solve for x when y=0, z=0: ax + d = 0 => x = -d/a
        return { x: -d / a, y: 0, z: 0 };
    } else if (Math.abs(b) > 0.001) {
        // Solve for y when x=0, z=0: by + d = 0 => y = -d/b
        return { x: 0, y: -d / b, z: 0 };
    } else if (Math.abs(c) > 0.001) {
        // Solve for z when x=0, y=0: cz + d = 0 => z = -d/c
        return { x: 0, y: 0, z: -d / c };
    }
    
    // Degenerate case: plane equation has all zero coefficients
    console.warn('Invalid plane equation: all coefficients are zero');
    return { x: 0, y: 0, z: 0 };
}