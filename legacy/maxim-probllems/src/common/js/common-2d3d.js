// Common utilities for combined 2D+3D lessons (Solid of Revolution)
// Combines utilities from both 2D and 3D common modules

// Re-export 2D utilities
export {
    COLORS,
    createCoordinateSystem,
    enableKeyboardNavigation
} from './common.js';

// Re-export 3D utilities  
export {
    COLORS_3D,
    createVectorView,
    createPlaneView,
    init3DCoordinateSystem,
    clearInteractiveObjects
} from './common-3d.js';

// Re-export helper functions
export {
    formatVector,
    formatVectorLatex,
    formatAngle,
    formatAngleWithDescription,
    getVectorMagnitude,
    updateSteppers,
    isVectorNearZero
} from './helpers.js';

import * as THREE from 'three';

/**
 * Create a lathe geometry from a 2D curve for solid of revolution
 * @param {Array} points - Array of [x, y] points defining the curve
 * @param {Object} options - Lathe options
 * @returns {THREE.LatheGeometry} The lathe geometry
 */
export function createLatheFromCurve(points, options = {}) {
    // Convert 2D points to Three.js Vector2 format
    const shape = points.map(([x, y]) => new THREE.Vector2(Math.abs(x), y));
    
    const geometry = new THREE.LatheGeometry(
        shape,
        options.segments || 32,          // Number of segments around the axis
        options.phiStart || 0,           // Start angle
        options.phiLength || Math.PI * 2 // Sweep angle (2π for full revolution)
    );
    
    return geometry;
}

/**
 * Create a solid of revolution mesh from a 2D function
 * @param {Function} func - Function f(x) that defines the curve
 * @param {number} xMin - Start x value
 * @param {number} xMax - End x value
 * @param {Object} options - Creation options
 * @returns {THREE.Mesh} The solid of revolution mesh
 */
export function createSolidOfRevolution(func, xMin, xMax, options = {}) {
    const steps = options.steps || 50;
    const segments = options.segments || 32;
    
    // Generate points along the curve
    const points = [];
    for (let i = 0; i <= steps; i++) {
        const x = xMin + (xMax - xMin) * (i / steps);
        const y = func(x);
        
        // Skip invalid points
        if (isFinite(y) && y >= 0) {
            points.push([x, y]);
        }
    }
    
    if (points.length < 2) {
        console.warn('Not enough valid points to create solid of revolution');
        return null;
    }
    
    // Create lathe geometry
    const geometry = createLatheFromCurve(points, { segments });
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
        color: options.color || 0x4dabf7,
        shininess: options.shininess || 100,
        transparent: options.transparent || false,
        opacity: options.opacity || 1.0,
        side: options.doubleSided ? THREE.DoubleSide : THREE.FrontSide
    });
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    
    // Apply transformations
    if (options.rotateX) mesh.rotation.x = options.rotateX;
    if (options.rotateY) mesh.rotation.y = options.rotateY;
    if (options.rotateZ) mesh.rotation.z = options.rotateZ;
    
    if (options.position) {
        mesh.position.set(options.position.x || 0, options.position.y || 0, options.position.z || 0);
    }
    
    return mesh;
}

/**
 * Create wireframe representation of a solid of revolution
 * @param {Function} func - Function f(x) that defines the curve
 * @param {number} xMin - Start x value  
 * @param {number} xMax - End x value
 * @param {Object} options - Creation options
 * @returns {THREE.LineSegments} Wireframe mesh
 */
export function createSolidWireframe(func, xMin, xMax, options = {}) {
    const mesh = createSolidOfRevolution(func, xMin, xMax, {
        ...options,
        transparent: true,
        opacity: 0
    });
    
    if (!mesh) return null;
    
    const wireframe = new THREE.WireframeGeometry(mesh.geometry);
    const material = new THREE.LineBasicMaterial({
        color: options.wireframeColor || 0x666666,
        linewidth: options.linewidth || 1
    });
    
    return new THREE.LineSegments(wireframe, material);
}

/**
 * Animate the creation of a solid of revolution
 * @param {THREE.Scene} scene - Three.js scene
 * @param {Function} func - Function f(x) that defines the curve
 * @param {number} xMin - Start x value
 * @param {number} xMax - End x value
 * @param {Object} options - Animation options
 * @returns {Object} Animation control object
 */
export function animateSolidOfRevolution(scene, func, xMin, xMax, options = {}) {
    const duration = options.duration || 3000; // 3 seconds
    const segments = options.segments || 32;
    
    let currentMesh = null;
    let animationId = null;
    let startTime = null;
    
    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Remove previous mesh
        if (currentMesh) {
            scene.remove(currentMesh);
            currentMesh.geometry.dispose();
            currentMesh.material.dispose();
        }
        
        // Create partial solid based on progress
        const currentSegments = Math.floor(segments * progress);
        if (currentSegments > 0) {
            const phiLength = (Math.PI * 2) * progress;
            
            currentMesh = createSolidOfRevolution(func, xMin, xMax, {
                ...options,
                segments: currentSegments,
                phiLength
            });
            
            if (currentMesh) {
                scene.add(currentMesh);
            }
        }
        
        if (progress < 1) {
            animationId = requestAnimationFrame(animate);
        } else {
            // Animation complete
            if (options.onComplete) {
                options.onComplete(currentMesh);
            }
        }
    }
    
    animationId = requestAnimationFrame(animate);
    
    return {
        stop: () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        },
        getCurrentMesh: () => currentMesh
    };
}

/**
 * Synchronize a 2D function curve with its 3D solid of revolution
 * @param {Object} board2D - JSXGraph board
 * @param {Object} scene3D - Three.js scene
 * @param {Function} func - The function f(x)
 * @param {Object} options - Synchronization options
 * @returns {Object} Sync control object
 */
export function sync2DWith3D(board2D, scene3D, func, options = {}) {
    let curve2D = null;
    let solid3D = null;
    
    const xMin = options.xMin || -5;
    const xMax = options.xMax || 5;
    
    function updateVisualization() {
        // Update 2D curve
        if (curve2D) {
            board2D.removeObject(curve2D);
        }
        
        curve2D = board2D.create('functiongraph', [func, xMin, xMax], {
            strokeColor: options.curveColor || '#ff6b6b',
            strokeWidth: options.curveWidth || 2,
            ...options.curve2DStyle
        });
        
        // Update 3D solid
        if (solid3D) {
            scene3D.remove(solid3D);
            solid3D.geometry.dispose();
            solid3D.material.dispose();
        }
        
        solid3D = createSolidOfRevolution(func, xMin, xMax, {
            color: options.solidColor || 0x4dabf7,
            segments: options.segments || 32,
            ...options.solid3DStyle
        });
        
        if (solid3D) {
            scene3D.add(solid3D);
        }
        
        board2D.update();
    }
    
    // Initial update
    updateVisualization();
    
    return {
        update: updateVisualization,
        getCurve2D: () => curve2D,
        getSolid3D: () => solid3D,
        remove: () => {
            if (curve2D) board2D.removeObject(curve2D);
            if (solid3D) {
                scene3D.remove(solid3D);
                solid3D.geometry.dispose();
                solid3D.material.dispose();
            }
        }
    };
}

/**
 * Create coordinate axes for both 2D and 3D views
 * @param {Object} board2D - JSXGraph board
 * @param {Object} scene3D - Three.js scene  
 * @param {Object} options - Axes options
 */
export function createDualAxes(board2D, scene3D, options = {}) {
    // 2D axes using existing utility
    createCoordinateSystem(board2D, {
        xLabel: options.xLabel || 'x',
        yLabel: options.yLabel || 'f(x)',
        xTickStep: options.xTickStep || 1,
        yTickStep: options.yTickStep || 1,
        ...options.axes2D
    });
    
    // 3D axes
    const axesHelper = new THREE.AxesHelper(options.axesSize || 5);
    scene3D.scene.add(axesHelper);
    
    // Add 3D axis labels
    if (options.show3DLabels !== false) {
        const loader = new THREE.FontLoader();
        // Note: In a real implementation, you'd load a font and create text geometry
        // For now, we'll just add the axes helper
    }
}

import { COLORS } from './colors.js';

/**
 * Common colors for 2D+3D lessons
 * IMPORTANT: When showing a 2D region and its 3D revolution,
 * use matching colors (e.g., blue for both) to help students
 * visually connect the 2D shape with its 3D solid
 */
export const COLORS_2D3D = COLORS;

// Helper function to convert hex color to Three.js numeric format
export function hexToThreeColor(hex) {
    return parseInt(hex.replace('#', '0x'), 16);
}