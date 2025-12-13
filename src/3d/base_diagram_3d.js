/**
 * BaseDiagram3D - Abstract base class for 3D diagram implementations
 * Defines the unified API that both LHS3DDiagram and RHSDiagram3D implement
 * All methods must be implemented by subclasses
 */

export class BaseDiagram3D {
    /**
     * Create a new 3D diagram
     * @param {THREE.Scene} scene - The Three.js scene to render into
     * @param {Object} effectsManager - Optional effects manager for animations
     */
    constructor(scene, effectsManager = null) {
        if (new.target === BaseDiagram3D) {
            throw new Error('BaseDiagram3D is abstract and cannot be instantiated directly');
        }

        this.scene = scene;
        this.objects = [];
        this.effectsManager = effectsManager;
    }

    /**
     * Create a 3D point
     * @param {Object} position - Position {x, y, z}
     * @param {string} label - Optional label for the point
     * @param {number|string} color - Color (hex or string)
     * @param {Object} options - Additional options
     * @returns {Object} Point mesh with label property
     */
    point3d(position, label = '', color = 0xff0000, options = {}) {
        throw new Error('point3d() must be implemented by subclass');
    }

    /**
     * Create a segment between two points
     * @param {Object} start - Start point {x, y, z}
     * @param {Object} end - End point {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Segment group with label property
     */
    segment3dByTwoPoints(start, end, label = '', color = 0x00ff00, options = {}) {
        throw new Error('segment3dByTwoPoints() must be implemented by subclass');
    }

    /**
     * Create a vector (arrow) between two points
     * @param {Object} start - Start point {x, y, z}
     * @param {Object} end - End point {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Vector group with label property
     */
    vector(start, end, label = '', color = 0xff0000, options = {}) {
        throw new Error('vector() must be implemented by subclass');
    }

    /**
     * Create a dashed vector (useful for unit vectors)
     * @param {Object} start - Start position {x, y, z}
     * @param {Object} end - End position {x, y, z}
     * @param {string} label - Optional label for the vector
     * @param {number|string} color - Color (hex or string)
     * @param {Object} options - Additional options
     * @returns {Object} Vector group
     */
    dashedVector(start, end, label = '', color = 0x00ff00, options = {}) {
        throw new Error('dashedVector() must be implemented by subclass');
    }

    /**
     * Create a dashed line between two points
     * @param {Object} start - Start point {x, y, z}
     * @param {Object} end - End point {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Dashed line group with label property
     */
    dashedLine3d(start, end, label = '', color = 0xff1493, options = {}) {
        throw new Error('dashedLine3d() must be implemented by subclass');
    }

    /**
     * Create an infinite line through two points
     * @param {Object} point1 - First point {x, y, z}
     * @param {Object} point2 - Second point {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Line group with label property
     */
    lineByTwoPoints(point1, point2, label = '', color = 0x0000ff, options = {}) {
        throw new Error('lineByTwoPoints() must be implemented by subclass');
    }

    /**
     * Create a reversed vector (pointing in opposite direction)
     * @param {Object} vector - The vector object to reverse (must have start and end properties)
     * @param {Object} options - Additional options for the reversed vector
     * @returns {Object} Reversed vector group with label property
     */
    reverseVector(vector, options = {}) {
        throw new Error('reverseVector() must be implemented by subclass');
    }

    /**
     * Move a vector to a new position
     * @param {Object} vector - Object with {start: {x,y,z}, end: {x,y,z}}
     * @param {Object} newStart - New starting position {x, y, z}
     * @param {Object} options - Additional options for the vector
     * @returns {Object} The vector at the new position
     */
    moveVector(vector, newStart, options = {}) {
        throw new Error('moveVector() must be implemented by subclass');
    }

    /**
     * Move a vector forward along its direction
     * @param {Object} vectorObj - The vector object to move forward
     * @param {number} scalar - The scalar amount to move forward (default 1 = one vector length)
     * @param {Object} options - Additional options for the animation
     * @returns {Object} The vector object
     */
    forwardVector(vectorObj, scalar = 1, options = {}) {
        throw new Error('forwardVector() must be implemented by subclass');
    }

    /**
     * Move a vector backward along its direction
     * @param {Object} vectorObj - The vector object to move backward
     * @param {number} scalar - The scalar amount to move backward (default 1 = one vector length)
     * @param {Object} options - Additional options for the animation
     * @returns {Object} The vector object
     */
    backwardVector(vectorObj, scalar = 1, options = {}) {
        throw new Error('backwardVector() must be implemented by subclass');
    }

    /**
     * Create a parallel vector indicator showing two vectors are parallel
     * @param {Object} from - Start point of the vector {x, y, z}
     * @param {Object} to - End point of the vector {x, y, z}
     * @param {Object} offset - Offset vector to position the indicator {x, y, z}
     * @param {string} label - Optional label for the indicator
     * @param {number|string} color - Color of the indicator
     * @param {Object} options - Additional options
     * @returns {Object} Parallel indicator group with label property
     */
    parallelVectorIndicator(from, to, offset, label = '', color = 0x808080, options = {}) {
        throw new Error('parallelVectorIndicator() must be implemented by subclass');
    }

    /**
     * Create a plane from a point and normal vector
     * @param {Object} point - Point on plane {x, y, z}
     * @param {Object} normal - Normal vector {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Plane mesh with label property
     */
    planeByPointAndNormal(point, normal, label = '', color = 0x00ffff, options = {}) {
        throw new Error('planeByPointAndNormal() must be implemented by subclass');
    }

    /**
     * Create a plane from three points
     * @param {Object} p1 - First point {x, y, z}
     * @param {Object} p2 - Second point {x, y, z}
     * @param {Object} p3 - Third point {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Plane mesh with label property
     */
    planeByThreePoints(p1, p2, p3, label = '', color = 0x00ffff, options = {}) {
        throw new Error('planeByThreePoints() must be implemented by subclass');
    }

    /**
     * Create a polygon from vertices
     * @param {Array<Object>} vertices - Array of vertices {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Polygon group with label property
     */
    polygon(vertices, label = '', color = 0x4444ff, options = {}) {
        throw new Error('polygon() must be implemented by subclass');
    }

    /**
     * Create a parallelogram from two coterminal vectors
     * @param {Object} origin - Common starting point {x, y, z}
     * @param {Object} vector1End - End point of first vector {x, y, z}
     * @param {Object} vector2End - End point of second vector {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Parallelogram mesh with label property
     */
    parallelogram(origin, vector1End, vector2End, label = '', color = 0x4444ff, options = {}) {
        throw new Error('parallelogram() must be implemented by subclass');
    }

    /**
     * Create a box product (scalar triple product) volume visualization
     * @param {Object} vectorA - First vector {x, y, z}
     * @param {Object} vectorB - Second vector {x, y, z}
     * @param {Object} vectorC - Third vector {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Volume group with label property
     */
    boxProduct(vectorA, vectorB, vectorC, label = '', color = 0x4444ff, options = {}) {
        throw new Error('boxProduct() must be implemented by subclass');
    }

    /**
     * Create a cuboid (box) from two corner points
     * @param {Object} corner1 - First corner {x, y, z}
     * @param {Object} corner2 - Opposite corner {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Cuboid group with label property
     */
    cuboid(corner1, corner2, label = '', color = 0x4488ff, options = {}) {
        throw new Error('cuboid() must be implemented by subclass');
    }

    /**
     * Create a parametric curve
     * @param {Function} curveFunction - Function that takes t and returns {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options including tMin, tMax, segments
     * @returns {Object} Curve mesh with label property
     */
    curve(curveFunction, label = '', color = 0x0000ff, options = {}) {
        throw new Error('curve() must be implemented by subclass');
    }

    /**
     * Create an angle arc between two vectors
     * @param {Object} startVector - Start vector {x, y, z}
     * @param {Object} endVector - End vector {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options including radius
     * @returns {Object} Angle arc mesh with label property
     */
    angleArc(startVector, endVector, label = '', color = 0x00ff00, options = {}) {
        throw new Error('angleArc() must be implemented by subclass');
    }

    /**
     * Create an angle sector (filled) between two vectors
     * @param {Object} startVector - Start vector {x, y, z}
     * @param {Object} endVector - End vector {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options including radius
     * @returns {Object} Angle sector mesh with label property
     */
    angleSector(startVector, endVector, label = '', color = 0xffaa00, options = {}) {
        throw new Error('angleSector() must be implemented by subclass');
    }

    /**
     * Create an arc by three points (angle at the vertex/middle point)
     * @param {Object} point1 - First point {x, y, z}
     * @param {Object} vertex - Vertex where angle is formed {x, y, z}
     * @param {Object} point2 - Second point {x, y, z}
     * @param {string} label - Optional label for the angle
     * @param {number|string} color - Color of the arc
     * @param {Object} options - Additional options
     * @returns {Object} Arc group with label property
     */
    arcByThreePoints(point1, vertex, point2, label = '', color = 0x00ff00, options = {}) {
        throw new Error('arcByThreePoints() must be implemented by subclass');
    }

    /**
     * Create a right angle marker (square corner) between two perpendicular lines
     * @param {Object} point1 - First point {x, y, z}
     * @param {Object} vertex - Vertex where the right angle is located {x, y, z}
     * @param {Object} point2 - Second point {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color of the marker
     * @param {Object} options - Additional options
     * @returns {Object} Right angle marker group with label property
     */
    rightAngleMarker(point1, vertex, point2, label = '', color = 0xff6600, options = {}) {
        throw new Error('rightAngleMarker() must be implemented by subclass');
    }

    /**
     * Add a label at the center of an angle arc or sector
     * @param {Object} angleObj - The angle arc or sector object
     * @param {string} label - Label text
     * @param {number|string} color - Color of the label
     * @param {Object} options - Additional label options
     * @returns {Object} Label mesh or null
     */
    angleLabel(angleObj, label = '', color = 0x000000, options = {}) {
        throw new Error('angleLabel() must be implemented by subclass');
    }

    /**
     * Create a dot projection visualization
     * @param {Object} vector - The vector to project {start: {x,y,z}, end: {x,y,z}}
     * @param {Object} projectedOntoVector - The vector to project onto {start: {x,y,z}, end: {x,y,z}}
     * @param {string} label - Optional label for the projection distance
     * @param {number|string} color - Color for the projection indicator
     * @param {Object} options - Additional options
     * @returns {Object} Group containing the projection visualization
     */
    dotProjection(vector, projectedOntoVector, label = '', color = 0xff0000, options = {}) {
        throw new Error('dotProjection() must be implemented by subclass');
    }

    /**
     * Add a label to the scene
     * @param {Object} position - Position {x, y, z}
     * @param {string} text - Label text
     * @param {Object} options - Label options
     * @returns {Object} Label mesh
     */
    label(position, text, options = {}) {
        throw new Error('label() must be implemented by subclass');
    }

    /**
     * Clear all objects from the scene
     */
    clearAll() {
        throw new Error('clearAll() must be implemented by subclass');
    }

    /**
     * Alias for clearAll() for compatibility
     */
    clear() {
        this.clearAll();
    }

    /**
     * Hide all objects
     */
    hideAll() {
        throw new Error('hideAll() must be implemented by subclass');
    }

    /**
     * Show all objects
     */
    showAll() {
        throw new Error('showAll() must be implemented by subclass');
    }

    /**
     * Get all tracked objects
     * @returns {Array} Array of all objects
     */
    getObjects() {
        return this.objects;
    }

    /**
     * Focus on specific objects
     * @param {Array} objectsToFocus - Array of objects to focus on
     * @param {number} unfocusedOpacity - Opacity for unfocused objects
     * @param {number} duration - Animation duration
     */
    focus(objectsToFocus, unfocusedOpacity, duration) {
        throw new Error('focus() must be implemented by subclass');
    }

    /**
     * Restore all objects from any active effects
     */
    restore() {
        throw new Error('restore() must be implemented by subclass');
    }

    /**
     * Trace vector path - shows step-by-step vector addition
     * @param {Object} directPath - Direct path from start to end {start: {x,y,z}, end: {x,y,z}}
     * @param {Array} vectorPairs - Array of vector pairs [{start: {x,y,z}, end: {x,y,z}}, ...]
     * @param {Object} options - Animation options
     * @returns {Object|null} Animation object or null
     */
    traceVectorPath(directPath, vectorPairs, options = {}) {
        throw new Error('traceVectorPath() must be implemented by subclass');
    }

    // ============ SHARED UTILITY METHODS ============
    // These are concrete implementations shared across all subclasses

    /**
     * Parse color from various formats
     * @param {number|string} color - Color as hex number or string
     * @returns {number} Color as hex number
     */
    parseColor(color) {
        if (typeof color === 'number') return color;

        const colorMap = {
            'red': 0xff0000,
            'green': 0x00ff00,
            'blue': 0x0000ff,
            'yellow': 0xffff00,
            'cyan': 0x00ffff,
            'magenta': 0xff00ff,
            'white': 0xffffff,
            'black': 0x000000,
            'gray': 0x808080,
            'orange': 0xffa500,
            'purple': 0x800080,
            'pink': 0xffc0cb
        };

        if (typeof color === 'string') {
            if (color.startsWith('#')) {
                return parseInt(color.replace('#', ''), 16);
            }
            return colorMap[color.toLowerCase()] || 0x808080;
        }

        return 0x808080;
    }

    /**
     * Helper to calculate midpoint between two points
     * @protected
     * @param {Object} p1 - First point {x, y, z}
     * @param {Object} p2 - Second point {x, y, z}
     * @returns {Object} Midpoint {x, y, z}
     */
    _midpoint(p1, p2) {
        return {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2,
            z: (p1.z + p2.z) / 2
        };
    }

    /**
     * Helper method to add a label to an object
     * Must be implemented by subclass to handle label creation
     * @protected
     * @param {Object} object - The object to add label to
     * @param {Object} position - Label position {x, y, z}
     * @param {string} labelText - The label text
     * @param {Object} options - Additional options
     */
    _addLabel(object, position, labelText, options = {}) {
        throw new Error('_addLabel() must be implemented by subclass');
    }
}
