/**
 * MathTextPositionUtil - Utilities for positioning MathTextComponents
 *
 * @example Getting top-left position (TextItemMoveToCommand)
 * const canvasBounds = textItem.getCanvasBounds();
 * const position = MathTextPositionUtil.getTopLeft(canvasBounds);
 * // position = { x, y }
 *
 * @example Positioning a new component centered on a target (ReplaceTextItemCommand)
 * const targetBounds = textItem.getCanvasBounds();
 * const sourceBounds = MathTextPositionUtil.getPathBoundsInContainer(mathComponent.containerDOM);
 * const position = MathTextPositionUtil.centerAlignPosition(targetBounds, sourceBounds);
 * mathComponent.setCanvasPosition(position.x, position.y);
 *
 * @example Positioning annotation above target (TopWriteCommand)
 * const targetBounds = textItem.getCanvasBounds();
 * const sourceBounds = MathTextPositionUtil.getPathBoundsInContainer(mathComponent.containerDOM);
 * const position = MathTextPositionUtil.topAlignPosition(targetBounds, sourceBounds, buffer);
 * mathComponent.setCanvasPosition(position.x, position.y);
 */
export class MathTextPositionUtil {
    /**
     * Get the bounds of paths within a container element.
     * Returns offsetX, offsetY (from container top-left), width, height.
     * Temporarily shows the component if hidden since display:none returns zero bounds.
     * @param {HTMLElement} container - The container DOM element
     * @returns {{offsetX: number, offsetY: number, width: number, height: number}}
     */
    static getPathBoundsInContainer(container) {
        const wasHidden = container.style.display === 'none';

        if (wasHidden) {
            container.style.display = 'block';
        }

        const containerRect = container.getBoundingClientRect();
        const paths = container.querySelectorAll('path');

        let bounds = { offsetX: 0, offsetY: 0, width: 0, height: 0 };

        if (paths.length > 0) {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            paths.forEach(path => {
                const pathRect = path.getBoundingClientRect();
                if (pathRect.width > 0 && pathRect.height > 0) {
                    minX = Math.min(minX, pathRect.left);
                    minY = Math.min(minY, pathRect.top);
                    maxX = Math.max(maxX, pathRect.right);
                    maxY = Math.max(maxY, pathRect.bottom);
                }
            });

            if (minX !== Infinity) {
                bounds = {
                    offsetX: minX - containerRect.left,
                    offsetY: minY - containerRect.top,
                    width: maxX - minX,
                    height: maxY - minY
                };
            }
        }

        if (wasHidden) {
            container.style.display = 'none';
        }

        return bounds;
    }

    /**
     * Get the center point of a bounds object.
     * @param {{x: number, y: number, width: number, height: number}} bounds
     * @returns {{x: number, y: number}}
     */
    static getCenter(bounds) {
        return {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2
        };
    }

    /**
     * Calculate position to center-align a source element on a target bounds.
     * @param {{x: number, y: number, width: number, height: number}} targetBounds - Target canvas bounds
     * @param {{offsetX: number, offsetY: number, width: number, height: number}} sourceBounds - Source path bounds
     * @returns {{x: number, y: number}} - Position for setCanvasPosition
     */
    static centerAlignPosition(targetBounds, sourceBounds) {
        const targetCenter = this.getCenter(targetBounds);
        return {
            x: targetCenter.x - sourceBounds.offsetX - sourceBounds.width / 2,
            y: targetCenter.y - sourceBounds.offsetY - sourceBounds.height / 2
        };
    }

    /**
     * Calculate position to align source ABOVE target (for overbrace annotations).
     * Source bottom edge aligns with target top edge, horizontally centered.
     * @param {Bounds2} targetBounds - Target canvas bounds (from textItem.getCanvasBounds())
     * @param {{offsetX: number, offsetY: number, width: number, height: number}} sourceBounds - Source path bounds
     * @param {number} buffer - Additional vertical spacing (default 0)
     * @returns {{x: number, y: number}} - Position for setCanvasPosition
     */
    static topAlignPosition(targetBounds, sourceBounds, buffer = 0) {
        // Horizontally: center source over target
        const targetCenterX = targetBounds.centerX;
        const x = targetCenterX - sourceBounds.offsetX - sourceBounds.width / 2;

        // Vertically: source bottom aligns with target top
        const y = targetBounds.minY - sourceBounds.offsetY - sourceBounds.height - buffer;

        return { x, y };
    }

    /**
     * Calculate position to align source BELOW target (for underbrace annotations).
     * Source top edge aligns with target bottom edge, horizontally centered.
     * @param {Bounds2} targetBounds - Target canvas bounds (from textItem.getCanvasBounds())
     * @param {{offsetX: number, offsetY: number, width: number, height: number}} sourceBounds - Source path bounds
     * @param {number} buffer - Additional vertical spacing (default 0)
     * @returns {{x: number, y: number}} - Position for setCanvasPosition
     */
    static bottomAlignPosition(targetBounds, sourceBounds, buffer = 0) {
        // Horizontally: center source over target
        const targetCenterX = targetBounds.centerX;
        const x = targetCenterX - sourceBounds.offsetX - sourceBounds.width / 2;

        // Vertically: source top aligns with target bottom
        const y = targetBounds.maxY - sourceBounds.offsetY + buffer;

        return { x, y };
    }

    /**
     * Calculate position to overlay cancel on target TextItem.
     * Uses target bounds directly - phantom is sized to match target.
     * @param {Bounds2} targetBounds - Target canvas bounds (from textItem.getCanvasBounds())
     * @returns {{x: number, y: number}} - Position for setCanvasPosition
     */
    static overlayAlignPosition(targetBounds) {
        // Position at target's top-left
        return { x: targetBounds.minX, y: targetBounds.minY };
    }

    // ===== BOUNDS EXTRACTION METHODS =====

    /**
     * Get the top-left corner position from bounds.
     *
     * @param {Bounds2} bounds - Bounds2 object
     * @returns {{x: number, y: number}}
     *
     * @example TextItemMoveToCommand - move to another TextItem's position
     * const targetBounds = targetItem.getCanvasBounds();
     * const position = MathTextPositionUtil.getTopLeft(targetBounds);
     * // Use position.x, position.y as move target
     */
    static getTopLeft(bounds) {
        if (!bounds) return null;
        return {
            x: bounds.x ?? bounds.minX,
            y: bounds.y ?? bounds.minY
        };
    }

    /**
     * Get the bottom-right corner position from bounds.
     *
     * @param {Bounds2} bounds - Bounds2 object
     * @returns {{x: number, y: number}}
     */
    static getBottomRight(bounds) {
        if (!bounds) return null;
        return {
            x: (bounds.x ?? bounds.minX) + bounds.width,
            y: (bounds.y ?? bounds.minY) + bounds.height
        };
    }

    /**
     * Center a container horizontally by adjusting its left position.
     * Useful for centering labels on a midpoint.
     * @param {HTMLElement} container - The container DOM element
     */
    static centerHorizontally(container) {
        if (!container) return;

        const bounds = this.getPathBoundsInContainer(container);
        if (bounds.width > 0) {
            const currentLeft = parseFloat(container.style.left) || 0;
            container.style.left = (currentLeft - bounds.width / 2) + 'px';
        }
    }
}
