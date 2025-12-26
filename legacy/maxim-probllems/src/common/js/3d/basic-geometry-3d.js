/**
 * basic-geometry-3d.js
 * Module for basic geometric primitive creation for 3D Three.js lessons
 * Part of the modularized common-3d system
 * 
 * IMPORTANT: All primitive rendering methods (except createAxesView) accept 
 * coordinates that are already in Three.js coordinate system. If transformation
 * from mathematical/user coordinates is needed, it should be done by the caller
 * before passing to these methods.
 */

import * as THREE from 'three';
import { COLORS, transformToThreeJS } from './core-3d.js';
import { createLabel } from './labels-3d.js';
import { createVectorView } from './vectors-3d.js';

/**
 * Creates standard 3D coordinate axes visualization with labels
 * @param {THREE.Scene} scene - Three.js scene
 * @param {Object} options - Configuration options
 */
export function createAxesView(scene, options = {}) {
    const {
        range = 5,
        tickStep = 1,
        axisWidth = 2,
        labelSize = 0.3,
        showGrid = true,
        showLabels = true
    } = options;
    
    // Create axis group
    const axisGroup = new THREE.Group();
    
    // Custom coordinate system axes
    // X: towards screen (Three.js -Z), Y: right (Three.js +X), Z: up (Three.js +Y)
    
    // X Axis (Red) - Towards screen (Three.js -Z direction)
    const xGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, range),    // X- away from screen
        new THREE.Vector3(0, 0, -range)    // X+ towards screen
    ]);
    const xMaterial = new THREE.LineBasicMaterial({ color: COLORS.X_AXIS, linewidth: axisWidth });
    const xAxis = new THREE.Line(xGeometry, xMaterial);
    axisGroup.add(xAxis);
    
    // Y Axis (Green) - Towards right (Three.js -X direction when viewed from front)
    const yGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(range, 0, 0),    // Y- left
        new THREE.Vector3(-range, 0, 0)    // Y+ right (negative X in Three.js)
    ]);
    const yMaterial = new THREE.LineBasicMaterial({ color: COLORS.Y_AXIS, linewidth: axisWidth });
    const yAxis = new THREE.Line(yGeometry, yMaterial);
    axisGroup.add(yAxis);
    
    // Z Axis (Blue) - Upward (Three.js +Y direction)
    const zGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -range, 0),   // Z- down
        new THREE.Vector3(0, range, 0)     // Z+ up
    ]);
    const zMaterial = new THREE.LineBasicMaterial({ color: COLORS.Z_AXIS, linewidth: axisWidth });
    const zAxis = new THREE.Line(zGeometry, zMaterial);
    axisGroup.add(zAxis);
    
    if (showGrid) {
        // Create filled grid planes with light gray fill
        const gridSize = 2 * range;
        const divisions = Math.floor(gridSize / tickStep);
        
        // For our custom coordinate system (X=screen, Y=right, Z=up)
        // The horizontal plane should be at Z=0 (User coordinates)
        // Which maps to Y=0 in Three.js coordinates
        
        // Horizontal grid plane at Z=0 (User) = Y=0 (Three.js)
        const gridGeometry = new THREE.PlaneGeometry(gridSize, gridSize);
        const gridMaterial = new THREE.MeshBasicMaterial({ 
            color: COLORS.LIGHT_GRAY,
            opacity: 0.1,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            depthTest: true
        });
        const gridPlane = new THREE.Mesh(gridGeometry, gridMaterial);
        gridPlane.rotation.x = -Math.PI / 2; // Rotate to be horizontal (XZ plane in Three.js)
        gridPlane.renderOrder = -1;
        axisGroup.add(gridPlane);
        
        // Add grid lines on the horizontal plane
        const gridLines = new THREE.GridHelper(gridSize, divisions, COLORS.DARK_GRAY, COLORS.GRAY);
        gridLines.material.opacity = 0.4;
        gridLines.material.transparent = true;
        axisGroup.add(gridLines);
    }
    
    // Add tick marks
    const tickSize = 0.1;
    const tickMaterial = new THREE.LineBasicMaterial({ color: COLORS.BLACK });
    
    for (let i = -range; i <= range; i += tickStep) {
        if (i === 0) continue;
        
        // X-axis ticks
        const xTickGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(i, -tickSize, 0),
            new THREE.Vector3(i, tickSize, 0)
        ]);
        axisGroup.add(new THREE.Line(xTickGeometry, tickMaterial));
        
        // Y-axis ticks
        const yTickGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-tickSize, i, 0),
            new THREE.Vector3(tickSize, i, 0)
        ]);
        axisGroup.add(new THREE.Line(yTickGeometry, tickMaterial));
        
        // Z-axis ticks
        const zTickGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -tickSize, i),
            new THREE.Vector3(0, tickSize, i)
        ]);
        axisGroup.add(new THREE.Line(zTickGeometry, tickMaterial));
    }
    
    // Add axis labels using canvas-based approach
    if (showLabels) {
        // X axis label - at the positive end of X axis (towards screen)
        // In user coords: X at (range + 0.5, 0, 0)
        // In Three.js coords: at (0, 0, -(range + 0.5))
        const xLabel = createLabel('X', transformToThreeJS({ x: range + 0.5, y: 0, z: 0 }), {
            fontSize: 36,
            fontWeight: 'bold',
            color: '#000000',
            backgroundColor: 'transparent',
            padding: 3,
            scale: 0.025  // Moderate scale for good visibility
        });
        scene.add(xLabel);
        
        // Y axis label - at the positive end of Y axis (towards right)
        // In user coords: Y at (0, range + 0.5, 0)
        // In Three.js coords: at (-(range + 0.5), 0, 0)
        const yLabel = createLabel('Y', transformToThreeJS({ x: 0, y: range + 0.5, z: 0 }), {
            fontSize: 36,
            fontWeight: 'bold',
            color: '#000000',
            backgroundColor: 'transparent',
            padding: 3,
            scale: 0.025  // Moderate scale for good visibility
        });
        scene.add(yLabel);
        
        // Z axis label - at the positive end of Z axis (upward)
        // In user coords: Z at (0, 0, range + 0.5)
        // In Three.js coords: at (0, range + 0.5, 0)
        const zLabel = createLabel('Z', transformToThreeJS({ x: 0, y: 0, z: range + 0.5 }), {
            fontSize: 36,
            fontWeight: 'bold',
            color: '#000000',
            backgroundColor: 'transparent',
            padding: 3,
            scale: 0.025  // Moderate scale for good visibility
        });
        scene.add(zLabel);
        
        // Add tick labels using canvas-based approach
        for (let i = -range; i <= range; i += tickStep) {
            if (i === 0) continue;
            
            // X-axis tick labels (along X axis in user coords)
            // Place below the axis for visibility
            const xTickLabel = createLabel(i.toString(), transformToThreeJS({ x: i, y: 0, z: -0.3 }), {
                fontSize: 24,
                color: '#000000',
                backgroundColor: 'transparent',
                padding: 2,
                scale: 0.015
            });
            scene.add(xTickLabel);
            
            // Y-axis tick labels (along Y axis in user coords)
            // Place below the axis for visibility
            const yTickLabel = createLabel(i.toString(), transformToThreeJS({ x: 0, y: i, z: -0.3 }), {
                fontSize: 24,
                color: '#000000',
                backgroundColor: 'transparent',
                padding: 2,
                scale: 0.015
            });
            scene.add(yTickLabel);
            
            // Z-axis tick labels (along Z axis in user coords)
            // Place to the left of the axis for visibility
            const zTickLabel = createLabel(i.toString(), transformToThreeJS({ x: -0.3, y: 0, z: i }), {
                fontSize: 24,
                color: '#000000',
                backgroundColor: 'transparent',
                padding: 2,
                scale: 0.015
            });
            scene.add(zTickLabel);
        }
    }
    
    scene.add(axisGroup);
    return axisGroup;
}

/**
 * Creates a normal vector through a plane equation
 * Displays both the normal vector and its projections
 * @param {THREE.Object3D} parent - Parent object
 * @param {Object} planeEq - Plane equation {a, b, c, d} for ax + by + cz + d = 0
 * @param {Object} options - Visualization options
 */
export function createNormalVectorThroughPlaneEquation(parent, planeEq, options = {}) {
    const {
        // origin parameter removed - not used
        scale = 1,
        color = COLORS.BLUE,
        showProjections = true,
        projectionColor = COLORS.GRAY,
        projectionOpacity = 0.5,
        labelText = 'n⃗',
        interactive = true
    } = options;
    
    // Extract normal vector from plane equation
    const normal = { 
        x: planeEq.a * scale, 
        y: planeEq.b * scale, 
        z: planeEq.c * scale 
    };
    
    // Create the main normal vector
    const normalVector = createVectorView(parent, normal, {
        color: color,
        labelText: labelText,
        interactive: interactive
    });
    
    if (showProjections) {
        // Create projections onto coordinate planes
        const projections = [
            { // XY plane projection (z = 0)
                vector: { x: normal.x, y: normal.y, z: 0 },
                color: projectionColor,
                labelText: `${labelText}_{xy}`
            },
            { // XZ plane projection (y = 0)
                vector: { x: normal.x, y: 0, z: normal.z },
                color: projectionColor,
                labelText: `${labelText}_{xz}`
            },
            { // YZ plane projection (x = 0)
                vector: { x: 0, y: normal.y, z: normal.z },
                color: projectionColor,
                labelText: `${labelText}_{yz}`
            }
        ];
        
        projections.forEach(proj => {
            const projVector = createVectorView(parent, proj.vector, {
                color: proj.color,
                labelText: proj.labelText,
                thickness: 0.05,
                headLength: 0.3,
                interactive: false
            });
            
            if (projVector.vectorGroup) {
                projVector.vectorGroup.material = new THREE.MeshPhongMaterial({
                    color: proj.color,
                    opacity: projectionOpacity,
                    transparent: true
                });
            }
        });
    }
    
    return normalVector;
}

// Re-export functions that are now in other modules for backward compatibility
export { createArrowView } from './primitives-3d.js';
export { createVectorView, createVectorWithLabel, createPointView } from './vectors-3d.js';
export { createPolylineView, createLineView } from './primitives-3d.js';