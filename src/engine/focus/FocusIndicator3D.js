/**
 * FocusIndicator3D - Three.js arrow indicator for 3D shapes
 *
 * Creates a small downward-pointing arrow above the shape's 3D position.
 * Only dependency: Three.js
 */
import * as THREE from 'three';

export class FocusIndicator3D {
  constructor() {
    this.group = null;
    this.scene = null;

    // Arrow styling
    this.color = 0xff6b6b;
    this.arrowHeadSize = 0.15;
    this.shaftLength = 0.08;
    this.shaftRadius = 0.02;
    this.offset = 0.3; // Distance above target
  }

  /**
   * Create arrow mesh and add to scene
   * @param {THREE.Scene} scene - The Three.js scene
   */
  create(scene) {
    if (!scene) return;

    this.scene = scene;

    // Create group to hold arrow parts
    this.group = new THREE.Group();
    this.group.name = 'focus-indicator-3d';

    // Create arrowhead (cone pointing down)
    const coneGeometry = new THREE.ConeGeometry(this.arrowHeadSize, this.arrowHeadSize * 1.5, 16);
    const material = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.9,
      depthTest: false
    });

    const arrowHead = new THREE.Mesh(coneGeometry, material);
    arrowHead.rotation.x = Math.PI; // Point downward
    arrowHead.position.y = 0; // Tip at origin of group

    // Create shaft (cylinder)
    const shaftGeometry = new THREE.CylinderGeometry(this.shaftRadius, this.shaftRadius, this.shaftLength, 8);
    const shaft = new THREE.Mesh(shaftGeometry, material.clone());
    shaft.position.y = this.arrowHeadSize * 0.75 + this.shaftLength / 2; // Above arrowhead

    this.group.add(arrowHead);
    this.group.add(shaft);

    // Hide initially
    this.group.visible = false;
    scene.add(this.group);
  }

  /**
   * Update arrow position
   * @param {Object} position - Target position {x, y, z}
   */
  update(position) {
    if (!this.group) return;

    // Position arrow above the target
    this.group.position.set(
      position.x,
      position.y + this.offset,
      position.z
    );
    this.group.visible = true;
  }

  /**
   * Set arrow styling
   * @param {Object} style - Style options
   * @param {number} [style.color] - Hex color (e.g., 0xff6b6b)
   * @param {number} [style.offset] - Distance above target
   */
  setStyle({ color, offset }) {
    if (color !== undefined) {
      this.color = color;
      if (this.group) {
        this.group.children.forEach(child => {
          if (child.material) {
            child.material.color.setHex(color);
          }
        });
      }
    }
    if (offset !== undefined) {
      this.offset = offset;
    }
  }

  /**
   * Show the arrow
   */
  show() {
    if (this.group) {
      this.group.visible = true;
    }
  }

  /**
   * Hide the arrow
   */
  hide() {
    if (this.group) {
      this.group.visible = false;
    }
  }

  /**
   * Remove arrow from scene and dispose resources
   */
  remove() {
    if (this.group) {
      if (this.scene) {
        this.scene.remove(this.group);
      }

      // Dispose geometry and material for all children
      this.group.children.forEach(child => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          child.material.dispose();
        }
      });

      this.group = null;
    }
    this.scene = null;
  }

  /**
   * Check if arrow is attached to scene
   * @returns {boolean}
   */
  isAttached() {
    return this.group !== null && this.scene !== null;
  }
}
