/**
 * ShapeStrokeWidthAdapter - Abstracts stroke-width operations for SVG, 3D, and MathText shapes
 *
 * Provides a unified interface for stroke-width animation that works with:
 * - SVG shapes (SVGScriptShape and subclasses)
 * - MathTextComponent (LaTeX rendered text)
 * - Three.js 3D objects
 * - TextItem (extracted portions of MathTextComponent)
 * - TextItemCollection (collections from select/selectexcept)
 */
import { TweenMax } from 'gsap';
import $ from '../../../mathtext/utils/dom-query.js';

export class ShapeStrokeWidthAdapter {
    /**
     * Detect shape type and return appropriate adapter
     * @param {Object} shape - The shape object (commandResult from registry)
     * @returns {ShapeStrokeWidthAdapter}
     */
    static for(shape) {
        if (!shape) {
            return new NullStrokeWidthAdapter();
        }

        // Check for MathTextComponent (has containerDOM)
        if (shape.containerDOM) {
            return new MathTextStrokeWidthAdapter(shape);
        }

        // Check for SVG shape (has shapeGroup with SVG.js node)
        if (shape.shapeGroup && shape.shapeGroup.node) {
            return new SVGShapeStrokeWidthAdapter(shape);
        }

        // Check for 3D shape (has Three.js mesh/object3D)
        if (shape.mesh || shape.object3D) {
            return new ThreeJSStrokeWidthAdapter(shape);
        }

        // Check for raw SVG element
        if (shape.node && shape.node instanceof SVGElement) {
            return new SVGElementStrokeWidthAdapter(shape);
        }

        // Check for TextItem (has mathComponent and selectionUnit)
        if (shape.mathComponent && shape.selectionUnit) {
            return new TextItemStrokeWidthAdapter(shape);
        }

        // Check for TextItemCollection (has items array and get method)
        if (shape.items && Array.isArray(shape.items) && typeof shape.get === 'function') {
            return new TextItemCollectionStrokeWidthAdapter(shape);
        }

        // Unknown type - return null adapter
        console.warn('ShapeStrokeWidthAdapter: Unknown shape type', shape);
        return new NullStrokeWidthAdapter();
    }
}

/**
 * Get computed stroke-width from an element
 */
function getComputedStrokeWidth(element) {
    if (!element) return 1;

    // Try attribute first
    let width = element.getAttribute('stroke-width');
    if (width && width !== 'inherit') {
        return parseFloat(width) || 1;
    }

    // Try computed style
    const computed = window.getComputedStyle(element);
    width = computed.getPropertyValue('stroke-width');
    if (width) {
        return parseFloat(width) || 1;
    }

    return 1;
}

/**
 * Base adapter interface
 */
class BaseStrokeWidthAdapter {
    constructor(shape) {
        this.shape = shape;
        this.originalWidth = null;
    }

    captureOriginal() { throw new Error('Not implemented'); }
    resetToOriginal() { throw new Error('Not implemented'); }
    setWidth(width) { throw new Error('Not implemented'); }
    animateWidth(width, duration, onComplete) { throw new Error('Not implemented'); }
}

/**
 * Adapter for SVG shapes (SVGScriptShape and subclasses)
 */
class SVGShapeStrokeWidthAdapter extends BaseStrokeWidthAdapter {
    captureOriginal() {
        // Get from styleObj if available
        if (this.shape.styleObj) {
            this.originalWidth = this.shape.styleObj['stroke-width'] ?? 1;
        } else {
            // Fallback to computed style from node
            const node = this.shape.shapeGroup?.node;
            if (node) {
                const firstPath = node.querySelector('path, line, circle, ellipse, rect, polygon, polyline');
                this.originalWidth = getComputedStrokeWidth(firstPath || node);
            } else {
                this.originalWidth = 1;
            }
        }
    }

    resetToOriginal() {
        if (this.originalWidth !== null) {
            this.setWidth(this.originalWidth);
        }
    }

    setWidth(width) {
        // Update styleObj if available
        if (this.shape.styleObj) {
            this.shape.styleObj['stroke-width'] = width;
        }

        // Apply to SVG elements
        const node = this.shape.shapeGroup?.node;
        if (node) {
            const elements = node.querySelectorAll('path, line, circle, ellipse, rect, polygon, polyline');
            elements.forEach(el => {
                el.setAttribute('stroke-width', width);
            });
            // Also set on the group itself in case it's a simple shape
            if (node.tagName !== 'g') {
                node.setAttribute('stroke-width', width);
            }
        }
    }

    animateWidth(width, duration, onComplete) {
        const startWidth = this.originalWidth ?? 1;

        const widthData = { width: startWidth };

        const node = this.shape.shapeGroup?.node;
        const elements = node ? node.querySelectorAll('path, line, circle, ellipse, rect, polygon, polyline') : [];

        TweenMax.to(widthData, duration, {
            width: width,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                elements.forEach(el => {
                    el.setAttribute('stroke-width', widthData.width);
                });
                if (node && node.tagName !== 'g') {
                    node.setAttribute('stroke-width', widthData.width);
                }
                // Update styleObj
                if (this.shape.styleObj) {
                    this.shape.styleObj['stroke-width'] = widthData.width;
                }
            },
            onComplete: () => {
                // Ensure final state is set
                this.setWidth(width);
                if (onComplete) onComplete();
            }
        });
    }
}

/**
 * Adapter for MathTextComponent (labels, math text)
 */
class MathTextStrokeWidthAdapter extends BaseStrokeWidthAdapter {
    captureOriginal() {
        const container = this.shape.containerDOM;
        if (container) {
            const firstPath = container.querySelector('path');
            this.originalWidth = getComputedStrokeWidth(firstPath);
        } else {
            this.originalWidth = 1;
        }
    }

    resetToOriginal() {
        if (this.originalWidth !== null) {
            this.setWidth(this.originalWidth);
        }
    }

    setWidth(width) {
        const container = this.shape.containerDOM;
        if (!container) return;

        $("path", container).each((i, path) => {
            path.setAttribute('stroke-width', width);
            path.style.strokeWidth = width;
        });
    }

    animateWidth(width, duration, onComplete) {
        const container = this.shape.containerDOM;
        if (!container) {
            if (onComplete) onComplete();
            return;
        }

        const startWidth = this.originalWidth ?? 1;
        const widthData = { width: startWidth };
        const paths = container.querySelectorAll('path');

        TweenMax.to(widthData, duration, {
            width: width,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                paths.forEach(path => {
                    path.setAttribute('stroke-width', widthData.width);
                    path.style.strokeWidth = widthData.width;
                });
            },
            onComplete: () => {
                this.setWidth(width);
                if (onComplete) onComplete();
            }
        });
    }
}

/**
 * Adapter for raw SVG.js elements
 */
class SVGElementStrokeWidthAdapter extends BaseStrokeWidthAdapter {
    captureOriginal() {
        const node = this.shape.node;
        this.originalWidth = getComputedStrokeWidth(node);
    }

    resetToOriginal() {
        if (this.originalWidth !== null) {
            this.setWidth(this.originalWidth);
        }
    }

    setWidth(width) {
        const node = this.shape.node;
        node.setAttribute('stroke-width', width);
    }

    animateWidth(width, duration, onComplete) {
        const startWidth = this.originalWidth ?? 1;
        const widthData = { width: startWidth };
        const node = this.shape.node;

        TweenMax.to(widthData, duration, {
            width: width,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                node.setAttribute('stroke-width', widthData.width);
            },
            onComplete: () => {
                this.setWidth(width);
                if (onComplete) onComplete();
            }
        });
    }
}

/**
 * Adapter for Three.js 3D objects
 */
class ThreeJSStrokeWidthAdapter extends BaseStrokeWidthAdapter {
    getMesh() {
        return this.shape.mesh || this.shape.object3D;
    }

    captureOriginal() {
        const mesh = this.getMesh();
        if (mesh && mesh.material && mesh.material.linewidth !== undefined) {
            this.originalWidth = mesh.material.linewidth;
        } else {
            this.originalWidth = 1;
        }
    }

    resetToOriginal() {
        if (this.originalWidth !== null) {
            this.setWidth(this.originalWidth);
        }
    }

    setWidth(width) {
        const mesh = this.getMesh();
        if (!mesh || !mesh.material) return;

        if (mesh.material.linewidth !== undefined) {
            mesh.material.linewidth = width;
            mesh.material.needsUpdate = true;
        }
    }

    animateWidth(width, duration, onComplete) {
        const mesh = this.getMesh();
        if (!mesh || !mesh.material) {
            if (onComplete) onComplete();
            return;
        }

        const startWidth = this.originalWidth ?? 1;
        const widthData = { width: startWidth };

        TweenMax.to(widthData, duration, {
            width: width,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                if (mesh.material.linewidth !== undefined) {
                    mesh.material.linewidth = widthData.width;
                    mesh.material.needsUpdate = true;
                }
            },
            onComplete: () => {
                this.setWidth(width);
                if (onComplete) onComplete();
            }
        });
    }
}

/**
 * Adapter for TextItem (extracted portions of MathTextComponent)
 */
class TextItemStrokeWidthAdapter extends BaseStrokeWidthAdapter {
    captureOriginal() {
        const paths = this.shape.getSVGPaths();
        if (paths && paths.length > 0) {
            this.originalWidth = getComputedStrokeWidth(paths[0]);
        } else {
            this.originalWidth = 1;
        }
    }

    resetToOriginal() {
        if (this.originalWidth !== null) {
            this.setWidth(this.originalWidth);
        }
    }

    setWidth(width) {
        const paths = this.shape.getSVGPaths();

        paths.forEach(path => {
            path.setAttribute('stroke-width', width);
            path.style.strokeWidth = width;
        });
    }

    animateWidth(width, duration, onComplete) {
        const paths = this.shape.getSVGPaths();
        if (!paths || paths.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        const startWidth = this.originalWidth ?? 1;
        const widthData = { width: startWidth };

        TweenMax.to(widthData, duration, {
            width: width,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                paths.forEach(path => {
                    path.setAttribute('stroke-width', widthData.width);
                    path.style.strokeWidth = widthData.width;
                });
            },
            onComplete: () => {
                this.setWidth(width);
                if (onComplete) onComplete();
            }
        });
    }
}

/**
 * Adapter for TextItemCollection (collection of TextItems from select/selectexcept)
 */
class TextItemCollectionStrokeWidthAdapter extends BaseStrokeWidthAdapter {
    /**
     * Get all SVG paths from all TextItems in the collection
     * @returns {Element[]}
     */
    _getAllPaths() {
        const allPaths = [];
        this.shape.getAll().forEach(textItem => {
            const paths = textItem.getSVGPaths();
            if (paths) {
                allPaths.push(...paths);
            }
        });
        return allPaths;
    }

    captureOriginal() {
        const paths = this._getAllPaths();
        if (paths && paths.length > 0) {
            this.originalWidth = getComputedStrokeWidth(paths[0]);
        } else {
            this.originalWidth = 1;
        }
    }

    resetToOriginal() {
        if (this.originalWidth !== null) {
            this.setWidth(this.originalWidth);
        }
    }

    setWidth(width) {
        const paths = this._getAllPaths();

        paths.forEach(path => {
            path.setAttribute('stroke-width', width);
            path.style.strokeWidth = width;
        });
    }

    animateWidth(width, duration, onComplete) {
        const paths = this._getAllPaths();
        if (!paths || paths.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        const startWidth = this.originalWidth ?? 1;
        const widthData = { width: startWidth };

        TweenMax.to(widthData, duration, {
            width: width,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                paths.forEach(path => {
                    path.setAttribute('stroke-width', widthData.width);
                    path.style.strokeWidth = widthData.width;
                });
            },
            onComplete: () => {
                this.setWidth(width);
                if (onComplete) onComplete();
            }
        });
    }
}

/**
 * Null adapter for unknown/missing shapes
 */
class NullStrokeWidthAdapter extends BaseStrokeWidthAdapter {
    constructor() {
        super(null);
    }

    captureOriginal() {}
    resetToOriginal() {}
    setWidth(width) {}
    animateWidth(width, duration, onComplete) {
        if (onComplete) onComplete();
    }
}
