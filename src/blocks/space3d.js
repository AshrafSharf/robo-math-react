/**
 * Space3D - Pure Three.js 3D space container
 *
 * Features:
 *   - No coordinate transforms (direct Three.js Y-up system)
 *   - No grid, no axes helpers
 *   - Clean scene with just camera and lighting
 *   - Supports group nesting
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Space3DDiagram } from '../3d/space3d_diagram.js';
import { IdUtil } from '../utils/id-util.js';

export class Space3D {
    constructor(containerElement, options = {}) {
        this.containerElement = containerElement;
        this.options = options;

        // Three.js objects
        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.controls = null;

        // Diagram instance for creating shapes
        this.diagram = null;

        // Animation loop
        this.animationFrameId = null;
        this.isDestroyed = false;

        // Container DOM
        this.containerDOM = null;

        // Marker for type checking
        this._isSpace3D = true;

        // Initialize
        this.init();
    }

    init() {
        const id = IdUtil.getID();

        // Create container div
        this.containerDOM = document.createElement('div');
        this.containerDOM.id = `space3d-item_${id}`;
        this.containerDOM.className = 'space3d-item';
        this.containerDOM.style.width = `${this.options.width}px`;
        this.containerDOM.style.height = `${this.options.height}px`;
        this.containerDOM.style.position = 'relative';
        this.containerDOM.style.overflow = 'hidden';
        this.containerElement.appendChild(this.containerDOM);

        // Create Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0); // Light gray background

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.options.width, this.options.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.containerDOM.appendChild(this.renderer.domElement);

        // Setup camera (perspective)
        const aspect = this.options.width / this.options.height;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
        this.camera.position.set(15, 15, 15);
        this.camera.lookAt(0, 0, 0);

        // Setup orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;

        // Setup lighting
        this._setupLighting();

        // Create diagram for shape creation
        this.diagram = new Space3DDiagram(this.scene);

        // Start animation loop
        this.animate();
    }

    _setupLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light for shadows and depth
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);

        // Second directional light from opposite direction
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-10, 10, -10);
        this.scene.add(directionalLight2);
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

    /**
     * Get the Three.js scene
     */
    getScene() {
        return this.scene;
    }

    /**
     * Get the diagram for shape creation
     */
    getDiagram() {
        return this.diagram;
    }

    /**
     * Get the camera
     */
    getCamera() {
        return this.camera;
    }

    /**
     * Get the renderer
     */
    getRenderer() {
        return this.renderer;
    }

    /**
     * Check if this is a Space3D instance
     */
    static isSpace3D(obj) {
        return obj && obj._isSpace3D === true;
    }

    /**
     * Clear all shapes from the space
     */
    clear() {
        if (this.diagram) {
            this.diagram.clearAll();
        }
    }

    /**
     * Destroy the space and clean up resources
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
        if (this.diagram) {
            this.diagram.clearAll();
            this.diagram = null;
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
