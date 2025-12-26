/**
 * vectors-3d.js
 * Module for vector-related 3D visualizations
 * Part of the modularized common-3d system
 */

import * as THREE from 'three';
import { COLORS } from './core-3d.js';
import { createArrowView } from './primitives-3d.js';
import { createLabel } from './labels-3d.js';
import { projectionSystem, addInteractiveObject } from './interactive-3d.js';
import { createVectorControls } from './control-panel-3d.js';

/**
 * Creates a 3D vector visualization with arrow and optional label
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Object} vector - Vector components {x, y, z} in Three.js coordinate system
 * @param {Object} options - Vector options
 * @returns {Object} - {vectorGroup, label} or null if vector too small
 */
export function createVectorView(parent, vector, options = {}) {
    const {
        // Vector visualization options
        color = COLORS.RED,
        labelText = 'v⃗',
        labelColor = null,
        labelOffset = { x: 0.3, y: 0.3, z: 0.3 },
        labelScale = 0.025,  // Default scale for 3D labels per CLAUDE.md
        headLength = 0.4,
        headWidth = 0.3,
        thickness = 0.1,
        minLength = 0.01,
        labelPosition = 0.5, // Position along vector (0 = origin, 1 = tip)
        interactive = true,   // Enable coordinate projection on click by default
        
        // Control panel integration (backward compatibility)
        controlPanel = null,
        showControls = false,
        vectorName = 'vector',
        displayName = null,
        yPosition = 60,
        min = -3,
        max = 3,
        step = 0.1,
        precision = 1
    } = options;
    
    // Create Three.js vector from input (already in Three.js coordinates)
    const threeJSVector = new THREE.Vector3(vector.x, vector.y, vector.z);
    const length = threeJSVector.length();
    
    // Skip if vector too small
    if (length < minLength) {
        return { vectorGroup: null, label: null };
    }
    
    // Create vector arrow
    const vectorGroup = createArrowView(
        new THREE.Vector3(0, 0, 0),
        threeJSVector,
        length,
        color,
        { headLength, headWidth, thickness }
    );
    
    let label = null;
    
    if (vectorGroup) {
        parent.add(vectorGroup);
        
        // Create label at specified position along vector (in Three.js coordinates)
        const labelPos = threeJSVector.clone().multiplyScalar(labelPosition);
        const threeJSOffset = new THREE.Vector3(labelOffset.x, labelOffset.y, labelOffset.z);
        const finalLabelPos = labelPos.add(threeJSOffset);
        
        label = createLabel(labelText, finalLabelPos, {
            color: labelColor || '#000000',
            fontSize: 24,
            scale: labelScale
        });
        
        if (label) {
            parent.add(label);
        }
        
        // Add interactive coordinate projection if enabled
        if (interactive && projectionSystem.isEnabled) {
            addInteractiveObject(
                vectorGroup,
                () => vector,  // Return Three.js coordinates
                labelText || 'Vector'
            );
        }
        
        // Add control panel integration if requested (backward compatibility)
        if ((showControls || controlPanel) && controlPanel) {
            const sliders = createVectorControls(controlPanel, vector, {
                vectorName,
                displayName: displayName || labelText,
                yPosition,
                min,
                max,
                step,
                precision,
                onChange: (newVector) => {
                    // Update vector visualization
                    const newThreeVector = new THREE.Vector3(newVector.x, newVector.y, newVector.z);
                    const newLength = newThreeVector.length();
                    
                    if (newLength >= minLength) {
                        // Update arrow direction and length
                        vectorGroup.setDirection(newThreeVector.normalize());
                        vectorGroup.setLength(newLength, newLength * 0.2, newLength * 0.1);
                        
                        // Update label position
                        if (label) {
                            const newLabelPos = newThreeVector.clone().multiplyScalar(labelPosition);
                            const newFinalPos = newLabelPos.add(new THREE.Vector3(labelOffset.x, labelOffset.y, labelOffset.z));
                            label.position.copy(newFinalPos);
                        }
                    }
                }
            });
            
            // Store slider reference on the vectorGroup for external access
            vectorGroup.userData.sliders = sliders;
        }
    }
    
    return { vectorGroup, label };
}

/**
 * Creates a 3D vector with label (backward compatibility)
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Object} vector - Vector components {x, y, z}
 * @param {Object} options - Vector options
 * @returns {Object} - {vectorGroup, label}
 */
export function createVectorWithLabel(parent, vector, options = {}) {
    return createVectorView(parent, vector, { ...options, showControls: false });
}

/**
 * Creates a 3D point visualization (sphere) at the given position
 * @param {THREE.Object3D} parent - Parent object (scene or group)
 * @param {Object} position - Position {x, y, z} in Three.js coordinate system
 * @param {Object} options - Point options
 * @returns {THREE.Mesh} The created point
 */
export function createPointView(parent, position, options = {}) {
    const {
        color = COLORS.RED,
        radius = 0.1,
        segments = 16,
        interactive = true,  // Enable coordinate projection on click by default
        label = null,        // Optional label for the point
        labelColor = '#000000',
        labelOffset = { x: 0.2, y: 0.2, z: 0 },
        labelFontSize = 18   // Add support for labelFontSize
    } = options;
    
    // Create Three.js vector from position (already in Three.js coordinates)
    const threePos = new THREE.Vector3(position.x, position.y, position.z);
    
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    const material = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 150,
        specular: 0x444444
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(threePos);
    
    parent.add(sphere);
    
    // Add label if provided
    if (label) {
        const labelObj = createLabel(label, {
            x: threePos.x + labelOffset.x,
            y: threePos.y + labelOffset.y,
            z: threePos.z + labelOffset.z
        }, {
            color: labelColor,
            fontSize: labelFontSize,
            scale: labelFontSize > 20 ? 0.018 : 0.01  // Larger scale for bigger fonts
        });
        
        if (labelObj) {
            parent.add(labelObj);
            sphere.userData.label = labelObj;
        }
    }
    
    // Add interactive coordinate projection if enabled
    if (interactive && projectionSystem.isEnabled) {
        addInteractiveObject(
            sphere,
            () => position,  // Return Three.js coordinates
            label || `Point`
        );
    }
    
    return sphere;
}