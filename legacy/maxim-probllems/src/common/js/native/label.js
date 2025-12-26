/**
 * label.js
 * Text label creation using native Three.js coordinates
 */

import * as THREE from 'three';

/**
 * Creates a canvas with text rendered on it
 * @private
 */
function createTextCanvas(text, options = {}) {
    const {
        fontSize = 28,
        fontFamily = 'Arial',
        fontWeight = 'bold',
        color = '#000000',
        backgroundColor = 'transparent',
        padding = 4
    } = options;
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize;
    
    canvas.width = textWidth + padding * 2;
    canvas.height = textHeight + padding * 2;
    
    if (backgroundColor !== 'transparent') {
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    context.fillStyle = color;
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    
    context.fillText(text, padding, canvas.height / 2);
    
    return canvas;
}

/**
 * Creates a text label at a position in 3D space
 * @param {string} text - The text to display
 * @param {Object} position - Position in Three.js coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @returns {THREE.Sprite} The created label sprite
 */
export function label(text, position, options = {}) {
    const {
        fontSize = 28,
        fontFamily = 'Arial',
        fontWeight = 'bold',
        color = '#000000',
        backgroundColor = 'transparent',
        scale = 0.025,
        depthTest = false,
        renderOrder = 1000,
        sizeAttenuation = true  // Allow disabling for orthographic cameras
    } = options;
    
    const canvas = createTextCanvas(text, {
        fontSize,
        fontFamily,
        fontWeight,
        color,
        backgroundColor
    });
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    
    const material = new THREE.SpriteMaterial({
        map: texture,
        sizeAttenuation: sizeAttenuation,
        transparent: true,
        opacity: 1.0,
        depthTest: depthTest,
        depthWrite: false
    });
    
    const sprite = new THREE.Sprite(material);
    
    // Direct positioning in Three.js coordinates
    sprite.position.set(position.x, position.y, position.z || 0);
    
    // Calculate aspect ratio and set scale
    const aspect = canvas.width / canvas.height;
    
    // Different scaling based on sizeAttenuation mode
    let adjustedScale;
    if (sizeAttenuation) {
        // With sizeAttenuation: true, scale is in world units
        adjustedScale = scale * 12;  // Adjusted for better appearance with OrthographicCamera
    } else {
        // With sizeAttenuation: false, scale is in screen pixels
        adjustedScale = scale * fontSize * 2;  // Scale based on font size for orthographic cameras
    }
    
    sprite.scale.set(adjustedScale * aspect, adjustedScale, 1);
    
    sprite.renderOrder = renderOrder;
    
    sprite.userData = {
        text: text,
        labelOptions: options
    };
    
    return sprite;
}