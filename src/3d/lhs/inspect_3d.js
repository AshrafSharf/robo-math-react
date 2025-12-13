import * as THREE from 'three';
import { transformFromThreeJS } from './lhs_transform.js';

/**
 * Utility functions for inspecting and extracting information from Three.js geometries
 * All returned coordinates are in mathematical/model coordinate system
 */


/**
 * Gets the center point of a mesh's bounding box
 * @param {THREE.Mesh} mesh - The mesh to inspect
 * @returns {Object} Center point {x, y, z} in mathematical coordinates
 */
export function getMeshCenter(mesh) {
    if (!mesh || !mesh.geometry) {
        console.warn('Invalid mesh provided');
        return { x: 0, y: 0, z: 0 };
    }
    
    // Compute bounding box if not already computed
    if (!mesh.geometry.boundingBox) {
        mesh.geometry.computeBoundingBox();
    }
    
    const center = new THREE.Vector3();
    mesh.geometry.boundingBox.getCenter(center);
    
    // Transform to world space
    center.applyMatrix4(mesh.matrixWorld);
    
    // Convert to mathematical coordinates
    return transformFromThreeJS(center);
}

/**
 * Gets the dimensions (width, height, depth) of a mesh's bounding box
 * @param {THREE.Mesh} mesh - The mesh to inspect
 * @returns {Object} Dimensions {width, height, depth} in Three.js units
 */
export function getMeshDimensions(mesh) {
    if (!mesh || !mesh.geometry) {
        console.warn('Invalid mesh provided');
        return { width: 0, height: 0, depth: 0 };
    }
    
    // Compute bounding box if not already computed
    if (!mesh.geometry.boundingBox) {
        mesh.geometry.computeBoundingBox();
    }
    
    const size = new THREE.Vector3();
    mesh.geometry.boundingBox.getSize(size);
    
    // Apply mesh scale
    size.multiply(mesh.scale);
    
    return {
        width: size.x,
        height: size.y,
        depth: size.z
    };
}

/**
 * Gets the normal vector of a plane mesh
 * @param {THREE.Mesh} planeMesh - The plane mesh to inspect
 * @returns {Object} Normal vector {x, y, z} in Three.js coordinates
 */
export function getPlaneNormal(planeMesh) {
    if (!planeMesh || !planeMesh.geometry) {
        console.warn('Invalid plane mesh provided');
        return { x: 0, y: 0, z: 1 };
    }
    
    // Default plane normal is (0, 0, 1) in local space
    const localNormal = new THREE.Vector3(0, 0, 1);
    
    // Get the mesh's world rotation matrix
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(planeMesh.matrixWorld);
    
    // Transform normal to world space
    localNormal.applyMatrix3(normalMatrix);
    localNormal.normalize();
    
    // Convert to mathematical coordinates
    return transformFromThreeJS(localNormal);
}

/**
 * Gets all vertices of a mesh
 * @param {THREE.Mesh} mesh - The mesh to inspect
 * @param {boolean} worldSpace - Whether to return vertices in world space (default: true)
 * @returns {Array} Array of vertices [{x, y, z}, ...]
 */
export function getMeshVertices(mesh, worldSpace = true) {
    if (!mesh || !mesh.geometry) {
        console.warn('Invalid mesh provided');
        return [];
    }
    
    const geometry = mesh.geometry;
    const positionAttribute = geometry.attributes.position;
    
    if (!positionAttribute) {
        console.warn('No position attribute found in geometry');
        return [];
    }
    
    const vertices = [];
    const count = positionAttribute.count;
    
    for (let i = 0; i < count; i++) {
        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute(positionAttribute, i);
        
        if (worldSpace) {
            vertex.applyMatrix4(mesh.matrixWorld);
        }
        
        // Convert to mathematical coordinates
        vertices.push(transformFromThreeJS(vertex));
    }
    
    return vertices;
}

/**
 * Checks if a point is inside a mesh (works best with convex meshes)
 * @param {THREE.Mesh} mesh - The mesh to test
 * @param {Object} point - Point to test {x, y, z}
 * @returns {boolean} True if point is inside the mesh
 */
export function isPointInsideMesh(mesh, point) {
    if (!mesh || !mesh.geometry) {
        console.warn('Invalid mesh provided');
        return false;
    }
    
    // Create a raycaster from the point in a random direction
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3(1, 0, 0);
    const origin = new THREE.Vector3(point.x, point.y, point.z);
    
    raycaster.set(origin, direction);
    
    // Count intersections
    const intersects = raycaster.intersectObject(mesh);
    
    // If odd number of intersections, point is inside
    return intersects.length % 2 === 1;
}

/**
 * Gets the face normal at a specific point on a mesh surface
 * @param {THREE.Mesh} mesh - The mesh to inspect
 * @param {Object} point - Point on the surface {x, y, z}
 * @returns {Object} Normal vector at that point {x, y, z}
 */
export function getSurfaceNormalAtPoint(mesh, point) {
    if (!mesh || !mesh.geometry) {
        console.warn('Invalid mesh provided');
        return { x: 0, y: 1, z: 0 };
    }
    
    // Create a raycaster from above the point pointing down
    const raycaster = new THREE.Raycaster();
    const origin = new THREE.Vector3(point.x, point.y + 1000, point.z);
    const direction = new THREE.Vector3(0, -1, 0);
    
    raycaster.set(origin, direction);
    
    // Find intersection
    const intersects = raycaster.intersectObject(mesh);
    
    if (intersects.length > 0) {
        const normal = intersects[0].face.normal.clone();
        
        // Transform normal to world space
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
        normal.applyMatrix3(normalMatrix);
        normal.normalize();
        
        // Convert to mathematical coordinates
        return transformFromThreeJS(normal);
    }
    
    return { x: 0, y: 1, z: 0 };
}

/**
 * Gets the four corner points of a plane mesh (internal helper)
 * @private
 */
function getPlaneCorners(planeMesh) {
    if (!planeMesh || !planeMesh.geometry) {
        console.warn('Invalid plane mesh provided');
        return [];
    }
    
    const geometry = planeMesh.geometry;
    
    if (!geometry.isBufferGeometry) {
        console.warn('Expected BufferGeometry');
        return [];
    }
    
    const positionAttribute = geometry.attributes.position;
    if (!positionAttribute) {
        console.warn('No position attribute found in geometry');
        return [];
    }
    
    const vertices = [];
    const count = positionAttribute.count;
    
    for (let i = 0; i < count; i++) {
        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute(positionAttribute, i);
        vertices.push(vertex);
    }
    
    const box = new THREE.Box3().setFromPoints(vertices);
    const min = box.min;
    const max = box.max;
    
    const worldMatrix = planeMesh.matrixWorld;
    
    const corners = [
        new THREE.Vector3(min.x, min.y, max.z),
        new THREE.Vector3(max.x, min.y, max.z),
        new THREE.Vector3(max.x, max.y, max.z),
        new THREE.Vector3(min.x, max.y, max.z)
    ];
    
    // Handle different plane orientations
    if (Math.abs(max.z - min.z) < 0.001) {
        corners[0].set(min.x, min.y, min.z);
        corners[1].set(max.x, min.y, min.z);
        corners[2].set(max.x, max.y, min.z);
        corners[3].set(min.x, max.y, min.z);
    } else if (Math.abs(max.y - min.y) < 0.001) {
        corners[0].set(min.x, min.y, min.z);
        corners[1].set(max.x, min.y, min.z);
        corners[2].set(max.x, min.y, max.z);
        corners[3].set(min.x, min.y, max.z);
    } else if (Math.abs(max.x - min.x) < 0.001) {
        corners[0].set(min.x, min.y, min.z);
        corners[1].set(min.x, max.y, min.z);
        corners[2].set(min.x, max.y, max.z);
        corners[3].set(min.x, min.y, max.z);
    }
    
    // Transform to world space
    const worldCorners = corners.map(corner => {
        const worldCorner = corner.clone();
        worldCorner.applyMatrix4(worldMatrix);
        return worldCorner;
    });
    
    return worldCorners;
}

/**
 * Gets plane edges from corners (internal helper)
 * @private
 */
function getPlaneEdges(corners) {
    if (corners.length !== 4) {
        return null;
    }
    
    return {
        bottom: { from: corners[0], to: corners[1] },
        right:  { from: corners[1], to: corners[2] },
        top:    { from: corners[2], to: corners[3] },
        left:   { from: corners[3], to: corners[0] }
    };
}

/**
 * Calculates the line of intersection between two planes
 * @private
 */
function calculatePlanesIntersection(plane1Mesh, plane2Mesh) {
    // Get plane normals in world space
    const normal1Local = new THREE.Vector3(0, 0, 1);
    const normal2Local = new THREE.Vector3(0, 0, 1);
    
    const normalMatrix1 = new THREE.Matrix3().getNormalMatrix(plane1Mesh.matrixWorld);
    const normalMatrix2 = new THREE.Matrix3().getNormalMatrix(plane2Mesh.matrixWorld);
    
    normal1Local.applyMatrix3(normalMatrix1).normalize();
    normal2Local.applyMatrix3(normalMatrix2).normalize();
    
    // Direction of intersection line = normal1 × normal2
    const direction = new THREE.Vector3().crossVectors(normal1Local, normal2Local);
    
    // Check if planes are parallel
    if (direction.length() < 0.001) {
        return null; // Planes are parallel
    }
    
    direction.normalize();
    
    // Get a point on each plane
    const point1 = new THREE.Vector3(0, 0, 0).applyMatrix4(plane1Mesh.matrixWorld);
    const point2 = new THREE.Vector3(0, 0, 0).applyMatrix4(plane2Mesh.matrixWorld);
    
    // Find a point on the line of intersection
    // Using the formula for line-plane intersection
    const d1 = -normal1Local.dot(point1);
    const d2 = -normal2Local.dot(point2);
    
    // Find a point by setting one coordinate to 0 and solving
    let pointOnLine;
    if (Math.abs(direction.z) > 0.1) {
        // Set z = 0, solve for x and y
        const x = (normal2Local.y * d1 - normal1Local.y * d2) / 
                  (normal1Local.x * normal2Local.y - normal2Local.x * normal1Local.y);
        const y = (normal1Local.x * d2 - normal2Local.x * d1) / 
                  (normal1Local.x * normal2Local.y - normal2Local.x * normal1Local.y);
        pointOnLine = new THREE.Vector3(x, y, 0);
    } else if (Math.abs(direction.y) > 0.1) {
        // Set y = 0, solve for x and z
        const x = (normal2Local.z * d1 - normal1Local.z * d2) / 
                  (normal1Local.x * normal2Local.z - normal2Local.x * normal1Local.z);
        const z = (normal1Local.x * d2 - normal2Local.x * d1) / 
                  (normal1Local.x * normal2Local.z - normal2Local.x * normal1Local.z);
        pointOnLine = new THREE.Vector3(x, 0, z);
    } else {
        // Set x = 0, solve for y and z
        const y = (normal2Local.z * d1 - normal1Local.z * d2) / 
                  (normal1Local.y * normal2Local.z - normal2Local.y * normal1Local.z);
        const z = (normal1Local.y * d2 - normal2Local.y * d1) / 
                  (normal1Local.y * normal2Local.z - normal2Local.y * normal1Local.z);
        pointOnLine = new THREE.Vector3(0, y, z);
    }
    
    return { point: pointOnLine, direction: direction };
}

/**
 * Finds the closest point on a line segment to a given point
 * @private
 */
function closestPointOnSegment(point, segmentStart, segmentEnd) {
    const line = new THREE.Vector3().subVectors(segmentEnd, segmentStart);
    const lineLength = line.length();
    
    if (lineLength < 0.001) {
        return segmentStart.clone();
    }
    
    line.normalize();
    
    const toPoint = new THREE.Vector3().subVectors(point, segmentStart);
    const t = Math.max(0, Math.min(lineLength, toPoint.dot(line)));
    
    return segmentStart.clone().add(line.multiplyScalar(t));
}

/**
 * Finds where an edge intersects or comes closest to the intersection line
 * @private
 */
function findEdgeIntersectionPoint(edge, intersectionLine) {
    if (!edge || !intersectionLine) return null;
    
    // Find closest points between the edge and the infinite intersection line
    const edgeDir = new THREE.Vector3().subVectors(edge.to, edge.from);
    const lineDir = intersectionLine.direction;
    
    const w = new THREE.Vector3().subVectors(edge.from, intersectionLine.point);
    
    const a = edgeDir.dot(edgeDir);
    const b = edgeDir.dot(lineDir);
    const c = lineDir.dot(lineDir);
    const d = edgeDir.dot(w);
    const e = lineDir.dot(w);
    
    const denominator = a * c - b * b;
    
    if (Math.abs(denominator) < 0.00001) {
        // Lines are parallel
        return closestPointOnSegment(intersectionLine.point, edge.from, edge.to);
    }
    
    const s = (b * e - c * d) / denominator;
    // const t = (a * e - b * d) / denominator; // Position on intersection line (not needed)
    
    // Clamp s to [0, 1] to stay within the edge segment
    const sClamped = Math.max(0, Math.min(1, s));
    
    // Point on edge closest to intersection line
    const pointOnEdge = edge.from.clone().add(
        edgeDir.multiplyScalar(sClamped)
    );
    
    return pointOnEdge;
}

/**
 * Gets three points that define the angle between two planes
 * @param {THREE.Mesh} plane1Mesh - First plane mesh
 * @param {THREE.Mesh} plane2Mesh - Second plane mesh
 * @returns {Object|null} Object with three points {point1, vertex, point2} in mathematical coordinates, or null if planes are parallel
 * 
 * The returned points form an angle where:
 * - point1: Point on first plane
 * - vertex: Vertex of the angle (on intersection line)
 * - point2: Point on second plane
 * 
 * @example
 * const anglePoints = getAngleBetweenPlanes(plane1Mesh, plane2Mesh);
 * if (anglePoints) {
 *     const angleArc = arc(
 *         { x: anglePoints.point1.x - anglePoints.vertex.x, 
 *           y: anglePoints.point1.y - anglePoints.vertex.y,
 *           z: anglePoints.point1.z - anglePoints.vertex.z },
 *         { x: anglePoints.point2.x - anglePoints.vertex.x,
 *           y: anglePoints.point2.y - anglePoints.vertex.y,
 *           z: anglePoints.point2.z - anglePoints.vertex.z },
 *         { radius: 1.0 }
 *     );
 * }
 */
export function getAngleBetweenPlanes(plane1Mesh, plane2Mesh) {
    // Calculate intersection line
    const intersectionLine = calculatePlanesIntersection(plane1Mesh, plane2Mesh);
    
    if (!intersectionLine) {
        console.warn('Planes are parallel - no angle to show');
        return null;
    }
    
    // Get corners and edges for both planes
    const corners1 = getPlaneCorners(plane1Mesh);
    const corners2 = getPlaneCorners(plane2Mesh);
    
    const edges1 = getPlaneEdges(corners1);
    const edges2 = getPlaneEdges(corners2);
    
    if (!edges1 || !edges2) {
        console.warn('Could not get plane edges');
        return null;
    }
    
    // Find the best edge from each plane for angle visualization
    let bestVertex = null;
    let bestPoint1 = null;
    let bestPoint2 = null;
    let minDistance = Infinity;
    
    // Try each edge combination
    for (const edge1 of Object.values(edges1)) {
        const intersectionPoint1 = findEdgeIntersectionPoint(edge1, intersectionLine);
        
        if (!intersectionPoint1) continue;
        
        for (const edge2 of Object.values(edges2)) {
            const intersectionPoint2 = findEdgeIntersectionPoint(edge2, intersectionLine);
            
            if (!intersectionPoint2) continue;
            
            // Find the closest points between the two intersection points
            const distance = intersectionPoint1.distanceTo(intersectionPoint2);
            
            if (distance < minDistance) {
                minDistance = distance;
                
                // Use midpoint as vertex if points are close
                if (distance < 0.5) {
                    bestVertex = intersectionPoint1.clone().add(intersectionPoint2).multiplyScalar(0.5);
                    bestPoint1 = intersectionPoint1;
                    bestPoint2 = intersectionPoint2;
                } else {
                    // Use the first intersection point as vertex
                    bestVertex = intersectionPoint1.clone();
                    bestPoint1 = intersectionPoint1;
                    bestPoint2 = intersectionPoint2;
                }
            }
        }
    }
    
    if (!bestVertex) {
        console.warn('Could not find suitable intersection points');
        return null;
    }
    
    // Create points for angle visualization
    // We need points that are offset from the vertex along each edge
    const offset = 1.0; // Distance from vertex to angle points
    
    // Get edge directions at the vertex
    let dir1 = null;
    let dir2 = null;
    
    // Find which edges contain our best points
    for (const edge of Object.values(edges1)) {
        const dist = closestPointOnSegment(bestPoint1, edge.from, edge.to).distanceTo(bestPoint1);
        if (dist < 0.01) {
            dir1 = new THREE.Vector3().subVectors(edge.to, edge.from).normalize();
            break;
        }
    }
    
    for (const edge of Object.values(edges2)) {
        const dist = closestPointOnSegment(bestPoint2, edge.from, edge.to).distanceTo(bestPoint2);
        if (dist < 0.01) {
            dir2 = new THREE.Vector3().subVectors(edge.to, edge.from).normalize();
            break;
        }
    }
    
    if (!dir1 || !dir2) {
        // Fallback: use directions from vertex to points
        dir1 = new THREE.Vector3().subVectors(bestPoint1, bestVertex).normalize();
        dir2 = new THREE.Vector3().subVectors(bestPoint2, bestVertex).normalize();
    }
    
    // Create angle points
    const anglePoint1 = bestVertex.clone().add(dir1.multiplyScalar(offset));
    const anglePoint2 = bestVertex.clone().add(dir2.multiplyScalar(offset));
    
    // Convert to mathematical coordinates
    return {
        point1: transformFromThreeJS(anglePoint1),
        vertex: transformFromThreeJS(bestVertex),
        point2: transformFromThreeJS(anglePoint2)
    };
}