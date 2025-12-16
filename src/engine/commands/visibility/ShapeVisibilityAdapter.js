/**
 * ShapeVisibilityAdapter - Abstracts visibility operations for SVG and 3D shapes
 *
 * Provides a unified interface for show/hide/fadeIn/fadeOut operations
 * that works with both SVG (SVGScriptShape), MathTextComponent, and 3D (Three.js) objects.
 */
import { TweenMax } from 'gsap';
import $ from '../../../mathtext/utils/dom-query.js';

export class ShapeVisibilityAdapter {
    /**
     * Detect shape type and return appropriate adapter
     * @param {Object} shape - The shape object (commandResult from registry)
     * @returns {ShapeVisibilityAdapter}
     */
    static for(shape) {
        if (!shape) {
            return new NullAdapter();
        }

        // Check for MathTextComponent (has containerDOM)
        if (shape.containerDOM) {
            return new MathTextAdapter(shape);
        }

        // Check for SVG shape (has shapeGroup with SVG.js node)
        if (shape.shapeGroup && shape.shapeGroup.node) {
            return new SVGShapeAdapter(shape);
        }

        // Check for 3D shape (has Three.js mesh/object3D)
        if (shape.mesh || shape.object3D) {
            return new ThreeJSAdapter(shape);
        }

        // Check for raw SVG element
        if (shape.node && shape.node instanceof SVGElement) {
            return new SVGElementAdapter(shape);
        }

        // Unknown type - return null adapter
        console.warn('ShapeVisibilityAdapter: Unknown shape type', shape);
        return new NullAdapter();
    }
}

/**
 * Base adapter interface
 */
class BaseAdapter {
    constructor(shape) {
        this.shape = shape;
    }

    show() { throw new Error('Not implemented'); }
    hide() { throw new Error('Not implemented'); }
    fadeIn(duration, onComplete) { throw new Error('Not implemented'); }
    fadeOut(duration, onComplete) { throw new Error('Not implemented'); }
    getElement() { return null; }
}

/**
 * Adapter for SVG shapes (SVGScriptShape and subclasses)
 */
class SVGShapeAdapter extends BaseAdapter {
    show() {
        if (this.shape.show) {
            this.shape.show();
        } else if (this.shape.shapeGroup) {
            this.shape.shapeGroup.show();
        }
    }

    hide() {
        if (this.shape.hide) {
            this.shape.hide();
        } else if (this.shape.shapeGroup) {
            this.shape.shapeGroup.hide();
        }
    }

    fadeIn(duration, onComplete) {
        const node = this.shape.shapeGroup.node;
        this.shape.shapeGroup.show();
        TweenMax.fromTo(node, duration,
            { opacity: 0 },
            {
                opacity: 1,
                onComplete: () => {
                    if (onComplete) onComplete();
                }
            }
        );
    }

    fadeOut(duration, onComplete) {
        const node = this.shape.shapeGroup.node;
        TweenMax.to(node, duration, {
            opacity: 0,
            onComplete: () => {
                this.shape.shapeGroup.hide();
                if (onComplete) onComplete();
            }
        });
    }

    getElement() {
        return this.shape.shapeGroup ? this.shape.shapeGroup.node : null;
    }
}

/**
 * Adapter for MathTextComponent (labels, math text)
 */
class MathTextAdapter extends BaseAdapter {
    show() {
        if (this.shape.show) {
            this.shape.show();
        }
    }

    hide() {
        if (this.shape.hide) {
            this.shape.hide();
        }
    }

    fadeIn(duration, onComplete) {
        const container = this.shape.containerDOM;
        if (!container) {
            if (onComplete) onComplete();
            return;
        }
        // Show first, then animate
        $(container).css({ display: 'block', opacity: 0 });
        TweenMax.to(container, duration, {
            opacity: 1,
            onComplete: () => {
                if (onComplete) onComplete();
            }
        });
    }

    fadeOut(duration, onComplete) {
        const container = this.shape.containerDOM;
        if (!container) {
            if (onComplete) onComplete();
            return;
        }
        TweenMax.to(container, duration, {
            opacity: 0,
            onComplete: () => {
                $(container).css('display', 'none');
                if (onComplete) onComplete();
            }
        });
    }

    getElement() {
        return this.shape.containerDOM;
    }
}

/**
 * Adapter for raw SVG.js elements
 */
class SVGElementAdapter extends BaseAdapter {
    show() {
        this.shape.show();
    }

    hide() {
        this.shape.hide();
    }

    fadeIn(duration, onComplete) {
        const node = this.shape.node;
        this.shape.show();
        TweenMax.fromTo(node, duration,
            { opacity: 0 },
            {
                opacity: 1,
                onComplete: () => {
                    if (onComplete) onComplete();
                }
            }
        );
    }

    fadeOut(duration, onComplete) {
        const node = this.shape.node;
        TweenMax.to(node, duration, {
            opacity: 0,
            onComplete: () => {
                this.shape.hide();
                if (onComplete) onComplete();
            }
        });
    }

    getElement() {
        return this.shape.node;
    }
}

/**
 * Adapter for Three.js 3D objects
 */
class ThreeJSAdapter extends BaseAdapter {
    getMesh() {
        return this.shape.mesh || this.shape.object3D;
    }

    show() {
        const mesh = this.getMesh();
        if (mesh) {
            mesh.visible = true;
            if (mesh.material) {
                mesh.material.opacity = 1;
            }
        }
    }

    hide() {
        const mesh = this.getMesh();
        if (mesh) {
            mesh.visible = false;
        }
    }

    fadeIn(duration, onComplete) {
        const mesh = this.getMesh();
        if (!mesh) {
            if (onComplete) onComplete();
            return;
        }

        mesh.visible = true;
        if (mesh.material) {
            mesh.material.transparent = true;
            TweenMax.fromTo(mesh.material, duration,
                { opacity: 0 },
                {
                    opacity: 1,
                    onComplete: () => {
                        if (onComplete) onComplete();
                    }
                }
            );
        } else {
            if (onComplete) onComplete();
        }
    }

    fadeOut(duration, onComplete) {
        const mesh = this.getMesh();
        if (!mesh) {
            if (onComplete) onComplete();
            return;
        }

        if (mesh.material) {
            mesh.material.transparent = true;
            TweenMax.to(mesh.material, duration, {
                opacity: 0,
                onComplete: () => {
                    mesh.visible = false;
                    if (onComplete) onComplete();
                }
            });
        } else {
            mesh.visible = false;
            if (onComplete) onComplete();
        }
    }

    getElement() {
        return this.getMesh();
    }
}

/**
 * Null adapter for unknown/missing shapes
 */
class NullAdapter extends BaseAdapter {
    constructor() {
        super(null);
    }

    show() {}
    hide() {}
    fadeIn(duration, onComplete) { if (onComplete) onComplete(); }
    fadeOut(duration, onComplete) { if (onComplete) onComplete(); }
}
