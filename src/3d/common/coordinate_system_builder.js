/**
 * coordinate_system_builder.js
 * Shared coordinate system creation logic for LHS and RHS
 */

import * as THREE from 'three';

/**
 * Calculate label scaling factors based on viewSize
 * @param {number} viewSize - The view size
 * @returns {Object} Scaling factors for labels
 */
export function calculateLabelScaling(viewSize = 15) {
    const scaleFactor = Math.sqrt(viewSize / 15);
    return {
        axisLabelFontSize: Math.round(48 * scaleFactor),
        axisLabelScale: 0.05 * scaleFactor,
        tickLabelFontSize: Math.round(28 * scaleFactor),
        tickLabelScale: 0.035 * scaleFactor
    };
}

/**
 * Create coordinate axes (X, Y, Z lines)
 * @param {Function} lineFn - Line creation function
 * @param {Object} options - Options
 * @returns {Array} Array of axis line meshes
 */
export function createAxes(lineFn, options = {}) {
    const {
        range = 10,
        color = 0x000000,
        radius = 0.03,
        opacity = 0.7
    } = options;

    const axes = [];

    // X-axis
    axes.push(lineFn(
        { x: -range, y: 0, z: 0 },
        { x: range, y: 0, z: 0 },
        { color, radius, opacity }
    ));

    // Y-axis
    axes.push(lineFn(
        { x: 0, y: -range, z: 0 },
        { x: 0, y: range, z: 0 },
        { color, radius, opacity }
    ));

    // Z-axis
    axes.push(lineFn(
        { x: 0, y: 0, z: -range },
        { x: 0, y: 0, z: range },
        { color, radius, opacity }
    ));

    return axes;
}

/**
 * Create grid lines on XY plane (z=0)
 * @param {Function} thinLineFn - Thin line creation function
 * @param {Object} options - Options
 * @returns {Array} Array of grid line objects
 */
export function createGrid(thinLineFn, options = {}) {
    const {
        range = 10,
        tickStep = 2,
        color = 0x888888,
        opacity = 0.5
    } = options;

    const gridLines = [];

    // Lines parallel to X-axis
    for (let y = -range; y <= range; y += tickStep) {
        if (y !== 0) {
            gridLines.push(thinLineFn(
                { x: -range, y: y, z: 0 },
                { x: range, y: y, z: 0 },
                { color, linewidth: 1, opacity }
            ));
        }
    }

    // Lines parallel to Y-axis
    for (let x = -range; x <= range; x += tickStep) {
        if (x !== 0) {
            gridLines.push(thinLineFn(
                { x: x, y: -range, z: 0 },
                { x: x, y: range, z: 0 },
                { color, linewidth: 1, opacity }
            ));
        }
    }

    return gridLines;
}

/**
 * Create tick marks on all axes
 * @param {Function} lineFn - Line creation function
 * @param {Object} options - Options
 * @returns {Array} Array of tick mark meshes
 */
export function createTickMarks(lineFn, options = {}) {
    const {
        range = 10,
        tickStep = 2,
        color = 0x000000,
        radius = 0.018  // 60% of axis thickness (0.03)
    } = options;

    const ticks = [];
    const tickSize = 0.1;

    for (let i = -range; i <= range; i += tickStep) {
        if (i === 0) continue;

        // X-axis ticks
        ticks.push(lineFn(
            { x: i, y: -tickSize, z: 0 },
            { x: i, y: tickSize, z: 0 },
            { color, radius, opacity: 0.7 }
        ));

        // Y-axis ticks
        ticks.push(lineFn(
            { x: -tickSize, y: i, z: 0 },
            { x: tickSize, y: i, z: 0 },
            { color, radius, opacity: 0.7 }
        ));

        // Z-axis ticks
        ticks.push(lineFn(
            { x: -tickSize, y: 0, z: i },
            { x: tickSize, y: 0, z: i },
            { color, radius, opacity: 0.7 }
        ));
    }

    return ticks;
}

/**
 * Create tick labels on all axes
 * @param {Function} labelFn - Label creation function
 * @param {Object} options - Options
 * @returns {Array} Array of label objects
 */
export function createTickLabels(labelFn, options = {}) {
    const {
        range = 10,
        tickStep = 2,
        fontSize = 20,
        scale = 0.025,
        color = '#000000',
        smartLabels = true
    } = options;

    const labels = [];
    const offset = 0.3;

    for (let i = -range; i <= range; i += tickStep) {
        if (i === 0) continue;

        // X-axis tick label
        const xLabel = labelFn(i.toString(), { x: i, y: -offset, z: -offset }, {
            fontSize, scale, color, depthTest: !smartLabels
        });
        if (xLabel) {
            if (smartLabels && xLabel.material) {
                xLabel.material.depthTest = false;
                xLabel.material.depthWrite = false;
            }
            labels.push(xLabel);
        }

        // Y-axis tick label
        const yLabel = labelFn(i.toString(), { x: -offset, y: i, z: -offset }, {
            fontSize, scale, color, depthTest: !smartLabels
        });
        if (yLabel) {
            if (smartLabels && yLabel.material) {
                yLabel.material.depthTest = false;
                yLabel.material.depthWrite = false;
            }
            labels.push(yLabel);
        }

        // Z-axis tick label
        const zLabel = labelFn(i.toString(), { x: -offset, y: -offset, z: i }, {
            fontSize, scale, color, depthTest: !smartLabels
        });
        if (zLabel) {
            if (smartLabels && zLabel.material) {
                zLabel.material.depthTest = false;
                zLabel.material.depthWrite = false;
            }
            labels.push(zLabel);
        }
    }

    return labels;
}

/**
 * Create axis labels (X, Y, Z)
 * @param {Function} labelFn - Label creation function
 * @param {Object} options - Options
 * @returns {Array} Array of axis label objects
 */
export function createAxisLabels(labelFn, options = {}) {
    const {
        range = 10,
        fontSize = 36,
        scale = 0.04,
        color = '#000000',
        smartLabels = true
    } = options;

    const labels = [];
    const offset = 0.5;

    const axisNames = [
        { name: 'X', pos: { x: range + offset, y: 0, z: 0 } },
        { name: 'Y', pos: { x: 0, y: range + offset, z: 0 } },
        { name: 'Z', pos: { x: 0, y: 0, z: range + offset } }
    ];

    for (const axis of axisNames) {
        const lbl = labelFn(axis.name, axis.pos, {
            fontSize, scale, color, fontWeight: 'bold', depthTest: !smartLabels
        });
        if (lbl) {
            if (smartLabels && lbl.material) {
                lbl.material.depthTest = false;
                lbl.material.depthWrite = false;
            }
            labels.push(lbl);
        }
    }

    return labels;
}

/**
 * Create origin point
 * @param {Function} pointFn - Point creation function
 * @param {Object} options - Options
 * @returns {THREE.Mesh} Origin point mesh
 */
export function createOriginPoint(pointFn, options = {}) {
    const { color = 0x000000, radius = 0.05 } = options;
    return pointFn({ x: 0, y: 0, z: 0 }, { color, radius });
}

/**
 * Set up standard Phong lighting
 * @param {THREE.Scene} scene - The scene
 */
export function setupPhongLighting(scene) {
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(5, 10, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xaaaaaa, 0.4);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 0.6);
    rimLight.position.set(0, 15, -10);
    scene.add(rimLight);
}

/**
 * Set up basic lighting
 * @param {THREE.Scene} scene - The scene
 */
export function setupBasicLighting(scene) {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 0.4);
    directional.position.set(5, 10, 5);
    scene.add(directional);
}

/**
 * Remove existing lights from scene
 * @param {THREE.Scene} scene - The scene
 */
export function clearLights(scene) {
    const lights = scene.children.filter(child => child.isLight);
    lights.forEach(light => scene.remove(light));
}
