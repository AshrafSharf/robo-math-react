/**
 * TableCellAdapter - Provides unified interface for table cells
 *
 * Hides whether the cell is a KatexComponent or MathTextComponent
 * from consumers like item(), visibility operations, and bounds retrieval.
 */
import { Bounds2 } from '../../geom/Bounds2.js';
import { TweenMax } from 'gsap';

/**
 * Factory to create appropriate adapter for a table cell
 */
export class TableCellAdapter {
    /**
     * Create an adapter for the given cell
     * @param {Object} cell - Cell object with component and wrapper
     * @param {string} cellType - 'katex' or 'mathtext'
     * @returns {KatexCellAdapter|MathTextCellAdapter}
     */
    static for(cell, cellType) {
        if (cellType === 'katex') {
            return new KatexCellAdapter(cell);
        }
        return new MathTextCellAdapter(cell);
    }
}

/**
 * Base adapter with common interface
 */
class BaseCellAdapter {
    constructor(cell) {
        this.cell = cell;
        this.isTableCellAdapter = true;  // Marker for type detection
        this.isTableCell = true;  // For ShapeVisibilityAdapter
    }

    /**
     * Get the underlying component
     */
    getComponent() {
        return this.cell.component;
    }

    /**
     * Get the cell wrapper element
     */
    getWrapper() {
        return this.cell.wrapper;
    }

    /**
     * Get row index
     */
    getRow() {
        return this.cell.row;
    }

    /**
     * Get column index
     */
    getCol() {
        return this.cell.col;
    }

    /**
     * Show the cell
     */
    show() {
        throw new Error('BaseCellAdapter.show() must be implemented');
    }

    /**
     * Hide the cell
     */
    hide() {
        throw new Error('BaseCellAdapter.hide() must be implemented');
    }

    /**
     * Get the DOM element
     */
    get element() {
        return this.cell.wrapper;
    }

    /**
     * Get SVG paths (for visibility adapter compatibility)
     */
    getSVGPaths() {
        return [];
    }

    /**
     * Get canvas bounds
     */
    getCanvasBounds() {
        const wrapper = this.cell.wrapper;
        if (!wrapper) return Bounds2.NOTHING;

        const rect = wrapper.getBoundingClientRect();
        // Get parent canvas section position
        const parent = wrapper.closest('.robo-table');
        if (parent) {
            const parentRect = parent.getBoundingClientRect();
            const canvasSection = parent.parentNode;
            if (canvasSection) {
                const canvasRect = canvasSection.getBoundingClientRect();
                return Bounds2.rect(
                    rect.left - canvasRect.left,
                    rect.top - canvasRect.top,
                    rect.width,
                    rect.height
                );
            }
        }

        return Bounds2.rect(rect.left, rect.top, rect.width, rect.height);
    }
}

/**
 * Adapter for KatexComponent cells
 */
class KatexCellAdapter extends BaseCellAdapter {
    show() {
        if (this.cell.component) {
            this.cell.component.show();
        }
    }

    hide() {
        if (this.cell.component) {
            this.cell.component.hide();
        }
    }

    /**
     * Fade in animation
     */
    fadeIn(duration = 0.5, onComplete) {
        const wrapper = this.cell.wrapper;
        if (!wrapper) {
            if (onComplete) onComplete();
            return;
        }

        this.show();
        wrapper.style.opacity = '0';

        TweenMax.to(wrapper, duration, {
            opacity: 1,
            onComplete: () => {
                if (onComplete) onComplete();
            }
        });
    }

    /**
     * Fade out animation
     */
    fadeOut(duration = 0.5, onComplete) {
        const wrapper = this.cell.wrapper;
        if (!wrapper) {
            if (onComplete) onComplete();
            return;
        }

        TweenMax.to(wrapper, duration, {
            opacity: 0,
            onComplete: () => {
                this.hide();
                if (onComplete) onComplete();
            }
        });
    }
}

/**
 * Adapter for MathTextComponent cells
 */
class MathTextCellAdapter extends BaseCellAdapter {
    show() {
        if (this.cell.component) {
            this.cell.component.show();
            this.cell.component.enableStroke();
        }
    }

    hide() {
        if (this.cell.component) {
            this.cell.component.hide();
            this.cell.component.disableStroke();
        }
    }

    /**
     * Get SVG paths from MathTextComponent
     */
    getSVGPaths() {
        if (this.cell.component && typeof this.cell.component.getSVGPaths === 'function') {
            return this.cell.component.getSVGPaths();
        }
        return [];
    }

    /**
     * Fade in animation
     */
    fadeIn(duration = 0.5, onComplete) {
        const component = this.cell.component;
        if (!component) {
            if (onComplete) onComplete();
            return;
        }

        // Show container and enable strokes
        component.show();
        component.enableStroke();

        // Animate opacity
        const container = component.containerDOM;
        if (container) {
            container.style.opacity = '0';
            TweenMax.to(container, duration, {
                opacity: 1,
                onComplete: () => {
                    if (onComplete) onComplete();
                }
            });
        } else {
            if (onComplete) onComplete();
        }
    }

    /**
     * Fade out animation
     */
    fadeOut(duration = 0.5, onComplete) {
        const component = this.cell.component;
        if (!component) {
            if (onComplete) onComplete();
            return;
        }

        const container = component.containerDOM;
        if (container) {
            TweenMax.to(container, duration, {
                opacity: 0,
                onComplete: () => {
                    this.hide();
                    if (onComplete) onComplete();
                }
            });
        } else {
            this.hide();
            if (onComplete) onComplete();
        }
    }

    /**
     * Get canvas bounds from MathTextComponent
     */
    getCanvasBounds() {
        const component = this.cell.component;
        if (component && typeof component.getCanvasBounds === 'function') {
            return component.getCanvasBounds();
        }
        return super.getCanvasBounds();
    }
}
