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

        // Check for TableCell (has isTableCell marker)
        if (shape.isTableCell) {
            return new TableCellVisibilityAdapter(shape);
        }

        // Check for TableRow (has isTableRow marker)
        if (shape.isTableRow) {
            return new TableRowVisibilityAdapter(shape);
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

        // Check for TextItem (has mathComponent and selectionUnit)
        if (shape.mathComponent && shape.selectionUnit) {
            return new TextItemAdapter(shape);
        }

        // Check for KatexTextItem (has katexComponent)
        if (shape.katexComponent) {
            return new KatexTextItemAdapter(shape);
        }

        // Check for TextItemCollection (has items array and get method)
        if (shape.items && Array.isArray(shape.items) && typeof shape.get === 'function') {
            // Check if it's a KaTeX collection (first item has katexComponent)
            const firstItem = shape.get(0);
            if (firstItem && firstItem.katexComponent) {
                return new KatexTextItemCollectionAdapter(shape);
            }
            return new TextItemCollectionAdapter(shape);
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
 * Adapter for TextItem (extracted portions of MathTextComponent)
 * Uses stroke-dasharray approach consistent with MathTextComponent's enableStroke/disableStroke
 */
class TextItemAdapter extends BaseAdapter {
    show() {
        const paths = this.shape.getSVGPaths();
        paths.forEach(path => {
            // Enable stroke - same as MathTextComponent.enableStroke()
            path.setAttribute('stroke-dasharray', '0,0');
            path.style.strokeDasharray = '0,0';
            path.style.opacity = '1';
            path.style.visibility = 'visible';
        });
    }

    hide() {
        const paths = this.shape.getSVGPaths();
        paths.forEach(path => {
            // Disable stroke - same as MathTextComponent.disableStroke()
            path.setAttribute('stroke-dasharray', '0,10000');
            path.style.strokeDasharray = '0,10000';
        });
    }

    fadeIn(duration, onComplete) {
        const paths = this.shape.getSVGPaths();
        if (!paths || paths.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        // First enable strokes but at 0 opacity
        paths.forEach(path => {
            path.setAttribute('stroke-dasharray', '0,0');
            path.style.strokeDasharray = '0,0';
            path.style.visibility = 'visible';
            path.style.opacity = '0';
        });
        // Animate all paths together, call onComplete when done
        let completed = 0;
        paths.forEach(path => {
            TweenMax.to(path, duration, {
                opacity: 1,
                onComplete: () => {
                    completed++;
                    if (completed === paths.length && onComplete) {
                        onComplete();
                    }
                }
            });
        });
    }

    fadeOut(duration, onComplete) {
        const paths = this.shape.getSVGPaths();
        if (!paths || paths.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        // First ensure strokes are visible (enabled) so we can fade them out
        paths.forEach(path => {
            path.setAttribute('stroke-dasharray', '0,0');
            path.style.strokeDasharray = '0,0';
            path.style.visibility = 'visible';
            path.style.opacity = '1';
        });
        let completed = 0;
        paths.forEach(path => {
            TweenMax.to(path, duration, {
                opacity: 0,
                onComplete: () => {
                    // Disable stroke after fade
                    path.setAttribute('stroke-dasharray', '0,10000');
                    path.style.strokeDasharray = '0,10000';
                    completed++;
                    if (completed === paths.length && onComplete) {
                        onComplete();
                    }
                }
            });
        });
    }

    getElement() {
        return this.shape.getSVGPaths();
    }
}

/**
 * Adapter for TextItemCollection (collection of TextItems from select/selectexcept)
 * Applies visibility operations to all items in the collection
 */
class TextItemCollectionAdapter extends BaseAdapter {
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

    show() {
        const paths = this._getAllPaths();
        paths.forEach(path => {
            path.setAttribute('stroke-dasharray', '0,0');
            path.style.strokeDasharray = '0,0';
            path.style.opacity = '1';
            path.style.visibility = 'visible';
        });
    }

    hide() {
        const paths = this._getAllPaths();
        paths.forEach(path => {
            path.setAttribute('stroke-dasharray', '0,10000');
            path.style.strokeDasharray = '0,10000';
        });
    }

    fadeIn(duration, onComplete) {
        const paths = this._getAllPaths();
        if (!paths || paths.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        paths.forEach(path => {
            path.setAttribute('stroke-dasharray', '0,0');
            path.style.strokeDasharray = '0,0';
            path.style.visibility = 'visible';
            path.style.opacity = '0';
        });
        let completed = 0;
        paths.forEach(path => {
            TweenMax.to(path, duration, {
                opacity: 1,
                onComplete: () => {
                    completed++;
                    if (completed === paths.length && onComplete) {
                        onComplete();
                    }
                }
            });
        });
    }

    fadeOut(duration, onComplete) {
        const paths = this._getAllPaths();
        if (!paths || paths.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        // First ensure strokes are visible (enabled) so we can fade them out
        paths.forEach(path => {
            path.setAttribute('stroke-dasharray', '0,0');
            path.style.strokeDasharray = '0,0';
            path.style.visibility = 'visible';
            path.style.opacity = '1';
        });
        let completed = 0;
        paths.forEach(path => {
            TweenMax.to(path, duration, {
                opacity: 0,
                onComplete: () => {
                    path.setAttribute('stroke-dasharray', '0,10000');
                    path.style.strokeDasharray = '0,10000';
                    completed++;
                    if (completed === paths.length && onComplete) {
                        onComplete();
                    }
                }
            });
        });
    }

    getElement() {
        return this._getAllPaths();
    }
}

/**
 * Adapter for TableCell (individual table cells)
 */
class TableCellVisibilityAdapter extends BaseAdapter {
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
        const element = this.shape.element;
        if (!element) {
            if (onComplete) onComplete();
            return;
        }
        // Show element first
        element.style.visibility = 'visible';
        element.style.opacity = '0';
        // Enable strokes if math content
        const paths = this.shape.getSVGPaths();
        paths.forEach(path => {
            path.setAttribute('stroke-dasharray', '0,0');
            path.style.strokeDasharray = '0,0';
            path.style.opacity = '0';
        });
        // Animate element opacity
        TweenMax.to(element, duration, {
            opacity: 1,
            onComplete: () => {
                // Also fade in paths
                paths.forEach(path => {
                    path.style.opacity = '1';
                });
                if (onComplete) onComplete();
            }
        });
        // Animate paths in parallel if they exist
        if (paths.length > 0) {
            paths.forEach(path => {
                TweenMax.to(path, duration, { opacity: 1 });
            });
        }
    }

    fadeOut(duration, onComplete) {
        const element = this.shape.element;
        if (!element) {
            if (onComplete) onComplete();
            return;
        }
        TweenMax.to(element, duration, {
            opacity: 0,
            onComplete: () => {
                element.style.visibility = 'hidden';
                // Disable strokes if math content
                const paths = this.shape.getSVGPaths();
                paths.forEach(path => {
                    path.setAttribute('stroke-dasharray', '0,10000');
                    path.style.strokeDasharray = '0,10000';
                });
                if (onComplete) onComplete();
            }
        });
    }

    getElement() {
        return this.shape.element;
    }
}

/**
 * Adapter for TableRow (applies operations to all cells in the row)
 */
class TableRowVisibilityAdapter extends BaseAdapter {
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
        const elements = this.shape.getElements();
        if (!elements || elements.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        // Show all cells first
        elements.forEach(el => {
            el.style.visibility = 'visible';
            el.style.opacity = '0';
        });
        // Enable all strokes
        const paths = this.shape.getSVGPaths();
        paths.forEach(path => {
            path.setAttribute('stroke-dasharray', '0,0');
            path.style.strokeDasharray = '0,0';
            path.style.opacity = '0';
        });
        // Animate all elements
        let completed = 0;
        elements.forEach(el => {
            TweenMax.to(el, duration, {
                opacity: 1,
                onComplete: () => {
                    completed++;
                    if (completed === elements.length && onComplete) {
                        onComplete();
                    }
                }
            });
        });
        // Animate paths in parallel
        paths.forEach(path => {
            TweenMax.to(path, duration, { opacity: 1 });
        });
    }

    fadeOut(duration, onComplete) {
        const elements = this.shape.getElements();
        if (!elements || elements.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        let completed = 0;
        elements.forEach(el => {
            TweenMax.to(el, duration, {
                opacity: 0,
                onComplete: () => {
                    el.style.visibility = 'hidden';
                    completed++;
                    if (completed === elements.length) {
                        // Disable all strokes
                        const paths = this.shape.getSVGPaths();
                        paths.forEach(path => {
                            path.setAttribute('stroke-dasharray', '0,10000');
                            path.style.strokeDasharray = '0,10000';
                        });
                        if (onComplete) onComplete();
                    }
                }
            });
        });
    }

    getElement() {
        return this.shape.getElements();
    }
}

/**
 * Adapter for KatexTextItem (extracted portions of KatexComponent)
 * Uses opacity on DOM elements instead of stroke-dasharray
 */
class KatexTextItemAdapter extends BaseAdapter {
    show() {
        const element = this.shape.getElement();
        if (element) {
            element.style.opacity = 1;
            element.style.visibility = 'visible';
        }
    }

    hide() {
        const element = this.shape.getElement();
        if (element) {
            // Don't use display:none - it collapses the parent KaTeX layout
            element.style.opacity = 0;
            element.style.visibility = 'hidden';
        }
    }

    fadeIn(duration, onComplete) {
        const element = this.shape.getElement();
        if (!element) {
            if (onComplete) onComplete();
            return;
        }
        element.style.visibility = 'visible';
        element.style.opacity = '0';
        TweenMax.to(element, duration, {
            opacity: 1,
            onComplete: () => {
                if (onComplete) onComplete();
            }
        });
    }

    fadeOut(duration, onComplete) {
        const element = this.shape.getElement();
        if (!element) {
            if (onComplete) onComplete();
            return;
        }
        TweenMax.to(element, duration, {
            opacity: 0,
            onComplete: () => {
                element.style.visibility = 'hidden';
                if (onComplete) onComplete();
            }
        });
    }

    getElement() {
        return this.shape.getElement();
    }
}

/**
 * Adapter for KatexTextItemCollection
 * Applies visibility operations to all KatexTextItems in the collection
 */
class KatexTextItemCollectionAdapter extends BaseAdapter {
    _getAllElements() {
        const elements = [];
        this.shape.getAll().forEach(item => {
            const el = item.getElement();
            if (el) elements.push(el);
        });
        return elements;
    }

    show() {
        this._getAllElements().forEach(el => {
            el.style.opacity = 1;
            el.style.visibility = 'visible';
        });
    }

    hide() {
        this._getAllElements().forEach(el => {
            // Don't use display:none - it collapses the parent KaTeX layout
            el.style.opacity = 0;
            el.style.visibility = 'hidden';
        });
    }

    fadeIn(duration, onComplete) {
        const elements = this._getAllElements();
        if (elements.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        elements.forEach(el => {
            el.style.visibility = 'visible';
            el.style.opacity = '0';
        });
        let completed = 0;
        elements.forEach(el => {
            TweenMax.to(el, duration, {
                opacity: 1,
                onComplete: () => {
                    completed++;
                    if (completed === elements.length && onComplete) {
                        onComplete();
                    }
                }
            });
        });
    }

    fadeOut(duration, onComplete) {
        const elements = this._getAllElements();
        if (elements.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        let completed = 0;
        elements.forEach(el => {
            TweenMax.to(el, duration, {
                opacity: 0,
                onComplete: () => {
                    el.style.visibility = 'hidden';
                    completed++;
                    if (completed === elements.length && onComplete) {
                        onComplete();
                    }
                }
            });
        });
    }

    getElement() {
        return this._getAllElements();
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
