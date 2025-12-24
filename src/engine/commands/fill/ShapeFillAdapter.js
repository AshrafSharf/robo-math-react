/**
 * ShapeFillAdapter - Abstracts fill color operations for SVG and 3D shapes
 *
 * Provides a unified interface for fill color animation that works with:
 * - SVG shapes (SVGScriptShape and subclasses)
 * - Three.js 3D objects
 *
 * Note: MathText and TextItem do not support fill - they use stroke for rendering.
 */
import { TweenMax } from 'gsap';
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

function getComputedColor(element, property = 'fill') {
    if (!element) return 'transparent';

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

    return 'transparent';
}

export class ShapeFillAdapter {
    /**
     * Detect shape type and return appropriate adapter
     * @param {Object} shape - The shape object (commandResult from registry)
     * @returns {ShapeFillAdapter}
     */
    static for(shape) {
        if (!shape) {
            return new NullFillAdapter();
        }

        // Check for TableCell (has isTableCell marker) - supports background fill
        if (shape.isTableCell) {
            return new TableCellFillAdapter(shape);
        }

        // Check for TableRow (has isTableRow marker) - supports background fill
        if (shape.isTableRow) {
            return new TableRowFillAdapter(shape);
        }

        // MathText does not support fill - use null adapter
        if (shape.containerDOM) {
            return new NullFillAdapter();
        }

        // Check for SVG shape (has shapeGroup with SVG.js node)
        if (shape.shapeGroup && shape.shapeGroup.node) {
            return new SVGShapeFillAdapter(shape);
        }

        // Check for 3D shape (has Three.js mesh/object3D)
        if (shape.mesh || shape.object3D) {
            return new ThreeJSFillAdapter(shape);
        }

        // Check for raw SVG element
        if (shape.node && shape.node instanceof SVGElement) {
            return new SVGElementFillAdapter(shape);
        }

        // TextItem does not support fill - use null adapter
        if (shape.mathComponent && shape.selectionUnit) {
            return new NullFillAdapter();
        }

        // TextItemCollection does not support fill - use null adapter
        if (shape.items && Array.isArray(shape.items) && typeof shape.get === 'function') {
            return new NullFillAdapter();
        }

        // Unknown type - return null adapter
        console.warn('ShapeFillAdapter: Unknown shape type', shape);
        return new NullFillAdapter();
    }
}

/**
 * Base adapter interface
 */
class BaseFillAdapter {
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
class SVGShapeFillAdapter extends BaseFillAdapter {
    captureOriginal() {
        // Get from styleObj if available
        if (this.shape.styleObj) {
            this.originalColor = this.shape.styleObj.fill || 'transparent';
            this.originalOpacity = this.shape.styleObj['fill-opacity'] ?? 1;
        } else {
            // Fallback to computed style from node
            const node = this.shape.shapeGroup?.node;
            if (node) {
                const firstPath = node.querySelector('path, line, circle, ellipse, rect, polygon, polyline');
                this.originalColor = getComputedColor(firstPath || node, 'fill');
                this.originalOpacity = parseFloat(node.getAttribute('fill-opacity') || 1);
            } else {
                this.originalColor = 'transparent';
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
            this.shape.styleObj.fill = resolvedColor;
            this.shape.styleObj['fill-opacity'] = opacity;
        }

        // Apply to SVG elements
        const node = this.shape.shapeGroup?.node;
        if (node) {
            const elements = node.querySelectorAll('path, line, circle, ellipse, rect, polygon, polyline');
            elements.forEach(el => {
                el.setAttribute('fill', resolvedColor);
                el.setAttribute('fill-opacity', opacity);
            });
            // Also set on the group itself in case it's a simple shape
            if (node.tagName !== 'g') {
                node.setAttribute('fill', resolvedColor);
                node.setAttribute('fill-opacity', opacity);
            }
        }

        // Call shape's fill method if available for consistency
        if (typeof this.shape.fill === 'function') {
            this.shape.fill(resolvedColor);
        }
    }

    animateColor(color, opacity, duration, onComplete) {
        const startColor = parseColor(this.originalColor || 'transparent');
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
                    el.setAttribute('fill', hex);
                    el.setAttribute('fill-opacity', colorData.a);
                });
                if (node && node.tagName !== 'g') {
                    node.setAttribute('fill', hex);
                    node.setAttribute('fill-opacity', colorData.a);
                }
                // Update styleObj
                if (this.shape.styleObj) {
                    this.shape.styleObj.fill = hex;
                    this.shape.styleObj['fill-opacity'] = colorData.a;
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
 * Adapter for raw SVG.js elements
 */
class SVGElementFillAdapter extends BaseFillAdapter {
    captureOriginal() {
        const node = this.shape.node;
        this.originalColor = getComputedColor(node, 'fill');
        this.originalOpacity = parseFloat(node.getAttribute('fill-opacity') || 1);
    }

    resetToOriginal() {
        if (this.originalColor !== null) {
            this.setColor(this.originalColor, this.originalOpacity);
        }
    }

    setColor(color, opacity = 1) {
        const resolvedColor = COLOR_MAP[color?.toLowerCase()] || color;
        const node = this.shape.node;
        node.setAttribute('fill', resolvedColor);
        node.setAttribute('fill-opacity', opacity);
    }

    animateColor(color, opacity, duration, onComplete) {
        const startColor = parseColor(this.originalColor || 'transparent');
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
                node.setAttribute('fill', hex);
                node.setAttribute('fill-opacity', colorData.a);
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
class ThreeJSFillAdapter extends BaseFillAdapter {
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
 * Adapter for TableCell fill (background color)
 */
class TableCellFillAdapter extends BaseFillAdapter {
    captureOriginal() {
        const element = this.shape.element;
        if (element) {
            const computed = window.getComputedStyle(element);
            this.originalColor = computed.backgroundColor || 'transparent';
            // Parse opacity if rgba
            const match = this.originalColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (match) {
                this.originalColor = rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
                this.originalOpacity = match[4] !== undefined ? parseFloat(match[4]) : 1;
            } else {
                this.originalOpacity = 1;
            }
        } else {
            this.originalColor = 'transparent';
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
        const element = this.shape.element;
        if (element) {
            if (opacity < 1) {
                // Use rgba for transparency
                const parsed = parseColor(resolvedColor);
                element.style.backgroundColor = `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${opacity})`;
            } else {
                element.style.backgroundColor = resolvedColor;
            }
        }
    }

    animateColor(color, opacity, duration, onComplete) {
        const startColor = parseColor(this.originalColor || 'transparent');
        const endColor = parseColor(color);
        const startOpacity = this.originalOpacity ?? 1;
        const resolvedTargetColor = COLOR_MAP[color?.toLowerCase()] || color;

        const colorData = {
            r: startColor.r,
            g: startColor.g,
            b: startColor.b,
            a: startOpacity
        };

        const element = this.shape.element;
        if (!element) {
            if (onComplete) onComplete();
            return;
        }

        TweenMax.to(colorData, duration, {
            r: endColor.r,
            g: endColor.g,
            b: endColor.b,
            a: opacity,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                element.style.backgroundColor = `rgba(${Math.round(colorData.r)}, ${Math.round(colorData.g)}, ${Math.round(colorData.b)}, ${colorData.a})`;
            },
            onComplete: () => {
                this.setColor(resolvedTargetColor, opacity);
                if (onComplete) onComplete();
            }
        });
    }
}

/**
 * Adapter for TableRow fill (background color for all cells)
 */
class TableRowFillAdapter extends BaseFillAdapter {
    /**
     * Get all cells in the row
     * @returns {TableCell[]}
     */
    _getAllCells() {
        return this.shape.getAllCells ? this.shape.getAllCells() : [];
    }

    captureOriginal() {
        const cells = this._getAllCells();
        if (cells.length > 0 && cells[0].element) {
            const computed = window.getComputedStyle(cells[0].element);
            this.originalColor = computed.backgroundColor || 'transparent';
            const match = this.originalColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (match) {
                this.originalColor = rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
                this.originalOpacity = match[4] !== undefined ? parseFloat(match[4]) : 1;
            } else {
                this.originalOpacity = 1;
            }
        } else {
            this.originalColor = 'transparent';
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
        const cells = this._getAllCells();

        cells.forEach(cell => {
            const element = cell.element;
            if (element) {
                if (opacity < 1) {
                    const parsed = parseColor(resolvedColor);
                    element.style.backgroundColor = `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${opacity})`;
                } else {
                    element.style.backgroundColor = resolvedColor;
                }
            }
        });
    }

    animateColor(color, opacity, duration, onComplete) {
        const startColor = parseColor(this.originalColor || 'transparent');
        const endColor = parseColor(color);
        const startOpacity = this.originalOpacity ?? 1;
        const resolvedTargetColor = COLOR_MAP[color?.toLowerCase()] || color;

        const colorData = {
            r: startColor.r,
            g: startColor.g,
            b: startColor.b,
            a: startOpacity
        };

        const cells = this._getAllCells();
        if (cells.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        TweenMax.to(colorData, duration, {
            r: endColor.r,
            g: endColor.g,
            b: endColor.b,
            a: opacity,
            ease: 'Power2.easeInOut',
            onUpdate: () => {
                cells.forEach(cell => {
                    if (cell.element) {
                        cell.element.style.backgroundColor = `rgba(${Math.round(colorData.r)}, ${Math.round(colorData.g)}, ${Math.round(colorData.b)}, ${colorData.a})`;
                    }
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
 * Null adapter for unsupported shapes (MathText, TextItem, unknown)
 */
class NullFillAdapter extends BaseFillAdapter {
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
