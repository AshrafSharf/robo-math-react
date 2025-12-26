// Common helper functions for 3D visualization

/**
 * Format a number to at most the specified decimal places, removing trailing zeros
 * This is the standard formatting function that should be used throughout all lessons
 * @param {number} num - The number to format
 * @param {number} decimals - Maximum number of decimal places (default: 2)
 * @returns {string} Formatted number string
 */
export function formatNumber(num, decimals = 2) {
    // Handle special cases
    if (num === 0) return '0';
    if (!isFinite(num)) return num.toString();
    
    // Format to specified decimals and remove trailing zeros
    const formatted = num.toFixed(decimals);
    return parseFloat(formatted).toString();
}

/**
 * Remove a view and its associated elements from the scene
 * Handles various view types: vectors, angle arcs, objects, etc.
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {Object|THREE.Object3D|Array} view - View to remove (object with group/label, single object, or array)
 */
export function removeView(scene, view) {
    if (!view) return;
    
    // Handle arrays of views
    if (Array.isArray(view)) {
        view.forEach(item => removeView(scene, item));
        return;
    }
    
    // Handle view objects with group and label properties
    if (typeof view === 'object') {
        // Vector view: {vectorGroup, label}
        if (view.vectorGroup) {
            scene.remove(view.vectorGroup);
            if (view.label) scene.remove(view.label);
            return;
        }
        
        // Angle arc view: {arc, label}
        if (view.arc) {
            scene.remove(view.arc);
            if (view.label) scene.remove(view.label);
            return;
        }
        
        // Generic view with label
        if (view.label) {
            scene.remove(view.label);
        }
    }
    
    // Handle direct Three.js objects
    if (view && typeof view.isObject3D !== 'undefined') {
        // Check if the object has a label in userData (e.g., from createPointView)
        if (view.userData && view.userData.label) {
            scene.remove(view.userData.label);
        }
        scene.remove(view);
    }
}

// Backward compatibility aliases
export const removeVector = removeView;
export const removeAngleArc = removeView;
export const removeObject = removeView;
export const removeObjects = removeView;

/**
 * Format a vector for LaTeX display
 * @param {Object} vector - Vector with x, y, z components
 * @param {number} precision - Number of decimal places (default: 1)
 * @returns {string} Formatted vector string like "(x, y, z)"
 */
export function formatCoords(coords, options = {}) {
    const {
        precision = 1,
        separator = ', ',
        prefix = '(',
        suffix = ')',
        components = ['x', 'y', 'z']
    } = options;
    
    const values = components
        .filter(comp => coords[comp] !== undefined)
        .map(comp => formatNumber(coords[comp], precision));
    
    return `${prefix}${values.join(separator)}${suffix}`;
}

// Backward compatibility alias
export const formatVector = (vector, precision = 1) => formatCoords(vector, { precision });

/**
 * Format a vector with LaTeX notation
 * @param {string} name - Vector name (e.g., 'a', 'b')
 * @param {Object} vector - Vector with x, y, z components
 * @param {number} precision - Number of decimal places (default: 1)
 * @returns {string} LaTeX formatted string like "$\vec{a} = (x, y, z)$"
 */
export function formatCoordsLatex(name, coords, options = {}) {
    const {
        precision = 1,
        symbol = 'vector',
        customSymbol = '',
        block = false,
        coordOptions = {}
    } = options;
    
    // Choose LaTeX symbol based on type
    let latexSymbol;
    switch (symbol) {
        case 'vector':
            latexSymbol = `\\vec{${name}}`;
            break;
        case 'point':
            latexSymbol = name;
            break;
        case 'position':
            latexSymbol = `\\vec{${name}}`;
            break;
        case 'custom':
            latexSymbol = customSymbol.replace('{name}', name);
            break;
        default:
            latexSymbol = name;
    }
    
    const coordStr = formatCoords(coords, { precision, ...coordOptions });
    const mathContent = `${latexSymbol} = ${coordStr}`;
    
    return block ? `$$${mathContent}$$` : `$${mathContent}$`;
}

// Backward compatibility alias
export const formatVectorLatex = (name, vector, precision = 1) => 
    formatCoordsLatex(name, vector, { precision, symbol: 'vector' });


/**
 * Format an angle from radians to degrees with specified precision
 * @param {number} angleRadians - Angle in radians
 * @param {number} precision - Number of decimal places (default: 1)
 * @returns {string} Formatted angle string like "45.0"
 */
export function formatAngle(angle, options = {}) {
    // Handle legacy usage: formatAngle(angleRadians, precision)
    if (typeof options === 'number') {
        options = { precision: options, unit: 'radians' };
    }
    
    const {
        precision = 1,
        unit = 'radians',
        includeSymbol = false
    } = options;
    
    let degrees;
    if (unit === 'radians') {
        degrees = angle * 180 / Math.PI;
    } else {
        degrees = angle;
    }
    
    const formatted = formatNumber(degrees, precision);
    return includeSymbol ? `${formatted}°` : formatted;
}

/**
 * Format an angle measurement with description
 * @param {string} description - Description of the angle (e.g., "Angle between $\vec{a}$ and $\vec{b}$")
 * @param {number} angleRadians - Angle in radians
 * @param {number} precision - Number of decimal places (default: 1)
 * @returns {string} Formatted string like "Angle between $\vec{a}$ and $\vec{b}$: 45.0°"
 */
export function formatAngleWithDescription(description, angle, options = {}) {
    // Handle legacy usage: formatAngleWithDescription(description, angleRadians, precision)
    if (typeof options === 'number') {
        options = { precision: options, unit: 'radians' };
    }
    
    const formatted = formatAngle(angle, options);
    return `${description}: ${formatted}°`;
}

/**
 * Calculate vector magnitude
 * @param {Object} vector - Vector with x, y, z components
 * @returns {number} Vector magnitude
 */
export function getVectorMagnitude(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
}

// Note: Calculation functions removed - use Three.js methods directly:
// - new THREE.Vector3().length() for magnitude
// - new THREE.Vector3().crossVectors() for cross product
// - vector.angleTo() for angle between vectors
// - See examples in cross_product_plane.js


/**
 * Update stepper values to match a coordinate object (vector, point, position, etc.)
 * @param {Object} steppers - Stepper object returned by createVectorControls
 * @param {Object} coords - Coordinate object with {x, y, z} values
 */
export function updateSteppers(steppers, coords) {
    if (steppers && coords) {
        ['x', 'y', 'z'].forEach(component => {
            if (steppers[component] && steppers[component].valueInput && coords[component] !== undefined) {
                // Get the precision from the stepper's step attribute
                const step = parseFloat(steppers[component].valueInput.step) || 0.1;
                const precision = step >= 1 ? 0 : Math.max(0, -Math.floor(Math.log10(step)));
                steppers[component].valueInput.value = coords[component].toFixed(precision);
            }
        });
    }
}

// Backward compatibility alias
export const updateVectorSteppers = updateSteppers;

/**
 * Check if a vector is near zero (all components less than threshold)
 * @param {Object} vector - Vector with x, y, z components
 * @param {number} threshold - Threshold for considering a component as zero (default: 0.001)
 * @returns {boolean} True if vector is near zero
 */
export function isVectorNearZero(vector, threshold = 0.001) {
    return Math.abs(vector.x) < threshold && 
           Math.abs(vector.y) < threshold && 
           Math.abs(vector.z) < threshold;
}

/**
 * Format an angle as a fraction of π
 * @param {number} angle - Angle in radians or degrees
 * @param {Object} options - Formatting options
 * @param {string} options.unit - 'radians' (default) or 'degrees'
 * @param {number} options.precision - Threshold for matching π values (default: 0.01)
 * @param {number} options.fallbackDecimals - Decimal places for non-π values (default: 2)
 * @returns {string} Formatted angle like "π/4", "2π/3", or decimal
 */
export function formatAngleAsPi(angle, options = {}) {
    const {
        unit = 'radians',
        precision = 0.01,
        fallbackDecimals = 2
    } = options;
    
    // Convert to radians if needed
    const radians = unit === 'degrees' ? angle * Math.PI / 180 : angle;
    
    // Common π fractions to check
    const piValues = [
        { value: 0, display: '0' },
        { value: Math.PI/6, display: '\\pi/6' },
        { value: Math.PI/4, display: '\\pi/4' },
        { value: Math.PI/3, display: '\\pi/3' },
        { value: Math.PI/2, display: '\\pi/2' },
        { value: 2*Math.PI/3, display: '2\\pi/3' },
        { value: 3*Math.PI/4, display: '3\\pi/4' },
        { value: 5*Math.PI/6, display: '5\\pi/6' },
        { value: Math.PI, display: '\\pi' },
        { value: 7*Math.PI/6, display: '7\\pi/6' },
        { value: 5*Math.PI/4, display: '5\\pi/4' },
        { value: 4*Math.PI/3, display: '4\\pi/3' },
        { value: 3*Math.PI/2, display: '3\\pi/2' },
        { value: 5*Math.PI/3, display: '5\\pi/3' },
        { value: 7*Math.PI/4, display: '7\\pi/4' },
        { value: 11*Math.PI/6, display: '11\\pi/6' },
        { value: 2*Math.PI, display: '2\\pi' },
        // Negative angles
        { value: -Math.PI/6, display: '-\\pi/6' },
        { value: -Math.PI/4, display: '-\\pi/4' },
        { value: -Math.PI/3, display: '-\\pi/3' },
        { value: -Math.PI/2, display: '-\\pi/2' },
        { value: -2*Math.PI/3, display: '-2\\pi/3' },
        { value: -3*Math.PI/4, display: '-3\\pi/4' },
        { value: -5*Math.PI/6, display: '-5\\pi/6' },
        { value: -Math.PI, display: '-\\pi' }
    ];
    
    // Check if angle is close to any common π value
    for (let piVal of piValues) {
        if (Math.abs(radians - piVal.value) < precision) {
            return piVal.display;
        }
    }
    
    // Return as decimal fallback
    return radians.toFixed(fallbackDecimals);
}