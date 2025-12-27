/**
 * Face3D - A face of a foldable shape with pivot/hinge support
 *
 * Each face knows its pivot line (hinge) for rotation.
 * Works with rotate3d() for folding animations.
 */
import * as THREE from 'three';

export class Face3D {
    /**
     * @param {THREE.Group|THREE.Mesh} mesh - The Three.js mesh for this face
     * @param {Object} pivot - The pivot/hinge line { start: {x,y,z}, end: {x,y,z} }
     * @param {string|number} name - Face identifier ("top", "bottom", etc. or index)
     * @param {Object} parent - Reference to parent foldable object
     */
    constructor(mesh, pivot, name, parent = null) {
        this.mesh = mesh;
        this.pivot = pivot;  // { start: {x,y,z}, end: {x,y,z} }
        this.name = name;
        this.parent = parent;
        this.foldAngle = 0;  // Current rotation angle in degrees (0 = flat)
        this.maxAngle = 90;  // Maximum fold angle

        // Calculate pivot axis (unit vector along hinge)
        this.pivotAxis = this._calculatePivotAxis();

        // Store pivot point for rotation origin
        this.pivotPoint = pivot.start;

        // Marker for type checking
        this._isFace3D = true;
    }

    /**
     * Calculate unit vector along pivot axis
     */
    _calculatePivotAxis() {
        const dx = this.pivot.end.x - this.pivot.start.x;
        const dy = this.pivot.end.y - this.pivot.start.y;
        const dz = this.pivot.end.z - this.pivot.start.z;
        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (length === 0) {
            return { x: 1, y: 0, z: 0 };  // Default axis
        }

        return {
            x: dx / length,
            y: dy / length,
            z: dz / length
        };
    }

    /**
     * Get the pivot as a Line3D-compatible object
     */
    getPivot() {
        return this.pivot;
    }

    /**
     * Get pivot axis as vector
     */
    getPivotAxis() {
        return this.pivotAxis;
    }

    /**
     * Get current fold angle
     */
    getFoldAngle() {
        return this.foldAngle;
    }

    /**
     * Set fold angle (called after rotation)
     */
    setFoldAngle(angle) {
        this.foldAngle = angle;
    }

    /**
     * Check if face is fully folded (at 90 degrees)
     */
    isFolded() {
        return Math.abs(this.foldAngle - this.maxAngle) < 0.1;
    }

    /**
     * Check if face is flat (at 0 degrees)
     */
    isFlat() {
        return Math.abs(this.foldAngle) < 0.1;
    }

    /**
     * Get the Three.js mesh
     */
    getMesh() {
        return this.mesh;
    }

    /**
     * Get vertices of the face polygon (in math coordinates)
     * @returns {Array<{x,y,z}>}
     */
    getVertices() {
        return this.vertices || [];
    }

    /**
     * Set vertices (used by type handlers)
     */
    setVertices(vertices) {
        this.vertices = vertices;
    }

    /**
     * Static check for Face3D type
     */
    static isFace3D(obj) {
        return obj && obj._isFace3D === true;
    }
}
