/**
 * FocusIndicator3D - Three.js marker indicator for 3D shapes
 *
 * Creates a ring/circle marker mesh positioned at the shape's 3D center.
 * Only dependency: Three.js
 */
import * as THREE from 'three';

export class FocusIndicator3D {
  constructor() {
    this.marker = null;
    this.scene = null;

    // Marker styling
    this.color = 0x0066cc;
    this.innerRadius = 0.3;
    this.outerRadius = 0.4;
    this.opacity = 0.8;
  }

  /**
   * Create marker mesh and add to scene
   * @param {THREE.Scene} scene - The Three.js scene
   */
  create(scene) {
    if (!scene) return;

    this.scene = scene;

    // Create ring geometry for the marker
    const geometry = new THREE.RingGeometry(this.innerRadius, this.outerRadius, 32);

    // Create material with transparency
    const material = new THREE.MeshBasicMaterial({
      color: this.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: this.opacity,
      depthTest: false  // Always render on top
    });

    this.marker = new THREE.Mesh(geometry, material);
    this.marker.name = 'focus-indicator-3d';

    // Add to scene but hide initially
    this.marker.visible = false;
    scene.add(this.marker);
  }

  /**
   * Update marker position
   * @param {Object} position - Target position {x, y, z}
   */
  update(position) {
    if (!this.marker) return;

    this.marker.position.set(position.x, position.y, position.z);
    this.marker.visible = true;

    // Make marker face the camera if available
    if (this.scene && this.scene.userData.camera) {
      this.marker.lookAt(this.scene.userData.camera.position);
    }
  }

  /**
   * Set marker styling
   * @param {Object} style - Style options
   * @param {number} [style.color] - Hex color (e.g., 0x0066cc)
   * @param {number} [style.innerRadius] - Inner radius of ring
   * @param {number} [style.outerRadius] - Outer radius of ring
   * @param {number} [style.opacity] - Opacity (0-1)
   */
  setStyle({ color, innerRadius, outerRadius, opacity }) {
    if (color !== undefined) {
      this.color = color;
      if (this.marker) {
        this.marker.material.color.setHex(color);
      }
    }
    if (opacity !== undefined) {
      this.opacity = opacity;
      if (this.marker) {
        this.marker.material.opacity = opacity;
      }
    }
    // Inner/outer radius changes require recreating geometry
    if (innerRadius !== undefined || outerRadius !== undefined) {
      this.innerRadius = innerRadius ?? this.innerRadius;
      this.outerRadius = outerRadius ?? this.outerRadius;
      if (this.marker) {
        this.marker.geometry.dispose();
        this.marker.geometry = new THREE.RingGeometry(
          this.innerRadius,
          this.outerRadius,
          32
        );
      }
    }
  }

  /**
   * Show the marker
   */
  show() {
    if (this.marker) {
      this.marker.visible = true;
    }
  }

  /**
   * Hide the marker
   */
  hide() {
    if (this.marker) {
      this.marker.visible = false;
    }
  }

  /**
   * Remove marker from scene and dispose resources
   */
  remove() {
    if (this.marker) {
      if (this.scene) {
        this.scene.remove(this.marker);
      }

      // Dispose geometry and material
      if (this.marker.geometry) {
        this.marker.geometry.dispose();
      }
      if (this.marker.material) {
        this.marker.material.dispose();
      }

      this.marker = null;
    }
    this.scene = null;
  }

  /**
   * Check if marker is attached to scene
   * @returns {boolean}
   */
  isAttached() {
    return this.marker !== null && this.scene !== null;
  }
}
