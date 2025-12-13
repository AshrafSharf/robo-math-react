/**
 * lhs_coordinate_system.js
 * Complete coordinate system with axes, grid, labels, camera setup, and lighting
 * All labels use smart visibility (always on top)
 */

import * as THREE from 'three';
import { line, thinLine } from './lhs_line.js';
import { label } from './lhs_label.js';
import { point } from './lhs_point.js';

/**
 * Sets up a complete 3D coordinate system with axes, camera, lighting, and optional interactivity
 * @param {THREE.Scene} scene - The Three.js scene to set up
 * @param {Object} options - Configuration options
 */
export async function setupCoordinateSystem(scene, options = {}) {
    const {
        // Camera options
        cameraPosition = { x: -15, y: 12, z: -15 },
        cameraTarget = { x: 0, y: 0, z: 0 },
        viewSize = 15,  // ViewSize for OrthographicCamera (default: 15)
        
        // Axes options
        showAxes = true,
        axesRange = 10,
        axesTickStep = 2,
        showGrid = true,
        showAxisLabels = true,
        
        // Interaction options
        enableInteraction = true,
        
        // Lighting options
        lightingProfile = 'phong',  // 'basic', 'phong', 'custom'
        customLighting = null  // Function to set up custom lighting
    } = options;
    
    // Get renderer from scene.userData (must be provided)
    const renderer = scene.userData?.renderer;
    if (!renderer) {
        throw new Error('Renderer must be provided in scene.userData.renderer');
    }
    
    // Create OrthographicCamera if not exists
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
        // Update existing camera's view bounds with new viewSize
        camera.left = -viewSize * aspect / 2;
        camera.right = viewSize * aspect / 2;
        camera.top = viewSize / 2;
        camera.bottom = -viewSize / 2;
        camera.updateProjectionMatrix();
    }
    
    // Create OrbitControls if not exists
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
            smartLabels: true  // Enable smart label visibility
        });
    }
    
    // Set up camera position and target
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    camera.lookAt(cameraTarget.x, cameraTarget.y, cameraTarget.z);
    
    // Configure controls if available and interaction is enabled
    if (controls && enableInteraction) {
        controls.target.set(cameraTarget.x, cameraTarget.y, cameraTarget.z);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        
        // Proper mouse button mapping
        controls.mouseButtons = {
            LEFT: 0,   // ROTATE
            MIDDLE: 1, // DOLLY (zoom)
            RIGHT: 2   // PAN
        };
        
        // Configure zoom behavior
        controls.enableZoom = true;
        controls.zoomSpeed = 1.0;
        controls.minDistance = 5;
        controls.maxDistance = 50;
        
        controls.update();
    } else if (controls && !enableInteraction) {
        // Disable controls if interaction is not wanted
        controls.enabled = false;
    }
    
    // Set up lighting based on profile
    setupLighting(scene, lightingProfile, customLighting);
    
    console.log(`3D coordinate system initialized with ${lightingProfile} lighting`);
}

/**
 * Creates a complete 3D coordinate system with axes, grid, and labels
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {Object} options - Configuration options
 * @returns {Object} Object containing coordGroup and labelGroup
 */
export function coordinateSystem(scene, options = {}) {
    const {
        range = 10,              // Axis range (symmetric)
        tickStep = 2,            // Spacing between ticks
        showGrid = true,         // Show XY plane grid
        showLabels = true,       // Show axis labels (X, Y, Z)
        showTicks = true,        // Show tick marks and numbers
        axisColor = 0x000000,    // Black axes
        gridColor = 0x888888,    // Medium gray grid (more visible)
        labelColor = '#000000',  // Black labels
        axisThickness = 0.015,   // Axis line radius (thinner for cleaner look)
        smartLabels = true       // Enable smart label visibility
    } = options;
    
    // Create a group for the entire coordinate system
    const coordGroup = new THREE.Group();
    coordGroup.name = 'CoordinateSystem';
    
    // Create a separate group for labels that render on top
    const labelGroup = new THREE.Group();
    labelGroup.name = 'CoordinateLabels';
    labelGroup.renderOrder = 999;  // Render labels last
    
    // Create main axes
    // X-axis (mathematical X)
    const xAxisLine = line(
        { x: -range, y: 0, z: 0 },
        { x: range, y: 0, z: 0 },
        {
            color: axisColor,
            radius: axisThickness,
            opacity: 0.7
        }
    );
    coordGroup.add(xAxisLine);
    
    // Y-axis (mathematical Y)
    const yAxisLine = line(
        { x: 0, y: -range, z: 0 },
        { x: 0, y: range, z: 0 },
        {
            color: axisColor,
            radius: axisThickness,
            opacity: 0.7
        }
    );
    coordGroup.add(yAxisLine);
    
    // Z-axis (mathematical Z)
    const zAxisLine = line(
        { x: 0, y: 0, z: -range },
        { x: 0, y: 0, z: range },
        {
            color: axisColor,
            radius: axisThickness,
            opacity: 0.7
        }
    );
    coordGroup.add(zAxisLine);
    
    // Create grid on XY plane if requested
    if (showGrid) {
        // Grid lines parallel to X-axis
        for (let y = -range; y <= range; y += tickStep) {
            if (y !== 0) {  // Skip the main axis
                const gridLine = thinLine(
                    { x: -range, y: y, z: 0 },
                    { x: range, y: y, z: 0 },
                    {
                        color: gridColor,
                        linewidth: 1,
                        opacity: 0.5  // Increased opacity for better visibility
                    }
                );
                coordGroup.add(gridLine);
            }
        }
        
        // Grid lines parallel to Y-axis
        for (let x = -range; x <= range; x += tickStep) {
            if (x !== 0) {  // Skip the main axis
                const gridLine = thinLine(
                    { x: x, y: -range, z: 0 },
                    { x: x, y: range, z: 0 },
                    {
                        color: gridColor,
                        linewidth: 1,
                        opacity: 0.5  // Increased opacity for better visibility
                    }
                );
                coordGroup.add(gridLine);
            }
        }
    }
    
    // Create tick marks and labels if requested
    if (showTicks) {
        for (let i = -range; i <= range; i += tickStep) {
            if (i !== 0) {  // Skip origin
                // X-axis ticks
                const xTick = line(
                    { x: i, y: -0.1, z: 0 },
                    { x: i, y: 0.1, z: 0 },
                    {
                        color: axisColor,
                        radius: axisThickness * 0.6,
                        opacity: 0.7
                    }
                );
                coordGroup.add(xTick);
                
                // X-axis tick label
                const xTickLabel = label(i.toString(), 
                    { x: i, y: -0.3, z: -0.3 },
                    {
                        fontSize: 18,
                        color: labelColor,
                        scale: 0.02
                    }
                );
                if (xTickLabel && smartLabels) {
                    xTickLabel.material.depthTest = false;
                    xTickLabel.material.depthWrite = false;
                }
                labelGroup.add(xTickLabel);
                
                // Y-axis ticks
                const yTick = line(
                    { x: -0.1, y: i, z: 0 },
                    { x: 0.1, y: i, z: 0 },
                    {
                        color: axisColor,
                        radius: axisThickness * 0.6,
                        opacity: 0.7
                    }
                );
                coordGroup.add(yTick);
                
                // Y-axis tick label
                const yTickLabel = label(i.toString(),
                    { x: -0.3, y: i, z: -0.3 },
                    {
                        fontSize: 18,
                        color: labelColor,
                        scale: 0.02
                    }
                );
                if (yTickLabel && smartLabels) {
                    yTickLabel.material.depthTest = false;
                    yTickLabel.material.depthWrite = false;
                }
                labelGroup.add(yTickLabel);
                
                // Z-axis ticks
                const zTick = line(
                    { x: -0.1, y: 0, z: i },
                    { x: 0.1, y: 0, z: i },
                    {
                        color: axisColor,
                        radius: axisThickness * 0.6,
                        opacity: 0.7
                    }
                );
                coordGroup.add(zTick);
                
                // Z-axis tick label
                const zTickLabel = label(i.toString(),
                    { x: -0.3, y: -0.3, z: i },
                    {
                        fontSize: 18,
                        color: labelColor,
                        scale: 0.02
                    }
                );
                if (zTickLabel && smartLabels) {
                    zTickLabel.material.depthTest = false;
                    zTickLabel.material.depthWrite = false;
                }
                labelGroup.add(zTickLabel);
            }
        }
    }
    
    // Create axis labels (X, Y, Z) if requested
    if (showLabels) {
        // X axis label
        const xLabel = label('X',
            { x: range + 0.5, y: 0, z: 0 },
            {
                fontSize: 32,
                fontWeight: 'bold',
                color: labelColor,
                scale: 0.025
            }
        );
        if (xLabel && smartLabels) {
            xLabel.material.depthTest = false;
            xLabel.material.depthWrite = false;
        }
        labelGroup.add(xLabel);
        
        // Y axis label
        const yLabel = label('Y',
            { x: 0, y: range + 0.5, z: 0 },
            {
                fontSize: 32,
                fontWeight: 'bold',
                color: labelColor,
                scale: 0.025
            }
        );
        if (yLabel && smartLabels) {
            yLabel.material.depthTest = false;
            yLabel.material.depthWrite = false;
        }
        labelGroup.add(yLabel);
        
        // Z axis label
        const zLabel = label('Z',
            { x: 0, y: 0, z: range + 0.5 },
            {
                fontSize: 32,
                fontWeight: 'bold',
                color: labelColor,
                scale: 0.025
            }
        );
        if (zLabel && smartLabels) {
            zLabel.material.depthTest = false;
            zLabel.material.depthWrite = false;
        }
        labelGroup.add(zLabel);
    }
    
    // Add origin point
    const originPoint = point(
        { x: 0, y: 0, z: 0 },
        {
            radius: 0.05,
            color: axisColor
        }
    );
    coordGroup.add(originPoint);
    
    // Add both groups to scene
    scene.add(coordGroup);
    scene.add(labelGroup);
    
    return { coordGroup, labelGroup };
}

/**
 * Sets up scene lighting based on the specified profile
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {string} profile - The lighting profile to use
 * @param {Function} customSetup - Optional custom lighting setup function
 */
function setupLighting(scene, profile, customSetup) {
    // Remove existing lights (except for any that might be part of axes/grid)
    const existingLights = scene.children.filter(child => 
        child.isLight && !child.userData.isAxisLight
    );
    existingLights.forEach(light => scene.remove(light));
    
    if (customSetup && typeof customSetup === 'function') {
        // Use custom lighting setup
        customSetup(scene);
        return;
    }
    
    switch (profile) {
        case 'basic':
            setupBasicLighting(scene);
            break;
            
        case 'phong':
            setupPhongLighting(scene);
            break;
            
        default:
            setupBasicLighting(scene);
    }
}

/**
 * Basic lighting setup - simple ambient and directional light
 */
function setupBasicLighting(scene) {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Single directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);
}

/**
 * Enhanced Phong lighting setup - for materials with specular highlights
 */
function setupPhongLighting(scene) {
    // Reduced ambient light to make directional lights more prominent
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    // Key light - strong directional light for main illumination and specular highlights
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(5, 10, 5);
    keyLight.target.position.set(0, 0, 0);
    scene.add(keyLight);
    scene.add(keyLight.target);
    
    // Fill light - softer light from opposite side
    const fillLight = new THREE.DirectionalLight(0xaaaaaa, 0.4);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);
    
    // Rim light - backlight for edge definition
    const rimLight = new THREE.PointLight(0xffffff, 0.6);
    rimLight.position.set(0, 15, -10);
    scene.add(rimLight);
}

// Maintain backward compatibility
export function init3DCoordinateSystem(scene, options = {}) {
    // Map old options to new format if needed
    const mappedOptions = {
        ...options,
        lightingProfile: options.lightingProfile || 'basic'
    };
    
    // Note: This returns a Promise now since setupCoordinateSystem is async
    return setupCoordinateSystem(scene, mappedOptions);
}

export default setupCoordinateSystem;