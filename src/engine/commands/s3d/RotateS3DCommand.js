/**
 * RotateS3DCommand - Pure Three.js rotation for s3d objects
 *
 * Directly mutates the Three.js object - no copies
 * Uses GSAP for animated rotation
 */
import * as THREE from 'three';
import { TweenMax, Power2 } from 'gsap';
import { BaseCommand } from '../BaseCommand.js';

export class RotateS3DCommand extends BaseCommand {
    constructor(targetExpression, angle, axis, options = {}) {
        super();
        this.targetExpression = targetExpression;
        this.angle = angle;
        this.axis = axis;
        this.options = options;
        this.target = null;
        // Store initial and end states for playSingle
        this.startQuat = null;
        this.endQuat = null;
    }

    /**
     * Get the Three.js object to rotate
     */
    _getTargetObject() {
        const expr = this.targetExpression;

        // Group
        if (expr.isS3DGroup && expr.isS3DGroup()) {
            return expr.getGroup();
        }
        // Face
        if (expr.isS3DFace && expr.isS3DFace()) {
            return expr.getMesh();
        }
        // Sphere
        if (expr.isS3DSphere && expr.isS3DSphere()) {
            return expr.getMesh();
        }
        // Cube
        if (expr.isS3DCube && expr.isS3DCube()) {
            return expr.getMesh();
        }
        // Cone
        if (expr.isS3DCone && expr.isS3DCone()) {
            return expr.getMesh();
        }
        // Cylinder
        if (expr.isS3DCylinder && expr.isS3DCylinder()) {
            return expr.getMesh();
        }

        return null;
    }

    /**
     * Prepare - get target and store initial/end states
     */
    async doInit() {
        this.target = this._getTargetObject();
        if (!this.target) {
            throw new Error('RotateS3DCommand: Could not find target Three.js object');
        }

        // Store initial quaternion
        this.startQuat = this.target.quaternion.clone();

        // Compute end quaternion
        const radians = THREE.MathUtils.degToRad(this.angle);
        const axisVec = new THREE.Vector3(this.axis.x, this.axis.y, this.axis.z).normalize();
        const deltaQuat = new THREE.Quaternion().setFromAxisAngle(axisVec, radians);
        this.endQuat = this.startQuat.clone().premultiply(deltaQuat);
    }

    /**
     * Animated rotation using GSAP
     */
    doPlay() {
        return new Promise((resolve) => {
            if (!this.target || !this.startQuat || !this.endQuat) {
                resolve();
                return;
            }

            const progress = { t: 0 };
            const duration = this.options.duration || 2;

            TweenMax.to(progress, duration, {
                t: 1,
                ease: Power2.easeInOut,
                onUpdate: () => {
                    this.target.quaternion.slerpQuaternions(this.startQuat, this.endQuat, progress.t);
                },
                onComplete: () => {
                    this.target.quaternion.copy(this.endQuat);
                    resolve();
                }
            });
        });
    }

    /**
     * playSingle - revert to start state, then animate
     */
    async playSingle() {
        if (!this.target || !this.startQuat) return;

        // Revert to initial state
        this.target.quaternion.copy(this.startQuat);

        // Play animation
        return this.doPlay();
    }

    /**
     * Instant rotation - no animation
     */
    doDirectPlay() {
        if (!this.target || !this.endQuat) return;

        this.target.quaternion.copy(this.endQuat);
    }

    clear() {
        // Rotation is a mutation - can't easily undo
        this.isInitialized = false;
    }
}
