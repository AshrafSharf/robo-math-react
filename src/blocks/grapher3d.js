/**
 * Grapher3D - Three.js based 3D graph container
 * Similar to Grapher for 2D, provides a clean API for creating and managing 3D graphs
 *
 * Supports both LHS (left-hand) and RHS (right-hand/native Three.js) coordinate systems
 */

import * as THREE from 'three';
import { setupCoordinateSystem as setupLHSCoordinateSystem } from '../3d/lhs/lhs_coordinate_system.js';
import { setupCoordinateSystem as setupRHSCoordinateSystem } from '../3d/native/coordinate_system.js';
import { Diagram3DFactory } from '../3d/diagram_3d_factory.js';
import { IdUtil } from '../shared/utils/id-util.js';
import { Pen3DTracker } from '../events/pen-3d-tracker.js';

export class Grapher3D {
    constructor(containerElement, options = {}) {
        this.containerElement = containerElement;
        this.options = options;
        this.coordinateSystem = options.coordinateSystem || 'lhs';

        // Three.js objects
        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.controls = null;

        // Diagram instance for creating shapes
        this.diagram3d = null;

        // Animation loop
        this.animationFrameId = null;
        this.isDestroyed = false;

        // Container DOM
        this.containerDOM = null;

        // Pen tracker (lazy initialized)
        this._penTracker = null;

        // Initialize
        this.init();
    }

    init() {
        const id = IdUtil.getID();

        // Create container div
        this.containerDOM = document.createElement('div');
        this.containerDOM.id = `graph3d-item_${id}`;
        this.containerDOM.className = 'graph3d-item';
        this.containerDOM.style.width = `${this.options.width}px`;
        this.containerDOM.style.height = `${this.options.height}px`;
        this.containerDOM.style.position = 'relative';
        this.containerDOM.style.overflow = 'hidden';
        this.containerElement.appendChild(this.containerDOM);

        // Create Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = null; // Transparent background

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.options.width, this.options.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.containerDOM.appendChild(this.renderer.domElement);

        // Store renderer in scene.userData for setupCoordinateSystem
        this.scene.userData.renderer = this.renderer;

        // Set up coordinate system with axes, grid, camera, and lighting
        const axesRange = Math.max(
            Math.abs(this.options.xRange?.[0] || 10),
            Math.abs(this.options.xRange?.[1] || 10),
            Math.abs(this.options.yRange?.[0] || 10),
            Math.abs(this.options.yRange?.[1] || 10),
            Math.abs(this.options.zRange?.[0] || 10),
            Math.abs(this.options.zRange?.[1] || 10)
        );

        // Use appropriate coordinate system setup based on option
        const setupCoordinateSystem = this.coordinateSystem === 'rhs'
            ? setupRHSCoordinateSystem
            : setupLHSCoordinateSystem;

        setupCoordinateSystem(this.scene, {
            axesRange: axesRange,
            showGrid: this.options.showGrid !== false,
            showAxes: true,
            enableInteraction: true,
            viewSize: axesRange * 2,
            cameraPosition: { x: -axesRange * 1.5, y: axesRange * 1.2, z: -axesRange * 1.5 }
        });

        // Store camera and controls references
        this.camera = this.scene.userData.camera;
        this.controls = this.scene.userData.controls;

        // Create Diagram3D for shape creation using the appropriate coordinate system
        this.diagram3d = Diagram3DFactory.createDiagram(this.scene, this.coordinateSystem);

        // Start animation loop
        this.animate();
    }

    animate() {
        if (this.isDestroyed) return;

        this.animationFrameId = requestAnimationFrame(() => this.animate());

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        // Render
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    // Shape creation methods - delegate to Diagram3D

    /**
     * Create a 3D point
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} z - Z coordinate
     * @param {Object} options - Options (label, color, radius)
     */
    point3d(x, y, z, options = {}) {
        return this.diagram3d.point3d(
            { x, y, z },
            options.label || '',
            options.color || 0xff0000,
            options
        );
    }

    /**
     * Create a 3D vector
     * @param {Object} start - Start point {x, y, z}
     * @param {Object} end - End point {x, y, z}
     * @param {Object} options - Options (label, color)
     */
    vector(start, end, options = {}) {
        return this.diagram3d.vector(
            start,
            end,
            options.label || '',
            options.color || 0xff0000,
            options
        );
    }

    /**
     * Create a 3D line segment
     * @param {Object} start - Start point {x, y, z}
     * @param {Object} end - End point {x, y, z}
     * @param {Object} options - Options (label, color)
     */
    line(start, end, options = {}) {
        return this.diagram3d.segment3dByTwoPoints(
            start,
            end,
            options.label || '',
            options.color || 0x0000ff,
            options
        );
    }

    /**
     * Create a 3D plane
     * @param {Object} point - Point on plane {x, y, z}
     * @param {Object} normal - Normal vector {x, y, z}
     * @param {Object} options - Options (label, color, opacity)
     */
    plane(point, normal, options = {}) {
        return this.diagram3d.planeByPointAndNormal(
            point,
            normal,
            options.label || '',
            options.color || 0x00ffff,
            options
        );
    }

    /**
     * Create a 3D polygon
     * @param {Array} vertices - Array of vertices [{x, y, z}, ...]
     * @param {Object} options - Options (label, color, opacity)
     */
    polygon(vertices, options = {}) {
        return this.diagram3d.polygon(
            vertices,
            options.label || '',
            options.color || 0x4444ff,
            options
        );
    }

    /**
     * Create a label
     * @param {Object} position - Position {x, y, z}
     * @param {string} text - Label text
     * @param {Object} options - Options (color, fontSize)
     */
    label(position, text, options = {}) {
        return this.diagram3d.label(position, text, options);
    }

    /**
     * Clear all shapes from the graph
     */
    clearDiagram() {
        if (this.diagram3d) {
            this.diagram3d.clearAll();
        }
    }

    /**
     * Get all objects in the diagram
     */
    getObjects() {
        return this.diagram3d ? this.diagram3d.getObjects() : [];
    }

    /**
     * Get pen tracker for this 3D graph
     * Used by animators to emit pen position events
     * @returns {Pen3DTracker} Pen tracker instance
     */
    getPenTracker() {
        if (!this._penTracker) {
            this._penTracker = new Pen3DTracker(this.camera, this.renderer.domElement);
        }
        return this._penTracker;
    }

    /**
     * Destroy the grapher and clean up resources
     */
    destroy() {
        this.isDestroyed = true;

        // Cancel animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Dispose controls
        if (this.controls) {
            this.controls.dispose();
            this.controls = null;
        }

        // Clear diagram
        if (this.diagram3d) {
            this.diagram3d.clearAll();
            this.diagram3d = null;
        }

        // Dispose renderer
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }

        // Clear scene
        if (this.scene) {
            this.scene.clear();
            this.scene = null;
        }

        // Remove container
        if (this.containerDOM && this.containerDOM.parentNode) {
            this.containerDOM.parentNode.removeChild(this.containerDOM);
        }
        this.containerDOM = null;

        this.camera = null;
    }
}
