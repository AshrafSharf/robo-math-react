/**
 * Grapher3DFactory - Static factory for creating Grapher3D instances
 */

import { Grapher3D } from '../blocks/grapher3d.js';

export class Grapher3DFactory {
    /**
     * Create a 3D graph container using logical coordinate bounds
     * @param {Object} layoutMapper - Logical coordinate mapper
     * @param {HTMLElement} canvasSection - Parent DOM element
     * @param {number} row1 - Start row (top)
     * @param {number} col1 - Start column (left)
     * @param {number} row2 - End row (bottom)
     * @param {number} col2 - End column (right)
     * @param {Object} options - Graph options {showGrid, xRange, yRange, zRange, coordinateSystem}
     * @returns {Grapher3D}
     */
    static create(layoutMapper, canvasSection, row1, col1, row2, col2, options = {}) {
        // Convert logical coordinates to pixel coordinates
        const pixelCoords = layoutMapper.toPixel(row1, col1);

        // Calculate dimensions from logical bounds
        const unitSize = layoutMapper.getLogicalUnitSize();
        const width = (col2 - col1) * unitSize.col;
        const height = (row2 - row1) * unitSize.row;

        // Create container div at position
        const containerDOM = document.createElement('div');
        containerDOM.id = `graph3d-container-${row1}-${col1}-${row2}-${col2}`;
        containerDOM.style.position = 'absolute';
        containerDOM.style.left = pixelCoords.x + 'px';
        containerDOM.style.top = pixelCoords.y + 'px';
        containerDOM.style.width = width + 'px';
        containerDOM.style.height = height + 'px';
        canvasSection.appendChild(containerDOM);

        // Create Grapher3D instance
        const grapher = new Grapher3D(containerDOM, {
            width: width,
            height: height,
            showGrid: options.showGrid !== false,
            xRange: options.xRange || [-10, 10],
            yRange: options.yRange || [-10, 10],
            zRange: options.zRange || [-10, 10],
            coordinateSystem: options.coordinateSystem || 'lhs'
        });

        return grapher;
    }
}
