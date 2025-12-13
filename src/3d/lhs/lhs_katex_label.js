import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { transformToThreeJS } from './lhs_transform.js';

/**
 * Creates a KaTeX label using CSS2DObject for proper mathematical notation
 * @param {string} text - LaTeX text to render
 * @param {Object} position - Position {x, y, z} in mathematical coordinates
 * @param {Object} options - Rendering options
 * @returns {THREE.CSS2DObject} The created label object
 */
export function katexLabel(text, position = {x: 0, y: 0, z: 0}, options = {}) {
    const {
        fontSize = 16,
        color = '#000000',
        className = 'katex-label',
        throwOnError = false
    } = options;
    
    // Create div element for the label
    const div = document.createElement('div');
    div.className = className;
    div.style.fontSize = fontSize + 'px';
    div.style.color = color;
    div.style.pointerEvents = 'none'; // Prevent interaction
    div.style.userSelect = 'none'; // Prevent selection
    
    // Render KaTeX
    if (typeof katex !== 'undefined') {
        try {
            div.innerHTML = katex.renderToString(text, { 
                throwOnError: throwOnError,
                displayMode: false
            });
        } catch (error) {
            console.warn('KaTeX rendering failed:', error);
            div.textContent = text; // Fallback to plain text
        }
    } else {
        // Fallback if KaTeX is not loaded
        div.textContent = text;
    }
    
    // Create CSS2DObject
    const labelObject = new CSS2DObject(div);
    
    // Transform position to Three.js coordinates
    const threeJSPosition = transformToThreeJS(position);
    labelObject.position.set(threeJSPosition.x, threeJSPosition.y, threeJSPosition.z);
    
    return labelObject;
}