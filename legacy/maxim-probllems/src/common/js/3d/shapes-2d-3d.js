/**
 * shapes-2d-3d.js
 * Module for creating 2D shapes and cross-sections in 3D space
 * Part of the modularized common-3d system
 */

import * as THREE from 'three';
import { transformToThreeJS, transformFromThreeJS, COLORS_3D } from './core-3d.js';
import { createLineView } from './primitives-3d.js';

// Helper function to calculate polygon normal
function calculatePolygonNormal(vertices) {
    if (vertices.length < 3) {
        return new THREE.Vector3(0, 0, 1);
    }
    
    // Use Newell's method for robust normal calculation
    const normal = new THREE.Vector3(0, 0, 0);
    
    for (let i = 0; i < vertices.length; i++) {
        const v1 = vertices[i];
        const v2 = vertices[(i + 1) % vertices.length];
        
        normal.x += (v1.y - v2.y) * (v1.z + v2.z);
        normal.y += (v1.z - v2.z) * (v1.x + v2.x);
        normal.z += (v1.x - v2.x) * (v1.y + v2.y);
    }
    
    return normal.normalize();
}

// Helper function to project vertices onto a plane
function projectToPlane(vertices, normal) {
    // Create orthonormal basis
    let u = new THREE.Vector3(1, 0, 0);
    if (Math.abs(normal.dot(u)) > 0.9) {
        u = new THREE.Vector3(0, 1, 0);
    }
    
    const v = new THREE.Vector3().crossVectors(normal, u).normalize();
    u.crossVectors(v, normal).normalize();
    
    // Project vertices
    const projectedVertices = vertices.map(vertex => {
        return new THREE.Vector2(
            vertex.dot(u),
            vertex.dot(v)
        );
    });
    
    return { vertices2D: projectedVertices, u, v, normal };
}

// Helper function to unproject from plane back to 3D
function unprojectFromPlane(vert2D, projectionMatrix, originalVertices) {
    const { u, v, normal } = projectionMatrix;
    
    // For interior points, we need to find the average z-position
    // This is a simplified approach - for more complex shapes, 
    // you might need barycentric coordinates
    let avgPos = new THREE.Vector3(0, 0, 0);
    originalVertices.forEach(v => avgPos.add(v));
    avgPos.multiplyScalar(1 / originalVertices.length);
    
    const basePoint = avgPos.clone().sub(
        normal.clone().multiplyScalar(avgPos.dot(normal))
    );
    
    return new THREE.Vector3()
        .addScaledVector(u, vert2D.x)
        .addScaledVector(v, vert2D.y)
        .add(basePoint);
}

/**
 * Creates a 3D polygon from an array of vertices
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Array} vertices - Array of vertices [{x, y, z}, ...] in user coordinate system
 * @param {Object} options - Polygon options
 * @returns {THREE.Mesh} The created polygon mesh
 */
export function createPolygonView(parent, vertices, options = {}) {
    const {
        color = COLORS.BLUE,
        opacity = 0.8,
        side = THREE.DoubleSide,
        wireframe = false,
        borderColor = COLORS.BLACK,
        borderWidth = 2,
        showBorder = true
    } = options;
    
    // Transform all vertices to Three.js coordinates
    const threeVertices = vertices.map(v => transformToThreeJS(v));
    
    // Create shape using THREE.Shape and ShapeGeometry for proper triangulation
    const shape = new THREE.Shape();
    
    // Project vertices onto a plane for triangulation
    // Find best projection plane based on polygon normal
    const normal = calculatePolygonNormal(threeVertices);
    const projectionData = projectToPlane(threeVertices, normal);
    const vertices2D = projectionData.vertices2D;
    
    // Create shape from 2D vertices
    vertices2D.forEach((v, i) => {
        if (i === 0) {
            shape.moveTo(v.x, v.y);
        } else {
            shape.lineTo(v.x, v.y);
        }
    });
    shape.closePath();
    
    // Create geometry from shape
    const geometry = new THREE.ShapeGeometry(shape);
    
    // Transform geometry vertices back to 3D
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const vert2D = new THREE.Vector2(
            positions.getX(i),
            positions.getY(i)
        );
        
        const vert3D = unprojectFromPlane(vert2D, projectionData, threeVertices);
        positions.setXYZ(i, vert3D.x, vert3D.y, vert3D.z);
    }
    
    geometry.computeVertexNormals();
    
    // Create material
    const material = new THREE.MeshLambertMaterial({
        color: new THREE.Color(color),
        opacity: opacity,
        transparent: opacity < 1,
        side: side,
        wireframe: wireframe
    });
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    parent.add(mesh);
    
    // Add border if requested
    if (showBorder && !wireframe) {
        const borderPoints = [...threeVertices, threeVertices[0]]; // Close the loop
        for (let i = 0; i < borderPoints.length - 1; i++) {
            createLineView(parent, borderPoints[i], borderPoints[i + 1], {
                color: borderColor,
                linewidth: borderWidth
            });
        }
    }
    
    return mesh;
}

/**
 * Generic function for creating any 2D shape (circles, semicircles, rectangles, etc.) as cross-sections
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Function|Object} shapeDefinition - Function returning vertices or shape object
 * @param {Object} options - Shape options
 * @returns {THREE.Mesh} The created shape mesh
 */
export function createCrossSectionShape(parent, shapeDefinition, options = {}) {
    const {
        segments = 64,
        closed = true,
        ...polygonOptions
    } = options;
    
    let vertices;
    
    if (typeof shapeDefinition === 'function') {
        // Generate vertices from parametric function
        vertices = [];
        const tMin = 0;
        const tMax = closed ? 2 * Math.PI : Math.PI;
        
        for (let i = 0; i <= segments; i++) {
            const t = tMin + (i / segments) * (tMax - tMin);
            const point = shapeDefinition(t);
            vertices.push(point);
        }
        
        // Remove duplicate last point if closed
        if (closed && vertices.length > 2) {
            const first = vertices[0];
            const last = vertices[vertices.length - 1];
            const dist = Math.sqrt(
                Math.pow(first.x - last.x, 2) +
                Math.pow(first.y - last.y, 2) +
                Math.pow(first.z - last.z, 2)
            );
            if (dist < 0.001) {
                vertices.pop();
            }
        }
    } else if (shapeDefinition.type === 'circle') {
        // Special case for circles
        const { center = {x: 0, y: 0, z: 0}, radius = 1, normal = {x: 0, y: 1, z: 0} } = shapeDefinition;
        return createCircleOutline(parent, radius, { center, normal, ...polygonOptions });
    } else if (shapeDefinition.vertices) {
        vertices = shapeDefinition.vertices;
    } else {
        throw new Error('Invalid shape definition');
    }
    
    return createPolygonView(parent, vertices, polygonOptions);
}

/**
 * Creates a circle outline in 3D space
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {number} radius - Circle radius
 * @param {Object} options - Circle options
 * @returns {THREE.Line} The created circle line
 */
export function createCircleOutline(parent, radius, options = {}) {
    const {
        center = {x: 0, y: 0, z: 0},
        normal = {x: 0, y: 1, z: 0},  // Default to xz-plane
        segments = 64,
        color = COLORS.BLACK,
        linewidth = 2,
        closed = true
    } = options;
    
    // Create circle in local coordinates
    const points = [];
    const angleStep = (2 * Math.PI) / segments;
    
    for (let i = 0; i <= segments; i++) {
        const angle = i * angleStep;
        points.push(new THREE.Vector3(
            radius * Math.cos(angle),
            0,
            radius * Math.sin(angle)
        ));
    }
    
    // Create geometry
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Create line
    const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        linewidth: linewidth
    });
    
    const circle = new THREE.Line(geometry, material);
    
    // Position and orient the circle
    const centerThree = transformToThreeJS(center);
    circle.position.copy(centerThree);
    
    // Orient to match the normal
    const normalThree = transformToThreeJS(normal).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    
    if (Math.abs(normalThree.dot(up)) < 0.999) {
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normalThree);
        circle.quaternion.copy(quaternion);
    } else if (normalThree.dot(up) < 0) {
        // Normal points down, rotate 180 degrees around x-axis
        circle.rotateX(Math.PI);
    }
    
    parent.add(circle);
    return circle;
}

/**
 * Creates a curve outline from a parametric function
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Function} curveFunction - Parametric function (t) => {x, y, z}
 * @param {Object} options - Curve options
 * @returns {THREE.Line} The created curve line
 */
export function createCurveOutline(parent, curveFunction, options = {}) {
    const {
        tMin = 0,
        tMax = 1,
        segments = 100,
        color = COLORS.BLACK,
        linewidth = 2
    } = options;
    
    // Generate points
    const points = [];
    for (let i = 0; i <= segments; i++) {
        const t = tMin + (i / segments) * (tMax - tMin);
        const point = curveFunction(t);
        points.push(transformToThreeJS(point));
    }
    
    // Create geometry
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Create line
    const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        linewidth: linewidth
    });
    
    const curve = new THREE.Line(geometry, material);
    parent.add(curve);
    
    return curve;
}