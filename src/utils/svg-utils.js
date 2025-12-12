/**
 * SVG.js utility functions for shape manipulation
 * Abstracts away SVG.js version-specific APIs
 */

/**
 * Clone an SVG.js element and add it to the same parent
 * @param {Object} element - SVG.js element (shapeGroup or primitiveShape)
 * @returns {Object} The cloned SVG.js element
 */
export function cloneElement(element) {
    if (!element) return null;
    const clone = element.clone();
    element.parent().add(clone);
    return clone;
}

/**
 * Get the path element from an SVG.js element
 * Handles both direct path elements and groups containing paths
 * @param {Object} element - SVG.js element
 * @returns {Object|null} The path element or null if not found
 */
export function getPathElement(element) {
    if (!element) return null;

    // Direct path element
    if (element.type === 'path') {
        return element;
    }

    // Group containing path - use SVG.js 2.x select() API
    if (typeof element.select === 'function') {
        const paths = element.select('path');
        return paths.first ? paths.first() : paths[0];
    }

    // Fallback: try to access children directly
    if (element.children && element.children().length > 0) {
        const children = element.children();
        for (let i = 0; i < children.length; i++) {
            if (children[i].type === 'path') {
                return children[i];
            }
        }
    }

    return null;
}

/**
 * Update a path element's d attribute
 * @param {Object} pathElement - SVG.js path element
 * @param {string} pathString - SVG path d attribute value
 */
export function updatePath(pathElement, pathString) {
    if (pathElement && typeof pathElement.attr === 'function') {
        pathElement.attr('d', pathString);
    }
}

/**
 * Remove an SVG.js element from its parent
 * @param {Object} element - SVG.js element to remove
 */
export function removeElement(element) {
    if (element && typeof element.parent === 'function' && element.parent()) {
        element.remove();
    }
}

/**
 * Generate SVG path string from flat coordinate array (for lines/polygons)
 * @param {number[]} coords - Flat array of [x1, y1, x2, y2, ...]
 * @returns {string} SVG path d attribute value
 */
export function generateLinePath(coords) {
    if (!coords || coords.length < 4) return '';
    let d = `M ${coords[0]} ${coords[1]}`;
    for (let i = 2; i < coords.length; i += 2) {
        d += ` L ${coords[i]} ${coords[i + 1]}`;
    }
    return d;
}

/**
 * Get the SVG element to clone from a shape object
 * @param {Object} shape - Shape object with shapeGroup or primitiveShape
 * @returns {Object|null} The SVG.js element to clone
 */
export function getCloneableElement(shape) {
    if (!shape) return null;
    return shape.shapeGroup || shape.primitiveShape || null;
}
