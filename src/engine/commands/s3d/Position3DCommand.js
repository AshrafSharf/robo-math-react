/**
 * Position3DCommand - Sets position of an s3d object
 *
 * Directly mutates the Three.js object's position.
 * Uses GSAP for animated position change.
 */
import { TweenMax, Power2 } from 'gsap';
import { BaseCommand } from '../BaseCommand.js';

export class Position3DCommand extends BaseCommand {
    constructor(targetExpression, position, options = {}) {
        super();
        this.targetExpression = targetExpression;
        this.position = position;
        this.options = options;
        this.target = null;
        // Store initial position for playSingle
        this.startPosition = null;
    }

    /**
     * Get the Three.js object to position
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

    async doInit() {
        this.target = this._getTargetObject();
        if (!this.target) {
            throw new Error('Position3DCommand: Could not find target Three.js object');
        }

        // Store initial position
        this.startPosition = {
            x: this.target.position.x,
            y: this.target.position.y,
            z: this.target.position.z
        };
    }

    /**
     * Animated position change using GSAP
     */
    doPlay() {
        return new Promise((resolve) => {
            if (!this.target || !this.startPosition) {
                resolve();
                return;
            }

            const duration = this.options.duration || 1;

            TweenMax.to(this.target.position, duration, {
                x: this.position.x,
                y: this.position.y,
                z: this.position.z,
                ease: Power2.easeInOut,
                onComplete: resolve
            });
        });
    }

    /**
     * playSingle - revert to start state, then animate
     */
    async playSingle() {
        if (!this.target || !this.startPosition) return;

        // Revert to initial position
        this.target.position.set(
            this.startPosition.x,
            this.startPosition.y,
            this.startPosition.z
        );

        // Play animation
        return this.doPlay();
    }

    /**
     * Instant position change - no animation
     */
    doDirectPlay() {
        if (!this.target) return;

        this.target.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );
    }

    clear() {
        this.isInitialized = false;
    }
}
