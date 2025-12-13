import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { transformToThreeJS } from './lhs_transform.js';
import katex from 'katex';

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
    
    // Set font for measuring
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    
    // Measure text
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize;
    
    // Set canvas size with padding
    canvas.width = textWidth + padding * 2;
    canvas.height = textHeight + padding * 2;
    
    // Clear and set background if needed
    if (backgroundColor !== 'transparent') {
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Set font again (canvas was resized)
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    context.fillStyle = color;
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    
    // Draw text centered with padding
    context.fillText(text, padding, canvas.height / 2);
    
    return canvas;
}

/**
 * Creates a basic text label at a position in 3D space
 * Automatically uses CSS2DObject with KaTeX for LaTeX content
 * @param {string} text - The text to display (plain text or LaTeX)
 * @param {Object} position - Position in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.fontSize - Font size in pixels (default: 24)
 * @param {string} options.fontFamily - Font family (default: 'Arial')
 * @param {string} options.fontWeight - Font weight (default: 'normal')
 * @param {string} options.color - Text color (default: '#000000')
 * @param {string} options.backgroundColor - Background color (default: 'transparent')
 * @param {number} options.scale - Scale factor for the sprite (default: 0.02)
 * @param {boolean} options.depthTest - Whether to test depth (default: false for visibility on top)
 * @param {number} options.renderOrder - Render order (default: 1000 to render last)
 * @param {boolean} options.isLatex - Force LaTeX rendering (default: auto-detect)
 * @returns {THREE.Sprite|THREE.CSS2DObject} The created label object
 */
export function label(text, position, options = {}) {
    const {
        fontSize = 28,
        fontFamily = 'Arial',
        fontWeight = 'bold',
        color = '#000000',  // Default to black for labels
        backgroundColor = 'transparent',
        scale = 0.025,
        depthTest = false,
        renderOrder = 1000,
        isLatex = false,
        offset = { x: 0.3, y: 0.3, z: 0 }  // Default offset for labels
    } = options;
    
    // Check if we should use KaTeX (detect LaTeX patterns or explicit flag)
    const shouldUseKatex = isLatex || 
                          text.includes('\\vec') || 
                          text.includes('\\overrightarrow') ||
                          text.includes('\\hat') ||
                          text.includes('\\overline') ||
                          text.includes('\\cdot') ||
                          text.includes('\\times') ||
                          text.includes('\\frac') ||
                          text.includes('_') ||
                          text.includes('^');
    
    // Transform position to Three.js coordinates and apply offset
    const offsetPosition = {
        x: position.x + (offset.x || 0),
        y: position.y + (offset.y || 0),
        z: position.z + (offset.z || 0)
    };
    const threePos = transformToThreeJS(offsetPosition);
    
    // If text contains LaTeX, use CSS2DObject with KaTeX
    if (shouldUseKatex) {
        // Create div element for the label
        const div = document.createElement('div');
        div.className = 'katex-label';
        // CSS2DObject renders at screen size, we need much larger font
        // For 3D scenes, multiply the font size to make labels clearly visible
        const screenFontSize = Math.max(24, fontSize * 1.5);
        div.style.fontSize = screenFontSize + 'px';
        div.style.color = color;
        div.style.fontFamily = fontFamily;
        div.style.fontWeight = fontWeight;
        div.style.pointerEvents = 'none';
        div.style.userSelect = 'none';
        
        if (backgroundColor !== 'transparent') {
            div.style.backgroundColor = backgroundColor;
            div.style.padding = '2px 4px';
            div.style.borderRadius = '2px';
        }
        
        try {
            // Render LaTeX with KaTeX
            const katexHTML = katex.renderToString(text, { 
                throwOnError: false,
                displayMode: false
            });
            // Set the HTML
            div.innerHTML = katexHTML;
            // Force color on all child elements after rendering
            const allElements = div.querySelectorAll('*');
            allElements.forEach(element => {
                element.style.setProperty('color', color, 'important');
                // Also remove any inline color styles that might have been set
                if (element.style.color && element.style.color !== color) {
                    element.style.color = color;
                }
            });
        } catch (error) {
            console.warn('KaTeX rendering failed:', error);
            div.textContent = text;
        }
        
        // Create CSS2DObject
        const labelObject = new CSS2DObject(div);
        labelObject.position.set(threePos.x, threePos.y, threePos.z);
        
        // CSS2DObject doesn't have renderOrder, but the div can have z-index
        div.style.zIndex = renderOrder;
        
        // Store the base font size and element for scaling
        labelObject.userData.baseFontSize = screenFontSize;
        labelObject.userData.element = div;
        labelObject.userData.isKatexLabel = true;
        
        return labelObject;
    }
    
    // Fallback to sprite-based rendering for non-LaTeX text
    const canvas = createTextCanvas(text, {
        fontSize,
        fontFamily,
        fontWeight,
        color,
        backgroundColor
    });
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    
    // Create sprite material
    const material = new THREE.SpriteMaterial({
        map: texture,
        sizeAttenuation: true,
        transparent: true,
        opacity: 1.0,
        depthTest: depthTest,
        depthWrite: false
    });
    
    // Create sprite
    const sprite = new THREE.Sprite(material);
    
    // Calculate aspect ratio and set scale
    const aspect = canvas.width / canvas.height;
    const adjustedScale = scale * 12;
    sprite.scale.set(adjustedScale * aspect, adjustedScale, 1);
    
    sprite.position.set(threePos.x, threePos.y, threePos.z);
    sprite.renderOrder = renderOrder;
    
    return sprite;
}

/**
 * Creates a unit vector label (e.g., î, ĵ, k̂)
 * @param {string} vectorName - The vector name (e.g., 'i', 'j', 'k', 'n', 'v')
 * @param {Object} position - Position in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options (same as label plus defaults)
 * @returns {THREE.Sprite|THREE.CSS2DObject} The created label sprite with hat notation
 */
export function unitVectorLabel(vectorName, position, options = {}) {
    // Use LaTeX for hat notation
    const latexText = `\\hat{${vectorName}}`;
    
    // Set defaults for unit vector labels
    const unitVectorOptions = {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        isLatex: true,
        ...options
    };
    
    return label(latexText, position, unitVectorOptions);
}

/**
 * Creates a vector label with arrow notation (e.g., v⃗)
 * @param {string} vectorName - The vector name (e.g., 'v', 'F', 'r')
 * @param {Object} position - Position in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options (same as label plus defaults)
 * @returns {THREE.Sprite|THREE.CSS2DObject} The created label sprite with arrow notation
 */
export function vectorLabel(vectorName, position, options = {}) {
    // Use LaTeX for vector arrow notation
    const latexText = `\\vec{${vectorName}}`;
    
    // Set defaults for vector labels
    const vectorOptions = {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        isLatex: true,
        ...options
    };
    
    return label(latexText, position, vectorOptions);
}

/**
 * Creates a coordinate label (e.g., "(1, 2, 3)")
 * Automatically positions the label at the given coordinates
 * @param {number} x - X coordinate value
 * @param {number} y - Y coordinate value
 * @param {number} z - Z coordinate value
 * @param {Object} options - Configuration options
 * @param {Object} options.offset - Position offset from the point (default: {x: 0.2, y: 0.2, z: 0})
 * @param {number} options.decimals - Number of decimal places (default: 1)
 * @param {boolean} options.showParentheses - Show parentheses (default: true)
 * @returns {THREE.Sprite|THREE.CSS2DObject} The created coordinate label sprite
 */
export function coordinatesLabel(x, y, z, options = {}) {
    const {
        offset = { x: 0.2, y: 0.2, z: 0 },
        decimals = 1,
        showParentheses = true,
        fontSize = 20,
        fontFamily = 'monospace',
        color = '#333333',
        backgroundColor = 'rgba(255, 255, 255, 0.8)',
        ...otherOptions
    } = options;
    
    // Format coordinates
    const xStr = x.toFixed(decimals);
    const yStr = y.toFixed(decimals);
    const zStr = z.toFixed(decimals);
    
    // Create coordinate text
    const text = showParentheses 
        ? `(${xStr}, ${yStr}, ${zStr})`
        : `${xStr}, ${yStr}, ${zStr}`;
    
    // Calculate label position (at the point plus offset)
    const labelPosition = {
        x: x + offset.x,
        y: y + offset.y,
        z: z + offset.z
    };
    
    // Create the label with coordinate-specific defaults
    return label(text, labelPosition, {
        fontSize,
        fontFamily,
        color,
        backgroundColor,
        ...otherOptions
    });
}

/**
 * Creates a subscripted label (e.g., "v₁", "P₀")
 * @param {string} base - The base text
 * @param {string} subscript - The subscript text
 * @param {Object} position - Position in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options (same as label)
 * @returns {THREE.Sprite|THREE.CSS2DObject} The created label sprite with subscript
 */
export function subscriptLabel(base, subscript, position, options = {}) {
    // Use LaTeX for subscript
    const latexText = `${base}_{${subscript}}`;
    
    return label(latexText, position, {
        isLatex: true,
        ...options
    });
}

/**
 * Creates a superscripted label (e.g., "x²", "v³")
 * @param {string} base - The base text
 * @param {string} superscript - The superscript text
 * @param {Object} position - Position in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options (same as label)
 * @returns {THREE.Sprite|THREE.CSS2DObject} The created label sprite with superscript
 */
export function superscriptLabel(base, superscript, position, options = {}) {
    // Use LaTeX for superscript
    const latexText = `${base}^{${superscript}}`;
    
    return label(latexText, position, {
        isLatex: true,
        ...options
    });
}

/**
 * Creates an angle label (e.g., "θ", "α", "β", "γ", "φ")
 * @param {string} angleSymbol - The angle symbol or text
 * @param {Object} position - Position in mathematical coordinates {x, y, z}
 * @param {Object} options - Configuration options (same as label plus defaults)
 * @returns {THREE.Sprite|THREE.CSS2DObject} The created angle label sprite
 */
export function angleLabel(angleSymbol, position, options = {}) {
    // Set defaults for angle labels
    const angleOptions = {
        fontSize: 24,
        fontFamily: 'Times New Roman',
        fontStyle: 'italic',
        color: '#000000',
        ...options
    };
    
    return label(angleSymbol, position, angleOptions);
}