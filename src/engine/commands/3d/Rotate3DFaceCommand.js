/**
 * Rotate3DFaceCommand - Command for rotating a Face3D around its pivot
 *
 * Handles the rotation of foldable faces using GSAP animation.
 * The face rotates around its pivot/hinge line.
 */
import { Base3DCommand } from './Base3DCommand.js';
import * as THREE from 'three';
import gsap from 'gsap';

export class Rotate3DFaceCommand extends Base3DCommand {
    /**
     * Create a Face3D rotation command
     * @param {Object} faceExpression - The face expression (from face())
     * @param {number} angle - Rotation angle in degrees
     * @param {Object} axis - Rotation axis {x, y, z}
     * @param {Object} options - Animation options
     */
    constructor(faceExpression, angle, axis, options = {}) {
        super();
        this.faceExpression = faceExpression;
        this.angle = angle;
        this.axis = axis;
        this.options = options;
        this.face = null;
        this.mesh = null;
    }

    async doInit() {
        // Get the Face3D object
        this.face = this.faceExpression.getFace();

        if (!this.face) {
            console.warn('Rotate3DFaceCommand: Face not available yet');
            return;
        }

        this.mesh = this.face.getMesh();
    }

    /**
     * Animate the face rotation using GSAP
     */
    async playSingle() {
        if (!this.face || !this.mesh) {
            return;
        }

        const duration = this.options.duration || 1;
        const currentAngle = this.face.getFoldAngle();
        const targetAngle = this.angle;
        const deltaAngle = targetAngle - currentAngle;

        // Convert to radians
        const deltaRadians = (deltaAngle * Math.PI) / 180;

        // Determine rotation axis based on face name
        // The axis depends on the pivot orientation
        const faceName = this.face.name;
        let rotationAxis;

        if (faceName === 'top' || faceName === 'bottom') {
            // Horizontal pivot - rotate around X axis
            rotationAxis = 'x';
        } else if (faceName === 'left' || faceName === 'right') {
            // Vertical pivot - rotate around Y axis
            rotationAxis = 'y';
        } else {
            // Use provided axis (fallback)
            rotationAxis = 'x';
        }

        // Determine rotation direction based on face
        let direction = 1;
        if (faceName === 'bottom') direction = -1;
        if (faceName === 'left') direction = -1;

        return new Promise((resolve) => {
            gsap.to(this.mesh.rotation, {
                [rotationAxis]: this.mesh.rotation[rotationAxis] + deltaRadians * direction,
                duration,
                ease: 'power2.inOut',
                onUpdate: () => {
                    // Update fold angle on face
                    const currentRot = Math.abs(this.mesh.rotation[rotationAxis]) * (180 / Math.PI);
                    this.face.setFoldAngle(currentRot);
                },
                onComplete: () => {
                    this.face.setFoldAngle(targetAngle);
                    resolve();
                }
            });
        });
    }

    /**
     * Direct play without animation
     */
    doDirectPlay() {
        if (!this.face || !this.mesh) {
            return;
        }

        const targetAngle = this.angle;
        const radians = (targetAngle * Math.PI) / 180;

        const faceName = this.face.name;
        let rotationAxis = 'x';
        let direction = 1;

        if (faceName === 'top' || faceName === 'bottom') {
            rotationAxis = 'x';
        } else if (faceName === 'left' || faceName === 'right') {
            rotationAxis = 'y';
        }

        if (faceName === 'bottom') direction = -1;
        if (faceName === 'left') direction = -1;

        this.mesh.rotation[rotationAxis] = radians * direction;
        this.face.setFoldAngle(targetAngle);
    }
}
