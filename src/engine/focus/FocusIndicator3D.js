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
    this.headColor = 0xff6b6b;
    this.shaftColor = 0xcc3333;
    this.arrowHeadSize = 0.4;
    this.shaftLength = 0.25;
    this.shaftRadius = 0.06;
    this.offset = 0.8; // Distance above target
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
    const headMaterial = new THREE.MeshStandardMaterial({
      color: this.headColor,
      metalness: 0.3,
      roughness: 0.4,
      emissive: this.headColor,
      emissiveIntensity: 0.3,
      depthTest: false
    });

    const arrowHead = new THREE.Mesh(coneGeometry, headMaterial);
    arrowHead.rotation.x = Math.PI; // Point downward
    arrowHead.position.y = 0; // Tip at origin of group

    // Create shaft (cylinder)
    const shaftGeometry = new THREE.CylinderGeometry(this.shaftRadius, this.shaftRadius, this.shaftLength, 8);
    const shaftMaterial = new THREE.MeshStandardMaterial({
      color: this.shaftColor,
      metalness: 0.5,
      roughness: 0.3,
      emissive: this.shaftColor,
      emissiveIntensity: 0.2,
      depthTest: false
    });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
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
   * @param {number} [style.headColor] - Head hex color
   * @param {number} [style.shaftColor] - Shaft hex color
   * @param {number} [style.offset] - Distance above target
   */
  setStyle({ headColor, shaftColor, offset }) {
    if (headColor !== undefined) {
      this.headColor = headColor;
    }
    if (shaftColor !== undefined) {
      this.shaftColor = shaftColor;
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
