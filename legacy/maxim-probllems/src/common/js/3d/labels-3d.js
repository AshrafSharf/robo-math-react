// Label creation utilities for 3D Three.js lessons
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

// Font loader for 3D text
let cachedFont = null;
const fontLoader = new FontLoader();

/**
 * Loads a font for 3D text rendering
 */
async function loadFont() {
    if (cachedFont) return cachedFont;
    
    return new Promise((resolve) => {
        fontLoader.load(
            'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
            (font) => {
                cachedFont = font;
                resolve(font);
            }
        );
    });
}

/**
 * Creates a transparent text label sprite for 3D scenes
 * @param {string} text - The text to display
 * @param {THREE.Vector3} position - Position in 3D space
 * @param {Object} options - Label options
 * @returns {THREE.Sprite} The created sprite
 */
export function createTextLabel(text, position, options = {}) {
    const {
        fontSize = 96,
        fontWeight = 'bold',
        fontFamily = 'Arial',
        color = '#000000',
        scale = 0.025,
        backgroundColor = 'transparent',
        padding = 0
    } = options;
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: true });
    canvas.width = 128 + padding * 2;
    canvas.height = 128 + padding * 2;
    
    // Ensure fully transparent background
    context.globalAlpha = 1.0;
    context.globalCompositeOperation = 'source-over';
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Optional background color
    if (backgroundColor !== 'transparent') {
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Set up text rendering
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.globalCompositeOperation = 'source-over';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    texture.needsUpdate = true;
    
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        sizeAttenuation: false,
        transparent: true,
        opacity: 1.0,
        depthTest: true,
        depthWrite: false,
        alphaTest: 0.1
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(scale, scale, 1);
    sprite.position.copy(position);
    
    return sprite;
}

/**
 * Creates a canvas-based label that can render LaTeX or plain text
 * @private
 * @param {string} text - The text to display
 * @param {Object} options - Label options
 * @returns {HTMLCanvasElement} The created canvas
 */
function createCanvasLabel(text, options = {}) {
    const {
        fontSize = 96,
        fontWeight = 'bold',
        fontFamily = 'Arial',
        color = '#000000',
        backgroundColor = 'transparent',
        padding = 0
    } = options;
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: true });
    
    // First, set up the font to measure text properly
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    
    // Measure the actual text dimensions
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    
    // Calculate text height (approximation based on font size)
    // actualBoundingBoxAscent + actualBoundingBoxDescent gives more accurate height if available
    let textHeight;
    if (metrics.actualBoundingBoxAscent && metrics.actualBoundingBoxDescent) {
        textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    } else {
        // Fallback: use fontSize * 1.2 as approximation
        textHeight = fontSize * 1.2;
    }
    
    // Set canvas size based on actual text measurements
    canvas.width = Math.ceil(textWidth + padding * 2);
    canvas.height = Math.ceil(textHeight + padding * 2);
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Optional background
    if (backgroundColor !== 'transparent') {
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Reset font (context is reset after canvas resize)
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    return canvas;
}

/**
 * Creates a LaTeX-rendered label using KaTeX (for static rendering)
 * @private
 * @param {string} latex - The LaTeX string
 * @param {Object} options - Label options
 * @returns {HTMLCanvasElement} The created canvas
 */
async function createLatexLabel(latex, options = {}) {
    const {
        fontSize = 24,
        color = '#000000',
        backgroundColor = 'transparent',
        padding = 4
    } = options;
    
    // For 3D scenes, we need to render LaTeX to canvas
    // This is a simplified version - for full LaTeX support,
    // consider using a library like katex-canvas
    
    // For now, fall back to plain text rendering
    // Remove common LaTeX delimiters
    const plainText = latex.replace(/\$+/g, '').replace(/\\[a-zA-Z]+/g, '');
    
    return createCanvasLabel(plainText, {
        ...options,
        fontSize: fontSize * 4 // Scale up for better quality
    });
}

/**
 * Creates a label sprite for 3D scenes with support for LaTeX
 * @param {string} text - The text to display (can include $ for LaTeX)
 * @param {THREE.Vector3} position - Position in 3D space
 * @param {Object} options - Label options
 * @returns {THREE.Sprite} The created sprite
 */
export function createLabel(text, position, options = {}) {
    const {
        fontSize = 10,
        fontWeight = 'bold',
        fontFamily = 'Arial',
        color = '#000000',
        scale = 0.01,
        backgroundColor = 'transparent',
        padding = 4,
        depthTest = true,
        renderOrder = 0
    } = options;
    
    let canvas;
    
    // Ensure text is a string
    const textStr = String(text);
    
    // Check if text contains LaTeX
    if (textStr.includes('$')) {
        // Use LaTeX rendering
        canvas = createLatexLabel(textStr, {
            fontSize,
            color,
            backgroundColor,
            padding
        });
    } else {
        // Use plain text rendering
        canvas = createCanvasLabel(textStr, {
            fontSize: fontSize * 10, // Scale up for quality
            fontWeight,
            fontFamily,
            color,
            backgroundColor,
            padding
        });
    }
    
    // Handle async canvas creation
    if (canvas instanceof Promise) {
        // If async, create placeholder and update later
        canvas = createCanvasLabel('...', options);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    
    const material = new THREE.SpriteMaterial({
        map: texture,
        sizeAttenuation: false,
        transparent: true,
        opacity: 1.0,
        depthTest: depthTest,
        depthWrite: false
    });
    
    const sprite = new THREE.Sprite(material);
    
    // Calculate aspect ratio from canvas
    const aspect = canvas.width / canvas.height;
    sprite.scale.set(scale * aspect, scale, 1);
    sprite.position.copy(position);
    sprite.renderOrder = renderOrder;
    
    return sprite;
}

// Export font loading function for advanced use cases
export { loadFont };