// Plane Intersection 3D - Refactored using LHS APIs
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { planeFromEquation } from '../common/js/lhs/lhs_plane.js';
import { vector } from '../common/js/lhs/lhs_vector.js';
import { line } from '../common/js/lhs/lhs_line.js';
import { label } from '../common/js/lhs/lhs_label.js';
import { normalize, crossProduct, magnitude, getVisiblePointOnPlane, planesIntersectionLine } from '../common/js/lhs/lhs_geometry_utils.js';
import { createPaginator } from '../common/js/lhs/lhs_paginator.js';
import { getAllDescriptions } from './step_descriptions.js';

/**
 * Build the animation sequence order for the visualization
 * MUST follow the mathematical logic for plane intersection
 * @param {Object} objectsMap - Map of all created objects with their metadata
 * @returns {Array} Ordered array of objects for animation sequence
 */
function buildAnimationSequence(objectsMap) {
    const sequencedObjects = [];
    
    // Step 1: Show the first plane with its equation
    if (objectsMap['plane1']) sequencedObjects.push(objectsMap['plane1']);
    if (objectsMap['plane1Label']) sequencedObjects.push(objectsMap['plane1Label']);
    
    // Step 2: Show the second plane with its equation
    if (objectsMap['plane2']) sequencedObjects.push(objectsMap['plane2']);
    if (objectsMap['plane2Label']) sequencedObjects.push(objectsMap['plane2Label']);
    
    // Step 3: Show the intersection line (if planes intersect)
    if (objectsMap['intersectionLine']) sequencedObjects.push(objectsMap['intersectionLine']);
    if (objectsMap['intersectionLabel']) sequencedObjects.push(objectsMap['intersectionLabel']);
    
    return sequencedObjects;
}

export function render(scene) {
    // REQUIRED: Store objects by name for sequencing
    const objectsMap = {};
    
    // REQUIRED: Setup 3D coordinate system with enhanced Phong lighting
    setupCoordinateSystem(scene, {
        showAxes: true,
        axesRange: 10,
        axesTickStep: 2,
        showGrid: true,
        enableInteraction: true,
        cameraPosition: { x: -15, y: 12, z: -15 },
        cameraTarget: { x: 0, y: 0, z: 0 },
        lightingProfile: 'phong'  // Enhanced lighting for better visualization
    });
    
    // STEP 1: Define mathematical objects - two planes
    // Plane 1: x + y + z - 3 = 0 (standard form: ax + by + cz + d = 0)
    const plane1Eq = { a: 1, b: 1, c: 1, d: -3 };
    
    // Plane 2: 2x - y + z - 1 = 0 (standard form: ax + by + cz + d = 0)
    const plane2Eq = { a: 2, b: -1, c: 1, d: -1 };
    
    // STEP 2: Create visual objects using LHS APIs
    
    // Create Plane 1
    const plane1Mesh = planeFromEquation(
        plane1Eq.a, 
        plane1Eq.b, 
        plane1Eq.c, 
        plane1Eq.d,
        {
            size: 8,
            color: 0x3498db,  // Blue
            opacity: 0.4
        }
    );
    scene.add(plane1Mesh);
    objectsMap['plane1'] = { name: 'plane1', mesh: plane1Mesh, method: 'planeFromEquation', delay: 0.3 };
    
    // Label for Plane 1
    const plane1Point = getVisiblePointOnPlane(plane1Eq);
    const plane1LabelPos = {
        x: plane1Point.x + 0.5,
        y: plane1Point.y + 0.5,
        z: plane1Point.z + 0.5
    };
    const plane1Label = label('P₁', plane1LabelPos, {
        color: '#000000'  // BLACK - REQUIRED for all labels
    });
    if (plane1Label) {
        scene.add(plane1Label);
        objectsMap['plane1Label'] = { name: 'plane1Label', mesh: plane1Label, method: 'label', delay: 0.2 };
    }
    
    // Create Plane 2
    const plane2Mesh = planeFromEquation(
        plane2Eq.a,
        plane2Eq.b,
        plane2Eq.c,
        plane2Eq.d,
        {
            size: 8,
            color: 0xe74c3c,  // Red
            opacity: 0.4
        }
    );
    scene.add(plane2Mesh);
    objectsMap['plane2'] = { name: 'plane2', mesh: plane2Mesh, method: 'planeFromEquation', delay: 0.3 };
    
    // Label for Plane 2
    const plane2Point = getVisiblePointOnPlane(plane2Eq);
    const plane2LabelPos = {
        x: plane2Point.x - 0.5,
        y: plane2Point.y + 0.5,
        z: plane2Point.z - 0.5
    };
    const plane2Label = label('P₂', plane2LabelPos, {
        color: '#000000'  // BLACK - REQUIRED for all labels
    });
    if (plane2Label) {
        scene.add(plane2Label);
        objectsMap['plane2Label'] = { name: 'plane2Label', mesh: plane2Label, method: 'label', delay: 0.2 };
    }
    
    // STEP 3: Perform calculations - find intersection line using existing utility
    const intersectionLineData = planesIntersectionLine(plane1Eq, plane2Eq, 10);
    
    let intersectionType = 'none';
    let directionNormalized = null;
    
    if (intersectionLineData) {
        // Planes intersect in a line
        intersectionType = 'line';
        
        // Calculate direction for the description
        const normal1 = { x: plane1Eq.a, y: plane1Eq.b, z: plane1Eq.c };
        const normal2 = { x: plane2Eq.a, y: plane2Eq.b, z: plane2Eq.c };
        const direction = crossProduct(normal1, normal2);
        directionNormalized = normalize(direction);
        
        // Create intersection line using the computed endpoints
        const intersectionLine = line(intersectionLineData.from, intersectionLineData.to, {
            color: 0x2ecc71,  // Green
            thickness: 0.05
        });
        scene.add(intersectionLine);
        objectsMap['intersectionLine'] = { name: 'intersectionLine', mesh: intersectionLine, method: 'line', delay: 0.3 };
        
        // Label for intersection line at midpoint
        const midpoint = {
            x: (intersectionLineData.from.x + intersectionLineData.to.x) / 2,
            y: (intersectionLineData.from.y + intersectionLineData.to.y) / 2,
            z: (intersectionLineData.from.z + intersectionLineData.to.z) / 2
        };
        const intersectionLabel = label('L', midpoint, {
            color: '#000000'  // BLACK - REQUIRED for all labels
        });
        if (intersectionLabel) {
            scene.add(intersectionLabel);
            objectsMap['intersectionLabel'] = { name: 'intersectionLabel', mesh: intersectionLabel, method: 'label', delay: 0.2 };
        }
    } else {
        // Planes are parallel or identical
        // Check if normal vectors are proportional (already confirmed by cross product ≈ 0)
        // Now check if the planes are identical by checking if d values are proportional
        let ratio = 0;
        if (Math.abs(plane2Eq.a) > 0.001) ratio = plane1Eq.a / plane2Eq.a;
        else if (Math.abs(plane2Eq.b) > 0.001) ratio = plane1Eq.b / plane2Eq.b;
        else if (Math.abs(plane2Eq.c) > 0.001) ratio = plane1Eq.c / plane2Eq.c;
        
        if (Math.abs(plane1Eq.d - ratio * plane2Eq.d) < 0.001) {
            intersectionType = 'identical';
        } else {
            intersectionType = 'parallel';
        }
    }
    
    // STEP 4: Build animation sequence and create paginator
    const sequencedObjects = buildAnimationSequence(objectsMap);
    const descriptions = getAllDescriptions(intersectionType, directionNormalized);
    createPaginator(sequencedObjects, descriptions);
}