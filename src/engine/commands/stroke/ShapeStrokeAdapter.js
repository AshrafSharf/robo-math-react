/**
 * ShapeStrokeAdapter - Abstracts stroke color operations for SVG, 3D, and MathText shapes
 *
 * Provides a unified interface for stroke color animation that works with:
 * - SVG shapes (SVGScriptShape and subclasses)
 * - MathTextComponent (LaTeX rendered text)
 * - Three.js 3D objects
 * - TextItem (extracted portions of MathTextComponent)
 * - TextItemCollection (collections from select/selectexcept)
 */
import { TweenMax } from 'gsap';
import $ from '../../../mathtext/utils/dom-query.js';
import { COLOR_MAP } from '../../../diagram/style_helper.js';

/**
 * Color utility functions
 */
function parseColor(color) {
    // Handle named colors
    if (COLOR_MAP[color?.toLowerCase()]) {
        color = COLOR_MAP[color.toLowerCase()];
    }

    // Parse hex color to RGB
    if (typeof color === 'string' && color.startsWith('#')) {
        const hex = color.slice(1);
        const bigint = parseInt(hex.length === 3
            ? hex.split('').map(c => c + c).join('')
            : hex, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }

    // Default to black
    return { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
    const toHex = (n) => {
        const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getComputedColor(element, property = 'stroke') {
    if (!element) return '#000000';

    // Try attribute first
    let color = element.getAttribute(property);
    if (color && color !== 'none' && color !== 'currentColor') {
        return color;
    }

    // Try computed style
    const computed = window.getComputedStyle(element);
    color = computed.getPropertyValue(property);
    if (color && color !== 'none') {
        // Convert rgb(r, g, b) to hex if needed
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            return rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
        }
        return color;
    }

    return '#000000';
}

export class ShapeStrokeAdapter {
    /**
     * Detect shape type and return appropriate adapter
     * @param {Object} shape - The shape object (commandResult from registry)
     * @returns {ShapeStrokeAdapter}
     */
    static for(shape) {
        if (!shape) {
            return new NullStrokeAdapter();
        }

        // Check for MathTextComponent (has containerDOM)
        if (shape.containerDOM) {
            return new MathTextStrokeAdapter(shape);
        }

        // Check for SVG shape (has shapeGroup with SVG.js node)
        if (shape.shapeGroup && shape.shapeGroup.node) {
            return new SVGShapeStrokeAdapter(shape);
        }

        // Check for 3D shape (has Three.js mesh/object3D)
        if (shape.mesh || shape.object3D) {
            return new ThreeJSStrokeAdapter(shape);
        }

        // Check for raw SVG element
        if (shape.node && shape.node instanceof SVGElement) {
            return new SVGElementStrokeAdapter(shape);
        }

        // Check for TextItem (has mathComponent and selectionUnit)
        if (shape.mathComponent && shape.selectionUnit) {
            return new TextItemStrokeAdapter(shape);
        }

        // Check for TextItemCollection (has items array and get method)
        if (shape.items && Array.isArray(shape.items) && typeof shape.get === 'function') {
            return new TextItemCollectionStrokeAdapter(shape);
        }

        // Unknown type - return null adapter
        console.warn('ShapeStrokeAdapter: Unknown shape type', shape);
        return new NullStrokeAdapter();
    }
}

/**
 * Base adapter interface
 */
class BaseStrokeAdapter {
    constructor(shape) {
        this.shape = shape;
        this.originalColor = null;
        this.originalOpacity = null;
        this.targetColor = null;
        this.targetOpacity = null;
    }

    captureOriginal() { throw new Error('Not implemented'); }
    resetToOriginal() { throw new Error('Not implemented'); }
    setColor(color, opacity) { throw new Error('Not implemented'); }
    animateColor(color, opacity, duration, onComplete) { throw new Error('Not implemented'); }
}

/**
 * Adapter for SVG shapes (SVGScriptShape and subclasses)
 */
class SVGShapeStrokeAdapter extends BaseStrokeAdapter {
    captureOriginal() {
        // Get from styleObj if available
        if (this.shape.styleObj) {
            this.originalColor = this.shape.styleObj.stroke || '#000000';
            this.originalOpacity = this.shape.styleObj['stroke-opacity'] ?? 1;
        } else {
            // Fallback to computed style from node
            const node = this.shape.shapeGroup?.node;
            if (node) {
                const firstPath = node.querySelector('path, line, circle, ellipse, rect, polygon, polyline');
                this.originalColor = getComputedColor(firstPath || node, 'stroke');
                this.originalOpacity = parseFloat(node.getAttribute('stroke-opacity') || 1);
            } else {
                this.originalColor = '#000000';
                this.originalOpacity = 1;
            }
        }
    }

    resetToOriginal() {
        if (this.originalColor !== null) {
            this.setColor(this.originalColor, this.originalOpacity);
        }
    }

    setColor(color, opacity = 1) {
        const resolvedColor = COLOR_MAP[color?.toLowerCase()] || color;

        // Update styleObj if available
        if (this.shape.styleObj) {
            this.shape.styleObj.stroke = resolvedColor;
            this.shape.styleObj['stroke-opacity'] = opacity;
        }

        // Apply to SVG elements
        const node = this.shape.shapeGroup?.node;
        if (node) {
            const elements = node.querySelectorAll('path, line, circle, ellipse, rect, polygon, polyline');
            elements.forEach(el => {
                el.setAttribute('stroke', resolvedColor);
                el.setAttribute('stroke-opacity', opacity);
            });
            // Also set on the group itself in case it's a simple shape
            if (node.tagName !== 'g') {
                node.setAttribute('stroke', resolvedColor);
                node.setAttribute('stroke-opacity', opacity);
            }
        }

        // Call shape's stroke method if available for consistency
        if (typeof this.shape.stroke === 'function') {
            this.shape.stroke(resolvedColor);
        }
    }

    animateColor(color, opacity, duration, onComplete) {
        const startColor = parseColor(this.originalColor || '#000000');
        const endColor = parseColor(color);
        const startOpacity = this.originalOpacity ?? 1;
        const resolvedTargetColor = COLOR_MAP[color?.toLowerCase()] || color;

        const colorData = {
            r: startColor.r,
            g: startColor.g,
            b: startColor.b,
            a: startOpacity
        };

        const node = this.shape.shapeGroup?.node;
        const elements = node ? node.querySelectorAll('path, line, circle, ellipse, rect, polygon, polyline') : [];

        TweenMax.to(colorData, duration, {
            r: endColor.r,
            g: endColor.g,
            b: endColor.b,
            a: opacity,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                const hex = rgbToHex(colorData.r, colorData.g, colorData.b);
                elements.forEach(el => {
                    el.setAttribute('stroke', hex);
                    el.setAttribute('stroke-opacity', colorData.a);
                });
                if (node && node.tagName !== 'g') {
                    node.setAttribute('stroke', hex);
                    node.setAttribute('stroke-opacity', colorData.a);
                }
                // Update styleObj
                if (this.shape.styleObj) {
                    this.shape.styleObj.stroke = hex;
                    this.shape.styleObj['stroke-opacity'] = colorData.a;
                }
            },
            onComplete: () => {
                // Ensure final state is set to target color
                this.setColor(resolvedTargetColor, opacity);
                if (onComplete) onComplete();
            }
        });
    }
}

/**
 * Adapter for MathTextComponent (labels, math text)
 */
class MathTextStrokeAdapter extends BaseStrokeAdapter {
    captureOriginal() {
        this.originalColor = this.shape.strokeColor || '#000000';
        this.originalOpacity = 1;
    }

    resetToOriginal() {
        if (this.originalColor !== null) {
            this.setColor(this.originalColor, this.originalOpacity);
        }
    }

    setColor(color, opacity = 1) {
        const resolvedColor = COLOR_MAP[color?.toLowerCase()] || color;
        this.shape.strokeColor = resolvedColor;

        const container = this.shape.containerDOM;
        if (!container) return;

        // Only set stroke for MathJax paths (not fill - causes smudging)
        $("path", container).each((i, path) => {
            path.setAttribute('stroke', resolvedColor);
            path.style.stroke = resolvedColor;
            path.setAttribute('stroke-opacity', opacity);
            path.style.strokeOpacity = opacity;
        });
    }

    animateColor(color, opacity, duration, onComplete) {
        const startColor = parseColor(this.originalColor || '#000000');
        const endColor = parseColor(color);
        const startOpacity = this.originalOpacity ?? 1;
        const resolvedTargetColor = COLOR_MAP[color?.toLowerCase()] || color;

        const colorData = {
            r: startColor.r,
            g: startColor.g,
            b: startColor.b,
            a: startOpacity
        };

        const container = this.shape.containerDOM;
        if (!container) {
            if (onComplete) onComplete();
            return;
        }

        const paths = container.querySelectorAll('path');

        TweenMax.to(colorData, duration, {
            r: endColor.r,
            g: endColor.g,
            b: endColor.b,
            a: opacity,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                const hex = rgbToHex(colorData.r, colorData.g, colorData.b);
                // Only set stroke for MathJax paths (not fill)
                paths.forEach(path => {
                    path.setAttribute('stroke', hex);
                    path.style.stroke = hex;
                    path.setAttribute('stroke-opacity', colorData.a);
                    path.style.strokeOpacity = colorData.a;
                });
                this.shape.strokeColor = hex;
            },
            onComplete: () => {
                // Ensure final state is set to target color
                this.setColor(resolvedTargetColor, opacity);
                if (onComplete) onComplete();
            }
        });
    }
}

/**
 * Adapter for raw SVG.js elements
 */
class SVGElementStrokeAdapter extends BaseStrokeAdapter {
    captureOriginal() {
        const node = this.shape.node;
        this.originalColor = getComputedColor(node, 'stroke');
        this.originalOpacity = parseFloat(node.getAttribute('stroke-opacity') || 1);
    }

    resetToOriginal() {
        if (this.originalColor !== null) {
            this.setColor(this.originalColor, this.originalOpacity);
        }
    }

    setColor(color, opacity = 1) {
        const resolvedColor = COLOR_MAP[color?.toLowerCase()] || color;
        const node = this.shape.node;
        node.setAttribute('stroke', resolvedColor);
        node.setAttribute('stroke-opacity', opacity);
    }

    animateColor(color, opacity, duration, onComplete) {
        const startColor = parseColor(this.originalColor || '#000000');
        const endColor = parseColor(color);
        const startOpacity = this.originalOpacity ?? 1;
        const resolvedTargetColor = COLOR_MAP[color?.toLowerCase()] || color;

        const colorData = {
            r: startColor.r,
            g: startColor.g,
            b: startColor.b,
            a: startOpacity
        };

        const node = this.shape.node;

        TweenMax.to(colorData, duration, {
            r: endColor.r,
            g: endColor.g,
            b: endColor.b,
            a: opacity,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                const hex = rgbToHex(colorData.r, colorData.g, colorData.b);
                node.setAttribute('stroke', hex);
                node.setAttribute('stroke-opacity', colorData.a);
            },
            onComplete: () => {
                // Ensure final state is set to target color
                this.setColor(resolvedTargetColor, opacity);
                if (onComplete) onComplete();
            }
        });
    }
}

/**
 * Adapter for Three.js 3D objects
 */
class ThreeJSStrokeAdapter extends BaseStrokeAdapter {
    getMesh() {
        return this.shape.mesh || this.shape.object3D;
    }

    captureOriginal() {
        const mesh = this.getMesh();
        if (mesh && mesh.material) {
            const color = mesh.material.color;
            if (color) {
                // THREE.Color stores as 0-1 floats
                this.originalColor = {
                    r: Math.round(color.r * 255),
                    g: Math.round(color.g * 255),
                    b: Math.round(color.b * 255)
                };
            } else {
                this.originalColor = { r: 0, g: 0, b: 0 };
            }
            this.originalOpacity = mesh.material.opacity ?? 1;
        } else {
            this.originalColor = { r: 0, g: 0, b: 0 };
            this.originalOpacity = 1;
        }
    }

    resetToOriginal() {
        if (this.originalColor !== null) {
            const hex = rgbToHex(this.originalColor.r, this.originalColor.g, this.originalColor.b);
            this.setColor(hex, this.originalOpacity);
        }
    }

    setColor(color, opacity = 1) {
        const mesh = this.getMesh();
        if (!mesh || !mesh.material) return;

        const parsed = parseColor(color);

        // Set color (THREE.Color uses 0-1 range)
        if (mesh.material.color) {
            mesh.material.color.setRGB(parsed.r / 255, parsed.g / 255, parsed.b / 255);
        }

        // Set opacity
        mesh.material.transparent = opacity < 1;
        mesh.material.opacity = opacity;
        mesh.material.needsUpdate = true;
    }

    animateColor(color, opacity, duration, onComplete) {
        const mesh = this.getMesh();
        if (!mesh || !mesh.material) {
            if (onComplete) onComplete();
            return;
        }

        const startColor = this.originalColor || { r: 0, g: 0, b: 0 };
        const endColor = parseColor(color);
        const startOpacity = this.originalOpacity ?? 1;
        const resolvedTargetColor = COLOR_MAP[color?.toLowerCase()] || color;

        const colorData = {
            r: startColor.r,
            g: startColor.g,
            b: startColor.b,
            a: startOpacity
        };

        TweenMax.to(colorData, duration, {
            r: endColor.r,
            g: endColor.g,
            b: endColor.b,
            a: opacity,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                if (mesh.material.color) {
                    mesh.material.color.setRGB(colorData.r / 255, colorData.g / 255, colorData.b / 255);
                }
                mesh.material.transparent = colorData.a < 1;
                mesh.material.opacity = colorData.a;
                mesh.material.needsUpdate = true;
            },
            onComplete: () => {
                // Ensure final state is set to target color
                this.setColor(resolvedTargetColor, opacity);
                if (onComplete) onComplete();
            }
        });
    }
}

/**
 * Adapter for TextItem (extracted portions of MathTextComponent)
 */
class TextItemStrokeAdapter extends BaseStrokeAdapter {
    captureOriginal() {
        const paths = this.shape.getSVGPaths();
        if (paths && paths.length > 0) {
            this.originalColor = getComputedColor(paths[0], 'stroke');
            this.originalOpacity = parseFloat(paths[0].getAttribute('stroke-opacity') || 1);
        } else {
            this.originalColor = '#000000';
            this.originalOpacity = 1;
        }
    }

    resetToOriginal() {
        if (this.originalColor !== null) {
            this.setColor(this.originalColor, this.originalOpacity);
        }
    }

    setColor(color, opacity = 1) {
        const resolvedColor = COLOR_MAP[color?.toLowerCase()] || color;
        const paths = this.shape.getSVGPaths();

        paths.forEach(path => {
            path.setAttribute('stroke', resolvedColor);
            path.style.stroke = resolvedColor;
            path.setAttribute('stroke-opacity', opacity);
            path.style.strokeOpacity = opacity;
        });
    }

    animateColor(color, opacity, duration, onComplete) {
        const paths = this.shape.getSVGPaths();
        if (!paths || paths.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        const startColor = parseColor(this.originalColor || '#000000');
        const endColor = parseColor(color);
        const startOpacity = this.originalOpacity ?? 1;
        const resolvedTargetColor = COLOR_MAP[color?.toLowerCase()] || color;

        const colorData = {
            r: startColor.r,
            g: startColor.g,
            b: startColor.b,
            a: startOpacity
        };

        TweenMax.to(colorData, duration, {
            r: endColor.r,
            g: endColor.g,
            b: endColor.b,
            a: opacity,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                const hex = rgbToHex(colorData.r, colorData.g, colorData.b);
                paths.forEach(path => {
                    path.setAttribute('stroke', hex);
                    path.style.stroke = hex;
                    path.setAttribute('stroke-opacity', colorData.a);
                    path.style.strokeOpacity = colorData.a;
                });
            },
            onComplete: () => {
                this.setColor(resolvedTargetColor, opacity);
                if (onComplete) onComplete();
            }
        });
    }
}

/**
 * Adapter for TextItemCollection (collection of TextItems from select/selectexcept)
 */
class TextItemCollectionStrokeAdapter extends BaseStrokeAdapter {
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
            this.originalColor = getComputedColor(paths[0], 'stroke');
            this.originalOpacity = parseFloat(paths[0].getAttribute('stroke-opacity') || 1);
        } else {
            this.originalColor = '#000000';
            this.originalOpacity = 1;
        }
    }

    resetToOriginal() {
        if (this.originalColor !== null) {
            this.setColor(this.originalColor, this.originalOpacity);
        }
    }

    setColor(color, opacity = 1) {
        const resolvedColor = COLOR_MAP[color?.toLowerCase()] || color;
        const paths = this._getAllPaths();

        paths.forEach(path => {
            path.setAttribute('stroke', resolvedColor);
            path.style.stroke = resolvedColor;
            path.setAttribute('stroke-opacity', opacity);
            path.style.strokeOpacity = opacity;
        });
    }

    animateColor(color, opacity, duration, onComplete) {
        const paths = this._getAllPaths();
        if (!paths || paths.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        const startColor = parseColor(this.originalColor || '#000000');
        const endColor = parseColor(color);
        const startOpacity = this.originalOpacity ?? 1;
        const resolvedTargetColor = COLOR_MAP[color?.toLowerCase()] || color;

        const colorData = {
            r: startColor.r,
            g: startColor.g,
            b: startColor.b,
            a: startOpacity
        };

        TweenMax.to(colorData, duration, {
            r: endColor.r,
            g: endColor.g,
            b: endColor.b,
            a: opacity,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                const hex = rgbToHex(colorData.r, colorData.g, colorData.b);
                paths.forEach(path => {
                    path.setAttribute('stroke', hex);
                    path.style.stroke = hex;
                    path.setAttribute('stroke-opacity', colorData.a);
                    path.style.strokeOpacity = colorData.a;
                });
            },
            onComplete: () => {
                // Ensure final state is set to target color
                this.setColor(resolvedTargetColor, opacity);
                if (onComplete) onComplete();
            }
        });
    }
}

/**
 * Null adapter for unknown/missing shapes
 */
class NullStrokeAdapter extends BaseStrokeAdapter {
    constructor() {
        super(null);
    }

    captureOriginal() {}
    resetToOriginal() {}
    setColor(color, opacity) {}
    animateColor(color, opacity, duration, onComplete) {
        if (onComplete) onComplete();
    }
}
