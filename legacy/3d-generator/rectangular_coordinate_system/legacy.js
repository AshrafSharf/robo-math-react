// Rectangular Coordinate System 3D Visualization - Refactored following render-method-instructions.md
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { point } from '../common/js/lhs/lhs_point.js';
import { line } from '../common/js/lhs/lhs_line.js';
import { pointProjection } from '../common/js/lhs/lhs_point_projection.js';
import { label } from '../common/js/lhs/lhs_label.js';
import { cuboid } from '../common/js/lhs/lhs_cuboid.js';
import { createPaginator } from '../common/js/lhs/lhs_paginator.js';
import { getAllDescriptions } from './step_descriptions.js';

/**
 * Build the animation sequence order for the visualization
 * Follows the logical flow of understanding rectangular coordinates
 * @param {Object} objectsMap - Map of all created objects with their metadata
 * @returns {Array} Ordered array of objects for animation sequence
 */
function buildAnimationSequence(objectsMap) {
    const sequencedObjects = [];
    
    // Step 1: Show the coordinate axes
    // Establish the 3D coordinate system
    
    // Step 2: Show the point P
    // Place the point in 3D space
    if (objectsMap['pointP']) sequencedObjects.push(objectsMap['pointP']);
    if (objectsMap['pointPLabel']) sequencedObjects.push(objectsMap['pointPLabel']);
    
    // Step 3: Show the diagonal from origin to point
    // Connect origin to point P first to establish the main vector
    if (objectsMap['diagonal']) sequencedObjects.push(objectsMap['diagonal']);
    if (objectsMap['diagonalLabel']) sequencedObjects.push(objectsMap['diagonalLabel']);
    
    // Step 4: Show projection lines
    // Show all three projection lines parallel to axes
    if (objectsMap['projectionLines']) sequencedObjects.push(objectsMap['projectionLines']);
    
    // Step 5: Show coordinate labels on axes
    if (objectsMap['xLabel']) sequencedObjects.push(objectsMap['xLabel']);
    if (objectsMap['yLabel']) sequencedObjects.push(objectsMap['yLabel']);
    if (objectsMap['zLabel']) sequencedObjects.push(objectsMap['zLabel']);
    
    // Step 6: Show the rectangular box (cuboid)
    // Visualize how coordinates form a rectangular box
    if (objectsMap['coordinateBox']) sequencedObjects.push(objectsMap['coordinateBox']);
    
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
        lightingProfile: 'phong'
    });
    
    // STEP 1: Define mathematical objects
    // Example point in 3D rectangular coordinates
    const P = { x: 4, y: 3, z: 5 };
    const origin = { x: 0, y: 0, z: 0 };
    
    // STEP 2: Create visual objects using LHS APIs
    // Create the main point P
    const pointPMesh = point(P, {
        color: 0xff0000,
        radius: 0.15
    });
    scene.add(pointPMesh);
    objectsMap['pointP'] = { name: 'pointP', mesh: pointPMesh, method: 'point', delay: 0.3 };
    
    // Label for point P
    const pointPLabel = label('P(4, 3, 5)', 
        { x: P.x + 0.3, y: P.y + 0.3, z: P.z + 0.3 }, 
        { color: '#000000' }
    );
    if (pointPLabel) {
        scene.add(pointPLabel);
        objectsMap['pointPLabel'] = { name: 'pointPLabel', mesh: pointPLabel, method: 'label', delay: 0.2 };
    }
    
    // STEP 3: Create projection lines using pointProjection
    // This creates 3 dashed lines parallel to the axes showing proper rectangular coordinates
    const projectionLinesMesh = pointProjection(P, {
        radius: 0.04,  // Thicker cylinders for better visibility
        opacity: 0.9,  // High opacity
        dashed: true,
        dashSize: 0.3,  // Larger dashes
        gapSize: 0.15,  // Proportional gaps
        colors: {
            x: 0xff0000,  // Red for line parallel to X
            y: 0x00ff00,  // Green for line parallel to Y
            z: 0x0088ff   // Blue for line parallel to Z
        }
    });
    // Since pointProjection returns a Group, we need to handle it specially
    scene.add(projectionLinesMesh);
    // No need to pre-set opacity - paginator's hideObject will handle it when Start is clicked
    objectsMap['projectionLines'] = { name: 'projectionLines', mesh: projectionLinesMesh, method: 'pointProjection', delay: 0.4 };
    
    // Add coordinate labels on the axes
    const xLabelMesh = label(`x = ${P.x}`, 
        { x: P.x, y: -0.5, z: 0 },
        { color: '#000000' }
    );
    if (xLabelMesh) {
        scene.add(xLabelMesh);
        objectsMap['xLabel'] = { name: 'xLabel', mesh: xLabelMesh, method: 'label', delay: 0.2 };
    }
    
    const yLabelMesh = label(`y = ${P.y}`,
        { x: -0.5, y: P.y, z: 0 },
        { color: '#000000' }
    );
    if (yLabelMesh) {
        scene.add(yLabelMesh);
        objectsMap['yLabel'] = { name: 'yLabel', mesh: yLabelMesh, method: 'label', delay: 0.2 };
    }
    
    const zLabelMesh = label(`z = ${P.z}`,
        { x: 0, y: -0.5, z: P.z },
        { color: '#000000' }
    );
    if (zLabelMesh) {
        scene.add(zLabelMesh);
        objectsMap['zLabel'] = { name: 'zLabel', mesh: zLabelMesh, method: 'label', delay: 0.2 };
    }
    
    // STEP 4: Create rectangular box (cuboid) showing the coordinate system
    const coordinateBoxMesh = cuboid(
        origin,
        P,
        {
            color: 0x4488ff,
            opacity: 0.2,
            edgeColor: 0x0000ff,
            edgeOpacity: 0.6
        }
    );
    scene.add(coordinateBoxMesh);
    // No need to pre-set opacity - paginator's hideObject will handle it when Start is clicked
    objectsMap['coordinateBox'] = { name: 'coordinateBox', mesh: coordinateBoxMesh, method: 'cuboid', delay: 0.5 };
    
    // STEP 5: Create diagonal from origin to point P using line (which creates a thick cylinder)
    const diagonalMesh = line(origin, P, {
        color: 0x8844ff,
        radius: 0.04  // Thick purple diagonal
    });
    scene.add(diagonalMesh);
    objectsMap['diagonal'] = { 
        name: 'diagonal', 
        mesh: diagonalMesh, 
        method: 'line',  // Use line animator for grow effect
        delay: 0.4
    };
    
    // Calculate diagonal length for display
    const diagonalLength = Math.sqrt(P.x * P.x + P.y * P.y + P.z * P.z);
    const diagonalMidpoint = {
        x: P.x / 2,
        y: P.y / 2 - 0.5,
        z: P.z / 2
    };
    
    const diagonalLabelMesh = label(`d = ${diagonalLength.toFixed(2)}`,
        diagonalMidpoint,
        { color: '#000000' }
    );
    if (diagonalLabelMesh) {
        scene.add(diagonalLabelMesh);
        objectsMap['diagonalLabel'] = { name: 'diagonalLabel', mesh: diagonalLabelMesh, method: 'label', delay: 0.2 };
    }
    
    // STEP 6: Build animation sequence and create paginator
    const sequencedObjects = buildAnimationSequence(objectsMap);
    const descriptions = getAllDescriptions(
        P.x.toString(),
        P.y.toString(),
        P.z.toString(),
        diagonalLength.toFixed(2)
    );
    createPaginator(sequencedObjects, descriptions);
}