/**
 * coordinate_system.js
 * Complete coordinate system with axes, grid, labels, camera setup, and lighting
 * Uses native Three.js coordinates (x right, y up, z towards)
 */

import * as THREE from 'three';
import { line, thinLine } from './line.js';
import { label } from './label.js';
import { point } from './point.js';

/**
 * Sets up a complete 3D coordinate system with axes, camera, lighting
 * @param {THREE.Scene} scene - The Three.js scene to set up
 * @param {Object} options - Configuration options
 */
export async function setupCoordinateSystem(scene, options = {}) {
    const {
        // Camera options
        cameraPosition = { x: 15, y: 12, z: 15 },
        cameraTarget = { x: 0, y: 0, z: 0 },
        viewSize = 15,
        
        // Axes options
        showAxes = true,
        axesRange = 10,
        axesTickStep = 2,
        showGrid = true,
        showAxisLabels = true,
        
        // Interaction options
        enableInteraction = true,
        
        // Lighting options
        lightingProfile = 'phong',
        customLighting = null
    } = options;
    
    // Get renderer from scene.userData
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
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        controls = new OrbitControls(camera, renderer.domElement);
        scene.userData.controls = controls;
    }
    
    // Create coordinate axes
    if (showAxes) {
        coordinateSystem(scene, {
            range: axesRange,
            tickStep: axesTickStep,
            showGrid: showGrid,
            showLabels: showAxisLabels,
            showTicks: true,
            viewSize: viewSize,  // Pass viewSize for label scaling
            smartLabels: true
        });
    }
    
    // Set up camera position
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
    setupLighting(scene, lightingProfile, customLighting);
}

/**
 * Creates coordinate axes with ticks and labels
 */
export function coordinateSystem(scene, options = {}) {
    const {
        range = 10,
        viewSize = 15,  // Default viewSize for label scaling
        tickStep = 1,
        showGrid = true,
        showLabels = true,
        showTicks = true,
        smartLabels = false,
        axisColors = {
            x: 0xff0000,
            y: 0x00ff00,
            z: 0x0000ff
        },
        gridColor = 0xcccccc,
        labelColor = '#000000'
    } = options;
    
    // Calculate label scaling based on viewSize
    // Square root scaling for balanced sizing
    // This gives us: viewSize=5 → scale=0.58, viewSize=15 → scale=1.0, viewSize=30 → scale=1.41
    const labelScaleFactor = Math.sqrt(viewSize / 15);
    const axisLabelFontSize = Math.round(36 * labelScaleFactor);
    const axisLabelScale = 0.04 * labelScaleFactor;
    const tickLabelFontSize = Math.round(20 * labelScaleFactor);
    const tickLabelScale = 0.025 * labelScaleFactor;
    
    const axesGroup = new THREE.Group();
    axesGroup.name = 'CoordinateSystem';
    
    // Create label group for smart visibility
    const labelGroup = new THREE.Group();
    labelGroup.name = 'AxisLabels';
    if (smartLabels) {
        labelGroup.renderOrder = 999;
    }
    
    // X-axis (right)
    const xAxis = line(
        { x: -range, y: 0, z: 0 },
        { x: range, y: 0, z: 0 },
        { color: axisColors.x, radius: 0.03 }
    );
    axesGroup.add(xAxis);
    
    // Y-axis (up)
    const yAxis = line(
        { x: 0, y: -range, z: 0 },
        { x: 0, y: range, z: 0 },
        { color: axisColors.y, radius: 0.03 }
    );
    axesGroup.add(yAxis);
    
    // Z-axis (towards)
    const zAxis = line(
        { x: 0, y: 0, z: -range },
        { x: 0, y: 0, z: range },
        { color: axisColors.z, radius: 0.03 }
    );
    axesGroup.add(zAxis);
    
    // Add axis labels
    if (showLabels) {
        const xLabel = label('X', { x: range + 0.5, y: 0, z: 0 }, {
            color: labelColor,
            fontSize: axisLabelFontSize,
            scale: axisLabelScale,
            depthTest: !smartLabels
        });
        if (xLabel) labelGroup.add(xLabel);
        
        const yLabel = label('Y', { x: 0, y: range + 0.5, z: 0 }, {
            color: labelColor,
            fontSize: axisLabelFontSize,
            scale: axisLabelScale,
            depthTest: !smartLabels
        });
        if (yLabel) labelGroup.add(yLabel);
        
        const zLabel = label('Z', { x: 0, y: 0, z: range + 0.5 }, {
            color: labelColor,
            fontSize: axisLabelFontSize,
            scale: axisLabelScale,
            depthTest: !smartLabels
        });
        if (zLabel) labelGroup.add(zLabel);
    }
    
    // Add tick marks and labels
    if (showTicks) {
        // Calculate starting point to ensure we hit even multiples of tickStep
        const start = Math.ceil(-range / tickStep) * tickStep;
        
        for (let i = start; i <= range; i += tickStep) {
            if (i === 0) continue;
            
            // X-axis ticks
            const xTick = thinLine(
                { x: i, y: -0.2, z: 0 },
                { x: i, y: 0.2, z: 0 },
                { color: 0x666666 }
            );
            axesGroup.add(xTick);
            
            if (showLabels) {
                const xTickLabel = label(i.toString(), { x: i, y: -0.5, z: 0 }, {
                    color: labelColor,
                    fontSize: tickLabelFontSize,
                    scale: tickLabelScale,
                    depthTest: !smartLabels
                });
                if (xTickLabel) labelGroup.add(xTickLabel);
            }
            
            // Y-axis ticks
            const yTick = thinLine(
                { x: -0.2, y: i, z: 0 },
                { x: 0.2, y: i, z: 0 },
                { color: 0x666666 }
            );
            axesGroup.add(yTick);
            
            if (showLabels) {
                const yTickLabel = label(i.toString(), { x: -0.5, y: i, z: 0 }, {
                    color: labelColor,
                    fontSize: tickLabelFontSize,
                    scale: tickLabelScale,
                    depthTest: !smartLabels
                });
                if (yTickLabel) labelGroup.add(yTickLabel);
            }
            
            // Z-axis ticks
            const zTick = thinLine(
                { x: 0, y: -0.2, z: i },
                { x: 0, y: 0.2, z: i },
                { color: 0x666666 }
            );
            axesGroup.add(zTick);
            
            if (showLabels) {
                const zTickLabel = label(i.toString(), { x: 0, y: -0.5, z: i }, {
                    color: labelColor,
                    fontSize: tickLabelFontSize,
                    scale: tickLabelScale,
                    depthTest: !smartLabels
                });
                if (zTickLabel) labelGroup.add(zTickLabel);
            }
        }
    }
    
    // Add grid on XZ plane (Y=0)
    if (showGrid) {
        const gridHelper = new THREE.GridHelper(range * 2, range * 2 / tickStep, gridColor, gridColor);
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        axesGroup.add(gridHelper);
    }
    
    scene.add(axesGroup);
    scene.add(labelGroup);
    
    return { axesGroup, labelGroup };
}

/**
 * Sets up lighting for the scene
 */
function setupLighting(scene, profile = 'phong', customLighting = null) {
    // Remove existing lights
    const existingLights = scene.children.filter(child => child.isLight);
    existingLights.forEach(light => scene.remove(light));
    
    if (customLighting) {
        customLighting(scene);
        return;
    }
    
    switch (profile) {
        case 'basic':
            const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
            scene.add(ambientLight);
            break;
            
        case 'phong':
            const ambient = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambient);
            
            const directional1 = new THREE.DirectionalLight(0xffffff, 0.8);
            directional1.position.set(10, 20, 10);
            scene.add(directional1);
            
            const directional2 = new THREE.DirectionalLight(0xffffff, 0.4);
            directional2.position.set(-10, 10, -10);
            scene.add(directional2);
            
            const point = new THREE.PointLight(0xffffff, 0.5, 100);
            point.position.set(0, 10, 0);
            scene.add(point);
            break;
    }
}