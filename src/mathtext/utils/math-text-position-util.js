/**
 * MathTextPositionUtil - Utilities for positioning MathTextComponents
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
}
