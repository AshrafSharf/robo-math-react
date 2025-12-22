/**
 * ShapeRepositionAdapter - Abstracts reposition operations for g2d, mathtext, and g3d containers
 *
 * Provides a unified interface for shift operations using GSAP animation.
 * All three component types have containerDOM, so a single adapter handles all.
 *
 * Tracks original position to support proper replay (playSingle starts from original).
 */
import { TweenMax } from 'gsap';

export class ShapeRepositionAdapter {
    /**
     * Detect shape type and return appropriate adapter
     * @param {Object} shape - The shape object (commandResult from registry)
     * @returns {BaseRepositionAdapter}
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
        console.warn('ShapeRepositionAdapter: Unknown shape type or missing containerDOM', shape);
        return new NullAdapter();
    }
}

/**
 * Base adapter interface
 */
class BaseRepositionAdapter {
    constructor(shape) {
        this.shape = shape;
        this.originalX = 0;
        this.originalY = 0;
    }

    /**
     * Capture original position (call once during init)
     */
    captureOriginal() {
        throw new Error('Not implemented');
    }

    /**
     * Reset to original position (for replay)
     */
    resetToOriginal() {
        throw new Error('Not implemented');
    }

    /**
     * Animate shift by delta
     */
    shift(dx, dy, duration, onComplete) {
        throw new Error('Not implemented');
    }

    /**
     * Instant shift by delta
     */
    shiftInstant(dx, dy) {
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
class ContainerAdapter extends BaseRepositionAdapter {
    /**
     * Capture current position as original (call once during init)
     */
    captureOriginal() {
        const container = this.shape.containerDOM;
        if (!container) return;

        // Get current GSAP transform values
        // GSAP stores these in _gsTransform (GSAP 2)
        const gsapTransform = container._gsTransform || {};
        this.originalX = gsapTransform.x || 0;
        this.originalY = gsapTransform.y || 0;
    }

    /**
     * Reset to original position instantly (for replay)
     */
    resetToOriginal() {
        const container = this.shape.containerDOM;
        if (!container) return;

        TweenMax.set(container, {
            x: this.originalX,
            y: this.originalY
        });
    }

    /**
     * Animate shift by delta using GSAP relative syntax
     * @param {number} dx - Pixel delta X
     * @param {number} dy - Pixel delta Y
     * @param {number} duration - Animation duration in seconds
     * @param {Function} onComplete - Callback when animation completes
     */
    shift(dx, dy, duration, onComplete) {
        const container = this.shape.containerDOM;
        if (!container) {
            if (onComplete) onComplete();
            return;
        }

        // Use relative syntax for animation
        TweenMax.to(container, duration, {
            x: `+=${dx}`,
            y: `+=${dy}`,
            ease: 'Power2.easeInOut',
            onComplete: () => {
                if (onComplete) onComplete();
            }
        });
    }

    /**
     * Instant shift to target position (original + delta)
     * @param {number} dx - Pixel delta X
     * @param {number} dy - Pixel delta Y
     */
    shiftInstant(dx, dy) {
        const container = this.shape.containerDOM;
        if (!container) return;

        // Set to absolute target (original + delta)
        TweenMax.set(container, {
            x: this.originalX + dx,
            y: this.originalY + dy
        });
    }

    getElement() {
        return this.shape.containerDOM;
    }
}

/**
 * Null adapter for unknown/missing shapes
 */
class NullAdapter extends BaseRepositionAdapter {
    constructor() {
        super(null);
    }

    captureOriginal() {
        // No-op
    }

    resetToOriginal() {
        // No-op
    }

    shift(dx, dy, duration, onComplete) {
        if (onComplete) onComplete();
    }

    shiftInstant(dx, dy) {
        // No-op
    }
}
