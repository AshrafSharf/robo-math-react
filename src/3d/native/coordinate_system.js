/**
 * coordinate_system.js
 * RHS coordinate system - uses shared builder with native Three.js shape functions
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { line, thinLine } from './line.js';
import { label } from './label.js';
import { point } from './point.js';
import {
    calculateLabelScaling,
    createAxes,
    createGrid,
    createTickMarks,
    createTickLabels,
    createAxisLabels,
    createOriginPoint,
    setupPhongLighting,
    setupBasicLighting,
    clearLights
} from '../common/coordinate_system_builder.js';

/**
 * Sets up a complete 3D coordinate system with axes, camera, lighting
 * @param {THREE.Scene} scene - The Three.js scene to set up
 * @param {Object} options - Configuration options
 */
export function setupCoordinateSystem(scene, options = {}) {
    const {
        cameraPosition = { x: 15, y: 12, z: 15 },
        cameraTarget = { x: 0, y: 0, z: 0 },
        viewSize = 15,
        showAxes = true,
        axesRange = 10,
        axesTickStep = 2,
        showGrid = true,
        showAxisLabels = true,
        enableInteraction = true,
        lightingProfile = 'phong',
        customLighting = null
    } = options;

    const renderer = scene.userData?.renderer;
    if (!renderer) {
        throw new Error('Renderer must be provided in scene.userData.renderer');
    }

    // Create OrthographicCamera
    let camera = scene.userData?.camera;
    const container = renderer.domElement.parentElement;
    const aspect = container.clientWidth / container.clientHeight;

    if (!camera) {
        camera = new THREE.OrthographicCamera(
            -viewSize * aspect / 2,
            viewSize * aspect / 2,
            viewSize / 2,
            -viewSize / 2,
            0.1,
            1000
        );
        scene.userData.camera = camera;
    } else if (camera.isOrthographicCamera) {
        camera.left = -viewSize * aspect / 2;
        camera.right = viewSize * aspect / 2;
        camera.top = viewSize / 2;
        camera.bottom = -viewSize / 2;
        camera.updateProjectionMatrix();
    }

    // Create OrbitControls
    let controls = scene.userData?.controls;
    if (!controls && enableInteraction) {
        controls = new OrbitControls(camera, renderer.domElement);
        scene.userData.controls = controls;
    }

    // Create coordinate system
    if (showAxes) {
        coordinateSystem(scene, {
            range: axesRange,
            viewSize: viewSize,
            tickStep: axesTickStep,
            showGrid: showGrid,
            showLabels: showAxisLabels,
            showTicks: true,
            smartLabels: true
        });
    }

    // Set up camera
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    camera.lookAt(cameraTarget.x, cameraTarget.y, cameraTarget.z);

    // Configure controls
    if (controls && enableInteraction) {
        controls.target.set(cameraTarget.x, cameraTarget.y, cameraTarget.z);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };
        controls.update();
    }

    // Set up lighting
    clearLights(scene);
    if (customLighting) {
        customLighting(scene);
    } else if (lightingProfile === 'phong') {
        setupPhongLighting(scene);
    } else {
        setupBasicLighting(scene);
    }
}

/**
 * Creates coordinate axes with ticks and labels
 */
export function coordinateSystem(scene, options = {}) {
    const {
        range = 10,
        viewSize = 15,
        tickStep = 2,
        showGrid = true,
        showLabels = true,
        showTicks = true,
        axisColor = 0x000000,
        gridColor = 0x888888,
        labelColor = '#000000',
        smartLabels = true
    } = options;

    const scaling = calculateLabelScaling(viewSize);

    const axesGroup = new THREE.Group();
    axesGroup.name = 'CoordinateSystem';

    const labelGroup = new THREE.Group();
    labelGroup.name = 'AxisLabels';
    if (smartLabels) {
        labelGroup.renderOrder = 999;
    }

    // Add axes
    const axes = createAxes(line, { range, color: axisColor });
    axes.forEach(axis => axesGroup.add(axis));

    // Add grid
    if (showGrid) {
        const gridLines = createGrid(thinLine, { range, tickStep, color: gridColor });
        gridLines.forEach(gridLine => axesGroup.add(gridLine));
    }

    // Add tick marks
    if (showTicks) {
        const ticks = createTickMarks(line, { range, tickStep, color: axisColor });
        ticks.forEach(tick => axesGroup.add(tick));

        // Add tick labels
        if (showLabels) {
            const tickLabels = createTickLabels(label, {
                range,
                tickStep,
                fontSize: scaling.tickLabelFontSize,
                scale: scaling.tickLabelScale,
                color: labelColor,
                smartLabels
            });
            tickLabels.forEach(lbl => labelGroup.add(lbl));
        }
    }

    // Add axis labels
    if (showLabels) {
        const axisLabels = createAxisLabels(label, {
            range,
            fontSize: scaling.axisLabelFontSize,
            scale: scaling.axisLabelScale,
            color: labelColor,
            smartLabels
        });
        axisLabels.forEach(lbl => labelGroup.add(lbl));
    }

    // Add origin point
    axesGroup.add(createOriginPoint(point, { color: axisColor }));

    scene.add(axesGroup);
    scene.add(labelGroup);

    return { axesGroup, labelGroup };
}
