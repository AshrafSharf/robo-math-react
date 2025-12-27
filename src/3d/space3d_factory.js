/**
 * Space3DFactory - Static factory for creating Space3D instances
 */

import { Space3D } from '../blocks/space3d.js';

export class Space3DFactory {
    /**
     * Create a Space3D container using logical coordinate bounds
     * @param {Object} layoutMapper - Logical coordinate mapper
     * @param {HTMLElement} canvasSection - Parent DOM element
     * @param {number} row1 - Start row (top)
     * @param {number} col1 - Start column (left)
     * @param {number} row2 - End row (bottom)
     * @param {number} col2 - End column (right)
     * @returns {Space3D}
     */
    static create(layoutMapper, canvasSection, row1, col1, row2, col2) {
        // Convert logical coordinates to pixel coordinates
        const pixelCoords = layoutMapper.toPixel(row1, col1);

        // Calculate dimensions from logical bounds
        const unitSize = layoutMapper.getLogicalUnitSize();
        const width = (col2 - col1) * unitSize.col;
        const height = (row2 - row1) * unitSize.row;

        // Create container div at position
        const containerDOM = document.createElement('div');
        containerDOM.id = `space3d-container-${row1}-${col1}-${row2}-${col2}`;
        containerDOM.style.position = 'absolute';
        containerDOM.style.left = pixelCoords.x + 'px';
        containerDOM.style.top = pixelCoords.y + 'px';
        containerDOM.style.width = width + 'px';
        containerDOM.style.height = height + 'px';
        canvasSection.appendChild(containerDOM);

        // Create Space3D instance
        const space3d = new Space3D(containerDOM, {
            width: width,
            height: height
        });

        return space3d;
    }
}
