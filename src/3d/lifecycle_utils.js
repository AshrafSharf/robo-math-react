/**
 * Lifecycle utility functions for managing 3D diagram objects
 * Handles clearing, hiding, and showing objects in the scene
 */

import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

/**
 * Clear all objects from the scene
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {Array} objects - Array of tracked objects
 */
export function clearAll(scene, objects) {
    objects.forEach(obj => {
        if (obj) {
            // Remove from scene
            scene.remove(obj);
            
            // Dispose of geometry and material if they exist
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(mat => mat.dispose());
                } else {
                    obj.material.dispose();
                }
            }
            
            // Handle CSS2DObject labels
            if (obj.label && obj.label instanceof CSS2DObject) {
                scene.remove(obj.label);
                if (obj.label.element && obj.label.element.parentNode) {
                    obj.label.element.parentNode.removeChild(obj.label.element);
                }
            }
            
            // Recursively dispose children
            if (obj.children && obj.children.length > 0) {
                obj.children.forEach(child => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => mat.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                    
                    // Handle CSS2DObject children
                    if (child instanceof CSS2DObject) {
                        if (child.element && child.element.parentNode) {
                            child.element.parentNode.removeChild(child.element);
                        }
                    }
                });
            }
        }
    });
    
    // Clear the objects array
    objects.length = 0;
}

/**
 * Hide all objects in the scene
 * @param {Array} objects - Array of tracked objects
 */
export function hideAll(objects) {
    objects.forEach(obj => {
        if (obj) {
            obj.visible = false;
            
            // Hide CSS2DObject labels
            if (obj.label && obj.label.element) {
                obj.label.element.style.display = 'none';
            }
            
            // Also hide any CSS2DObject children
            if (obj.children) {
                obj.children.forEach(child => {
                    if (child.element && child.element.style) {
                        child.element.style.display = 'none';
                    }
                });
            }
        }
    });
}

/**
 * Show all objects in the scene
 * @param {Array} objects - Array of tracked objects
 */
export function showAll(objects) {
    objects.forEach(obj => {
        if (obj) {
            obj.visible = true;
            
            // Show CSS2DObject labels
            if (obj.label && obj.label.element) {
                obj.label.element.style.display = 'block';
            }
            
            // Also show any CSS2DObject children
            if (obj.children) {
                obj.children.forEach(child => {
                    if (child.element && child.element.style) {
                        child.element.style.display = 'block';
                    }
                });
            }
        }
    });
}