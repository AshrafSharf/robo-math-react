// State Exercise 78.10 - Open Box Maximization with Fixed Surface Area
// Following the structure of volume-max reference implementation

import { setupCoordinateSystem } from '../common/js/native/coordinate_system.js';
import { measurementIndicator } from '../common/js/native/measurement_indicator.js';
import { label } from '../common/js/native/label.js';
import { cleanupObjects } from '../common/js/native/cleanup.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';
import { plot } from './graph.js';
import { createVolumeTable } from './table_details.js';
import * as THREE from 'three';

// Configuration constants from step-by-step.json
const SURFACE_AREA = 108;  // Fixed surface area constraint
const OPTIMAL_X = 6;  // Optimal base side length (x = 6)
const OPTIMAL_Y = 3;  // Optimal height at x = 6

// Store objectsMap for cleanup
let objectsMap = {};
let currentBaseSize = OPTIMAL_X;  // Start at optimal

// Groups for different views
let boxGroup = null;
let graphGroup = null;
let isGraphView = false;
let volumeTable = null;

// Format number for display
function formatNumber(value, precision = 1) {
    return Number(value.toFixed(precision)).toString();
}

// Calculate height based on base size and surface area constraint
function calculateHeight(x) {
    if (x <= 0) return 0;
    return (SURFACE_AREA - x * x) / (4 * x);
}

// Calculate volume
function calculateVolume(x) {
    const y = calculateHeight(x);
    return x * x * y;
}

/**
 * Cleans up all lesson objects
 * @param {THREE.Scene} scene - The Three.js scene
 */
function cleanupLesson(scene) {
    // Clean up groups
    if (boxGroup) {
        scene.remove(boxGroup);
        boxGroup = null;
    }
    if (graphGroup) {
        scene.remove(graphGroup);
        graphGroup = null;
    }
    
    // Use the cleanup utility for all other objects
    cleanupObjects(scene, objectsMap);
    
    // Clear the map
    objectsMap = {};
}

/**
 * Creates all lesson objects
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {number} baseSize - The current base size value (x)
 * @returns {Object} Map of created objects
 */
function createLessonObjects(scene, baseSize) {
    // Clear and reinitialize objectsMap
    objectsMap = {};
    
    // Always create a new box group since cleanupLesson destroys it
    boxGroup = new THREE.Group();
    scene.add(boxGroup);
    
    // Calculate dimensions
    const height = calculateHeight(baseSize);
    const volume = calculateVolume(baseSize);
    
    // Calculate label scaling based on view size
    const viewSize = 15;
    const labelScaleFactor = Math.sqrt(viewSize / 15);
    const lessonLabelFontSize = Math.round(28 * labelScaleFactor);
    const lessonLabelScale = 0.025 * labelScaleFactor;
    
    // Create the open box (no top face)
    if (baseSize > 0.5 && height > 0.1) {
        // Create box geometry
        const boxGeometry = new THREE.BoxGeometry(baseSize, height, baseSize);
        
        // Create material with transparency
        const boxMaterial = new THREE.MeshPhongMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.8,
            shininess: 30,
            specular: 0x444444,
            side: THREE.DoubleSide
        });
        
        // Create the box as individual faces to omit the top
        const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
        boxMesh.position.set(0, height/2, 0);
        
        // Create a group for the open box faces
        const openBoxGroup = new THREE.Group();
        
        // Bottom face
        const bottomGeometry = new THREE.PlaneGeometry(baseSize, baseSize);
        const bottomMesh = new THREE.Mesh(bottomGeometry, boxMaterial);
        bottomMesh.rotation.x = -Math.PI / 2;
        bottomMesh.position.y = 0;
        openBoxGroup.add(bottomMesh);
        
        // Front face
        const frontGeometry = new THREE.PlaneGeometry(baseSize, height);
        const frontMesh = new THREE.Mesh(frontGeometry, boxMaterial);
        frontMesh.position.z = baseSize / 2;
        frontMesh.position.y = height / 2;
        openBoxGroup.add(frontMesh);
        
        // Back face
        const backGeometry = new THREE.PlaneGeometry(baseSize, height);
        const backMesh = new THREE.Mesh(backGeometry, boxMaterial);
        backMesh.position.z = -baseSize / 2;
        backMesh.position.y = height / 2;
        backMesh.rotation.y = Math.PI;
        openBoxGroup.add(backMesh);
        
        // Left face
        const leftGeometry = new THREE.PlaneGeometry(baseSize, height);
        const leftMesh = new THREE.Mesh(leftGeometry, boxMaterial);
        leftMesh.position.x = -baseSize / 2;
        leftMesh.position.y = height / 2;
        leftMesh.rotation.y = -Math.PI / 2;
        openBoxGroup.add(leftMesh);
        
        // Right face
        const rightGeometry = new THREE.PlaneGeometry(baseSize, height);
        const rightMesh = new THREE.Mesh(rightGeometry, boxMaterial);
        rightMesh.position.x = baseSize / 2;
        rightMesh.position.y = height / 2;
        rightMesh.rotation.y = Math.PI / 2;
        openBoxGroup.add(rightMesh);
        
        boxGroup.add(openBoxGroup);
        objectsMap['openBox'] = { name: 'openBox', mesh: openBoxGroup };
        
        // Add edges to the box for clarity
        const edges = new THREE.EdgesGeometry(boxGeometry);
        const edgeMaterial = new THREE.LineBasicMaterial({ 
            color: 0x000000,
            linewidth: 2
        });
        const boxEdges = new THREE.LineSegments(edges, edgeMaterial);
        boxEdges.position.set(0, height/2, 0);
        boxGroup.add(boxEdges);
        objectsMap['boxEdges'] = { name: 'boxEdges', mesh: boxEdges };
        
        // Add measurement indicators
        // Base width measurement (x)
        const baseWidthIndicator = measurementIndicator(
            { x: -baseSize/2, y: 0.06, z: baseSize/2 + 0.8 },
            { x: baseSize/2, y: 0.06, z: baseSize/2 + 0.8 },
            {
                color: 0x4488ff,
                mainRadius: 0.025,
                markerRadius: 0.018,
                markerLength: 0.5,
                label: `${formatNumber(baseSize)}`,
                labelPosition: { x: 0, y: 0.5, z: baseSize/2 + 1.5 }
            }
        );
        boxGroup.add(baseWidthIndicator);
        objectsMap['baseWidth'] = { name: 'baseWidth', mesh: baseWidthIndicator };
        
        // Base depth measurement (x) - on the side
        const baseDepthIndicator = measurementIndicator(
            { x: baseSize/2 + 0.8, y: 0.06, z: -baseSize/2 },
            { x: baseSize/2 + 0.8, y: 0.06, z: baseSize/2 },
            {
                color: 0x4488ff,
                mainRadius: 0.025,
                markerRadius: 0.018,
                markerLength: 0.5,
                label: `${formatNumber(baseSize)}`,
                labelPosition: { x: baseSize/2 + 1.5, y: 0.5, z: 0 }
            }
        );
        boxGroup.add(baseDepthIndicator);
        objectsMap['baseDepth'] = { name: 'baseDepth', mesh: baseDepthIndicator };
        
        // Height measurement (y)
        if (height > 0.2) {
            const heightIndicator = measurementIndicator(
                { x: baseSize/2 + 0.8, y: 0, z: baseSize/2 },
                { x: baseSize/2 + 0.8, y: height, z: baseSize/2 },
                {
                    color: 0x9966ff,
                    mainRadius: 0.02,
                    markerRadius: 0.015,
                    markerLength: 0.4,
                    label: `${formatNumber(height)}`,
                    labelPosition: { x: baseSize/2 + 1.5, y: height/2, z: baseSize/2 }
                }
            );
            boxGroup.add(heightIndicator);
            objectsMap['height'] = { name: 'height', mesh: heightIndicator };
        }
        
        // Add text labels
        // Label for base dimension 'x'
        const xLabel1 = label('x', 
            { x: 0, y: 0.3, z: baseSize/2 + 0.3 },
            {
                color: '#000000',
                fontSize: lessonLabelFontSize,
                scale: lessonLabelScale
            }
        );
        boxGroup.add(xLabel1);
        objectsMap['xLabel1'] = { name: 'xLabel1', mesh: xLabel1 };
        
        const xLabel2 = label('x', 
            { x: baseSize/2 + 0.3, y: 0.3, z: 0 },
            {
                color: '#000000',
                fontSize: lessonLabelFontSize,
                scale: lessonLabelScale
            }
        );
        boxGroup.add(xLabel2);
        objectsMap['xLabel2'] = { name: 'xLabel2', mesh: xLabel2 };
        
        // Label for height 'y'
        if (height > 0.5) {
            const yLabel = label('y', 
                { x: baseSize/2 + 0.3, y: height/2, z: baseSize/2 + 0.3 },
                {
                    color: '#000000',
                    fontSize: lessonLabelFontSize,
                    scale: lessonLabelScale
                }
            );
            boxGroup.add(yLabel);
            objectsMap['yLabel'] = { name: 'yLabel', mesh: yLabel };
        }
        
        // Add surface area visualization (optional - wire frame showing the surface)
        const surfaceAreaLabel = label(`SA = ${formatNumber(SURFACE_AREA)}`,
            { x: 0, y: height + 1, z: 0 },
            {
                color: '#000000',
                fontSize: Math.round(lessonLabelFontSize * 0.9),
                scale: lessonLabelScale * 0.9
            }
        );
        boxGroup.add(surfaceAreaLabel);
        objectsMap['surfaceAreaLabel'] = { name: 'surfaceAreaLabel', mesh: surfaceAreaLabel };
    }
    
    return objectsMap;
}

/**
 * Toggles between box view and graph view
 * @param {THREE.Scene} scene - The Three.js scene
 */
function toggleView(scene) {
    // Box is always visible
    if (boxGroup) {
        boxGroup.visible = true;
    }
    // Graph visibility depends on checkbox state
    if (graphGroup) {
        graphGroup.visible = isGraphView;
    }
}

/**
 * Updates control panel displays with current values
 * @param {Object} controlPanel - The control panel instance
 * @param {number} baseSize - Current base size value
 */
function updateControlPanelDisplays(controlPanel, baseSize) {
    const height = calculateHeight(baseSize);
    const volume = calculateVolume(baseSize);
    const maxVolume = calculateVolume(OPTIMAL_X);
    
    // Box Dimensions section
    controlPanel.updateText('base-dimension',
        mathDisplay3D(
            `\\text{Base: } x \\times x = ${formatNumber(baseSize)} \\times ${formatNumber(baseSize)} = ${formatNumber(baseSize * baseSize)}\\text{ cm}^2`,
            { block: true }
        )
    );
    
    controlPanel.updateText('height-dimension',
        mathDisplay3D(
            `\\text{Height: } y = \\frac{108 - x^2}{4x} = \\frac{108 - ${formatNumber(baseSize)}^2}{4 \\cdot ${formatNumber(baseSize)}} = ${formatNumber(height)}\\text{ cm}`,
            { block: true }
        )
    );
    
    // Surface Area Constraint section
    controlPanel.updateText('surface-area',
        mathDisplay3D(
            `\\text{Surface Area: } x^2 + 4xy = ${formatNumber(baseSize * baseSize + 4 * baseSize * height)}\\text{ cm}^2`,
            { block: true }
        )
    );
    
    // Volume Calculation section
    controlPanel.updateText('formula',
        mathDisplay3D(
            `V = x^2y = \\frac{108x - x^3}{4} = ${formatNumber(baseSize)}^2 \\cdot ${formatNumber(height)} = ${formatNumber(volume, 1)} \\text{ cm}^3`,
            { block: true }
        )
    );
    
    controlPanel.updateText('volume-value',
        mathDisplay3D(
            `\\text{Current Volume: } ${formatNumber(volume, 1)} \\text{ cm}^3`,
            { block: true }
        )
    );
    
    // Optimization section
    const dVdx = (108 - 3 * baseSize * baseSize) / 4;
    
    controlPanel.updateText('derivative',
        mathDisplay3D(
            `\\frac{dV}{dx} = \\frac{108 - 3x^2}{4} = \\frac{108 - 3(${formatNumber(baseSize)})^2}{4} = ${formatNumber(dVdx, 1)}`,
            { block: true }
        )
    );
    
    controlPanel.updateText('critical-point',
        mathDisplay3D(
            `\\text{Critical point: } \\frac{dV}{dx} = 0 \\Rightarrow x^2 = 36 \\Rightarrow x = 6`,
            { block: true }
        )
    );
    
    // Maximum indicator with comparison
    const percentOfMax = (volume / maxVolume * 100).toFixed(0);
    if (Math.abs(baseSize - OPTIMAL_X) < 0.05) {
        controlPanel.updateText('max-indicator',
            mathDisplay3D(
                `\\text{Maximum: } V_{\\text{max}} = ${formatNumber(maxVolume, 1)} \\text{ at } x = 6, y = 3 \\quad \\color{green}{\\checkmark}`,
                { block: true }
            )
        );
    } else {
        controlPanel.updateText('max-indicator',
            mathDisplay3D(
                `\\text{Current: } ${percentOfMax}\\% \\text{ of max} \\quad (V_{\\text{max}} = ${formatNumber(maxVolume, 1)} \\text{ at } x = 6)`,
                { block: true }
            )
        );
    }
}

/**
 * Main render function
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {Object} controlPanel - The control panel instance
 */
export function render(scene, controlPanel) {
    // Setup coordinate system
    setupCoordinateSystem(scene, {
        showAxes: false,  // Clean view without axes
        axesRange: 10,
        axesTickStep: 2,
        showGrid: false,  // No grid for cleaner visualization
        enableInteraction: true,
        viewSize: 15,  // Smaller view size for bigger diagram
        cameraPosition: { x: 12, y: 10, z: 12 },
        cameraTarget: { x: 0, y: 0, z: 0 },
        lightingProfile: 'phong'
    });
    
    // Tight style for consistent spacing
    const tightStyle = { margin: '2px 0', padding: '2px 0', lineHeight: '1.2' };
    
    // Create control panel interface
    // SECTION 1: Problem Setup & Constraints
    controlPanel.createText('problem-title', 
        '<div class="step-details-title">Problem Setup & Constraints</div>',
        tightStyle
    );
    
    controlPanel.createText('constraint',
        mathDisplay3D(
            `\\text{Constraint: } x^2 + 4xy = 108 \\text{ cm}^2`,
            { block: true }
        ),
        tightStyle
    );
    
    controlPanel.createText('surface-area', '', tightStyle);
    
    // SECTION 2: Box Dimensions
    controlPanel.createText('dimensions-title',
        '<div class="step-details-title">Box Dimensions</div>',
        tightStyle
    );
    
    controlPanel.createText('base-dimension', '', tightStyle);
    controlPanel.createText('height-dimension', '', tightStyle);
    
    // Base size stepper control - no label needed, it's self-explanatory
    const stepperControl = controlPanel.createStepperWithUnits(
        'base-size',
        'x',
        currentBaseSize,
        'cm',
        {
            title: '',
            showTitle: false,
            min: 0.5,
            max: 10.0,
            step: 0.1,
            precision: 1,
            onChange: (value) => {
                currentBaseSize = value;
                
                // Clear everything except coordinate system
                cleanupLesson(scene);
                
                // Recreate with new base size
                createLessonObjects(scene, currentBaseSize);
                
                // Always recreate the graph
                graphGroup = plot(scene, {
                    surfaceArea: SURFACE_AREA,
                    currentBaseSize: currentBaseSize
                });
                scene.add(graphGroup);
                
                // Box is always visible, graph visibility depends on checkbox state
                if (boxGroup) {
                    boxGroup.visible = true;
                }
                if (graphGroup) {
                    graphGroup.visible = isGraphView;  // Only show if checkbox is checked
                }
                
                // Update displays
                updateControlPanelDisplays(controlPanel, currentBaseSize);
                
                // Update table selection if visible
                if (volumeTable && isGraphView) {
                    volumeTable.updateSelectedValue(currentBaseSize);
                }
            }
        }
    );
    
    // SECTION 3: Volume Calculation
    controlPanel.createText('volume-title',
        '<div class="step-details-title">Volume Calculation</div>',
        tightStyle
    );
    
    controlPanel.createText('formula', '', tightStyle);
    controlPanel.createText('volume-value', '', tightStyle);
    
    // SECTION 4: Optimization Analysis
    controlPanel.createText('optimization-title',
        '<div class="step-details-title">Optimization Analysis</div>',
        tightStyle
    );
    
    controlPanel.createText('derivative', '', tightStyle);
    controlPanel.createText('critical-point', '', tightStyle);
    controlPanel.createText('max-indicator', '', tightStyle);
    
    // Create checkbox for graph toggle - just the button, no section title
    controlPanel.createText('button-row', 
        `<div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin: 20px 0;">
            <label style="display: flex; align-items: center; cursor: pointer; white-space: nowrap; padding: 12px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; font-size: 16px; font-weight: 600; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.2); transition: transform 0.2s;">
                <input type="checkbox" id="view-toggle" style="margin-right: 10px; width: 20px; height: 20px; cursor: pointer;">
                <span>📊 Show Graph View</span>
            </label>
        </div>`,
        { margin: '0', padding: '0' }
    );
    
    // Add event listeners after the elements are created
    setTimeout(() => {
        const viewToggle = document.getElementById('view-toggle');
        
        if (viewToggle) {
            viewToggle.onchange = () => {
                isGraphView = viewToggle.checked;
                toggleView(scene);
                
                // Swap the calculation sections with the table (but NOT the button section)
                const calculationSectionIds = [
                    'text-problem-title', 'text-constraint', 'text-surface-area',
                    'text-dimensions-title', 'text-base-dimension', 'text-height-dimension',
                    'text-volume-title', 'text-formula', 'text-volume-value',
                    'text-optimization-title', 'text-derivative', 'text-critical-point', 'text-max-indicator'
                ];
                
                if (isGraphView) {
                    // Show graph in 3D scene AND show table in place of calculations
                    calculationSectionIds.forEach(id => {
                        const element = document.getElementById(id);
                        if (element) element.style.display = 'none';
                    });
                    
                    if (volumeTable) {
                        volumeTable.show();
                        volumeTable.updateSelectedValue(currentBaseSize);
                    }
                } else {
                    // Hide graph in 3D scene AND show calculations in place of table
                    calculationSectionIds.forEach(id => {
                        const element = document.getElementById(id);
                        if (element) element.style.display = '';
                    });
                    
                    if (volumeTable) {
                        volumeTable.hide();
                    }
                }
            };
        }
    }, 0);
    
    // Create initial visualization
    createLessonObjects(scene, currentBaseSize);
    
    // Create graph group
    graphGroup = plot(scene, {
        surfaceArea: SURFACE_AREA,
        currentBaseSize: currentBaseSize
    });
    scene.add(graphGroup);
    graphGroup.visible = false;  // Initially hidden
    
    // Create the volume table (initially hidden)
    volumeTable = createVolumeTable(controlPanel, SURFACE_AREA, OPTIMAL_X, OPTIMAL_Y);
    
    // Ensure table is hidden initially since isGraphView starts as false
    if (volumeTable) {
        volumeTable.hide();
    }
    
    // Initial display update
    updateControlPanelDisplays(controlPanel, currentBaseSize);
    
    // Enable Stop button to reset lesson
    scene.userData.recreateLesson = () => {
        currentBaseSize = OPTIMAL_X;
        isGraphView = false;
        
        // Update the stepper value
        const stepperElement = document.getElementById('base-size-value');
        if (stepperElement) {
            stepperElement.value = currentBaseSize;
        }
        
        // Update the checkbox
        const checkboxElement = document.getElementById('view-toggle');
        if (checkboxElement) {
            checkboxElement.checked = false;
        }
        
        // Hide table and show calculations
        if (volumeTable) {
            volumeTable.hide();
        }
        const calculationSectionIds = [
            'text-problem-title', 'text-problem', 'text-constraint', 'text-surface-area',
            'text-dimensions-title', 'text-base-dimension', 'text-height-dimension',
            'text-volume-title', 'text-formula', 'text-volume-value',
            'text-optimization-title', 'text-derivative', 'text-critical-point', 'text-max-indicator'
        ];
        calculationSectionIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = '';
        });
        
        // Recreate visualization
        cleanupLesson(scene);
        createLessonObjects(scene, currentBaseSize);
        
        // Recreate graph
        graphGroup = plot(scene, {
            surfaceArea: SURFACE_AREA,
            currentBaseSize: currentBaseSize
        });
        scene.add(graphGroup);
        graphGroup.visible = false;
        
        updateControlPanelDisplays(controlPanel, currentBaseSize);
    };
}

/**
 * Reset function
 */
export function reset() {
    // This will be called by the Stop button through recreateLesson
    if (scene && scene.userData.recreateLesson) {
        scene.userData.recreateLesson();
    }
}

/**
 * Cleanup function
 */
export function cleanup() {
    if (scene) {
        cleanupLesson(scene);
    }
}

/**
 * Returns the number of sections in the control panel
 * @returns {number} Number of sections
 */
export function getSectionCount() {
    return 4; // Problem Setup & Constraints, Box Dimensions, Volume Calculation, Optimization Analysis
}

/**
 * Returns the total number of rows in the control panel (including section titles)
 * @returns {number} Total number of rows
 */
export function getRowCount() {
    // Section titles: 4 
    // Content rows: 10 (constraint, surface-area, base-dim, height-dim, formula, volume-value, derivative, critical-point, max-indicator, button-row)
    // Stepper control is not counted as a row
    return 14; // Total rows within 18 limit
}