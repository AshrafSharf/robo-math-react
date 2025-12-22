/**
 * ShapeSizeAdapter - Abstracts size/scale operations for g2d, mathtext, and g3d containers
 *
 * Provides a unified interface for scale operations using GSAP animation.
 * All three component types have containerDOM, so a single adapter handles all.
 *
 * Tracks original scale to support proper replay (playSingle starts from original).
 */
import { TweenMax } from 'gsap';

export class ShapeSizeAdapter {
    /**
     * Detect shape type and return appropriate adapter
     * @param {Object} shape - The shape object (commandResult from registry)
     * @returns {BaseSizeAdapter}
     */
    static for(shape) {
        if (!shape) {
            return new NullAdapter();
        }

        // All three types (g2d/Grapher, g3d/Grapher3D, mathtext/MathTextComponent)
        // have containerDOM property
        if (shape.containerDOM) {
            return new ContainerAdapter(shape);
        }

        // Unknown type - return null adapter
        console.warn('ShapeSizeAdapter: Unknown shape type or missing containerDOM', shape);
        return new NullAdapter();
    }
}

/**
 * Base adapter interface
 */
class BaseSizeAdapter {
    constructor(shape) {
        this.shape = shape;
        this.originalScaleX = 1;
        this.originalScaleY = 1;
        this.targetScaleX = 1;
        this.targetScaleY = 1;
    }

    /**
     * Capture original scale and set target (call once during init)
     */
    captureOriginalAndSetTarget(widthRatio, heightRatio) {
        throw new Error('Not implemented');
    }

    /**
     * Reset to original scale (for replay)
     */
    resetToOriginal() {
        throw new Error('Not implemented');
    }

    /**
     * Animate to target scale
     */
    scale(duration, onComplete) {
        throw new Error('Not implemented');
    }

    /**
     * Instant set to target scale
     */
    scaleInstant() {
        throw new Error('Not implemented');
    }

    getElement() {
        return null;
    }
}

/**
 * Adapter for container-based shapes (g2d, mathtext, g3d)
 * All have containerDOM property that can be animated with CSS transforms
 */
class ContainerAdapter extends BaseSizeAdapter {
    /**
     * Capture current scale as original and calculate target scale
     * @param {number} widthRatio - Width scale ratio (0.5 = half, 2 = double)
     * @param {number} heightRatio - Height scale ratio (0.5 = half, 2 = double)
     */
    captureOriginalAndSetTarget(widthRatio, heightRatio) {
        const container = this.shape.containerDOM;
        if (!container) return;

        // Get current GSAP transform values
        // GSAP stores these in _gsTransform (GSAP 2)
        const gsapTransform = container._gsTransform || {};
        this.originalScaleX = gsapTransform.scaleX !== undefined ? gsapTransform.scaleX : 1;
        this.originalScaleY = gsapTransform.scaleY !== undefined ? gsapTransform.scaleY : 1;

        // Calculate target scale (multiply original by ratio)
        this.targetScaleX = this.originalScaleX * widthRatio;
        this.targetScaleY = this.originalScaleY * heightRatio;
    }

    /**
     * Reset to original scale instantly (for replay)
     */
    resetToOriginal() {
        const container = this.shape.containerDOM;
        if (!container) return;

        TweenMax.set(container, {
            scaleX: this.originalScaleX,
            scaleY: this.originalScaleY
        });
    }

    /**
     * Animate to target scale using GSAP
     * @param {number} duration - Animation duration in seconds
     * @param {Function} onComplete - Callback when animation completes
     */
    scale(duration, onComplete) {
        const container = this.shape.containerDOM;
        if (!container) {
            if (onComplete) onComplete();
            return;
        }

        TweenMax.to(container, duration, {
            scaleX: this.targetScaleX,
            scaleY: this.targetScaleY,
            ease: 'Power2.easeInOut',
            onComplete: () => {
                if (onComplete) onComplete();
            }
        });
    }

    /**
     * Instant set to target scale (idempotent)
     */
    scaleInstant() {
        const container = this.shape.containerDOM;
        if (!container) return;

        TweenMax.set(container, {
            scaleX: this.targetScaleX,
            scaleY: this.targetScaleY
        });
    }

    getElement() {
        return this.shape.containerDOM;
    }
}

/**
 * Null adapter for unknown/missing shapes
 */
class NullAdapter extends BaseSizeAdapter {
    constructor() {
        super(null);
    }

    captureOriginalAndSetTarget(widthRatio, heightRatio) {
        // No-op
    }

    resetToOriginal() {
        // No-op
    }

    scale(duration, onComplete) {
        if (onComplete) onComplete();
    }

    scaleInstant() {
        // No-op
    }
}
