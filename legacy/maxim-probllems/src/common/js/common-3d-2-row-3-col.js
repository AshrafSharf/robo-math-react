/**
 * Common utilities for 3D 2-row-3-col lessons
 * Provides helper functions for managing multiple Three.js scenes
 */

import * as THREE from 'three';
import { COLORS, SIZES } from './colors.js';
import { createArrowView, createLabel, transformToThreeJS } from './common-3d.js';

/**
 * Add coordinate axes to all three scenes
 * @param {THREE.Scene[]} scenes - Array of three scenes
 * @param {Object} options - Options for axes
 */
export function addCoordinateAxesToAll(scenes, options = {}) {
    const {
        length = 5,
        showLabels = true,
        labelOffset = 0.3
    } = options;
    
    scenes.forEach((scene, index) => {
        // Add axes to each scene
        addCoordinateAxes(scene, { length, showLabels, labelOffset });
    });
}

/**
 * Add coordinate axes to a single scene
 * @param {THREE.Scene} scene - The scene to add axes to
 * @param {Object} options - Options for axes
 */
export function addCoordinateAxes(scene, options = {}) {
    const {
        length = 5,
        showLabels = true,
        labelOffset = 0.3
    } = options;
    
    // X-axis (red)
    const xAxis = createArrowView(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1, 0, 0),
        length,
        0xff0000,
        { thickness: 0.02 }
    );
    scene.add(xAxis);
    
    // Y-axis (green)
    const yAxis = createArrowView(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1, 0),
        length,
        0x00ff00,
        { thickness: 0.02 }
    );
    scene.add(yAxis);
    
    // Z-axis (blue)
    const zAxis = createArrowView(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 1),
        length,
        0x0000ff,
        { thickness: 0.02 }
    );
    scene.add(zAxis);
    
    // Add labels if requested
    if (showLabels) {
        const xLabel = createLabel('X', new THREE.Vector3(length + labelOffset, 0, 0), {
            fontSize: 24,
            color: '#000000'
        });
        scene.add(xLabel);
        
        const yLabel = createLabel('Y', new THREE.Vector3(0, length + labelOffset, 0), {
            fontSize: 24,
            color: '#000000'
        });
        scene.add(yLabel);
        
        const zLabel = createLabel('Z', new THREE.Vector3(0, 0, length + labelOffset), {
            fontSize: 24,
            color: '#000000'
        });
        scene.add(zLabel);
    }
}

/**
 * Synchronize camera positions across scenes
 * @param {OrbitControls[]} controls - Array of orbit controls
 * @param {number} sourceIndex - Index of the source control (0, 1, or 2)
 */
export function synchronizeCameras(controls, sourceIndex) {
    const sourceControl = controls[sourceIndex];
    const sourceCamera = sourceControl.object;
    
    controls.forEach((control, index) => {
        if (index !== sourceIndex) {
            // Copy camera position and target
            control.object.position.copy(sourceCamera.position);
            control.target.copy(sourceControl.target);
            control.update();
        }
    });
}

/**
 * Create a grid helper for all scenes
 * @param {THREE.Scene[]} scenes - Array of three scenes
 * @param {Object} options - Grid options
 */
export function addGridToAll(scenes, options = {}) {
    const {
        size = 10,
        divisions = 10,
        colorCenterLine = 0x444444,
        colorGrid = 0x888888
    } = options;
    
    scenes.forEach(scene => {
        const grid = new THREE.GridHelper(size, divisions, colorCenterLine, colorGrid);
        grid.rotation.x = Math.PI / 2; // Rotate to XY plane
        scene.add(grid);
    });
}

/**
 * Create synchronized objects across all three scenes
 * @param {THREE.Scene[]} scenes - Array of three scenes
 * @param {Function} createObjectFn - Function that creates a Three.js object
 * @returns {THREE.Object3D[]} Array of created objects
 */
export function createSynchronizedObjects(scenes, createObjectFn) {
    return scenes.map((scene, index) => {
        const object = createObjectFn(index);
        scene.add(object);
        return object;
    });
}

/**
 * Clear all objects from scenes (except lights and helpers)
 * @param {THREE.Scene[]} scenes - Array of three scenes
 */
export function clearScenes(scenes) {
    scenes.forEach(scene => {
        const objectsToRemove = [];
        scene.traverse(child => {
            if (child.type !== 'AmbientLight' && 
                child.type !== 'DirectionalLight' &&
                child.type !== 'GridHelper' &&
                !child.name?.includes('axis')) {
                objectsToRemove.push(child);
            }
        });
        
        objectsToRemove.forEach(obj => {
            scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(mat => mat.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
    });
}

/**
 * Export scene utilities
 */
export {
    COLORS,
    SIZES,
    createArrowView,
    createLabel,
    transformToThreeJS
};