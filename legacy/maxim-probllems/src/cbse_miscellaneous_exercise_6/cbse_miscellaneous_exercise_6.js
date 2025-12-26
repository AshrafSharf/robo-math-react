// Cost Minimization Problem - Tank Construction
// Following the structure of volume-max with modifications for cost minimization

import { setupCoordinateSystem } from '../common/js/native/coordinate_system.js';
import { measurementIndicator } from '../common/js/native/measurement_indicator.js';
import { label } from '../common/js/native/label.js';
import { cleanupObjects } from '../common/js/native/cleanup.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';
import { plot } from './graph.js';
import { createCostTable } from './table_details.js';
import * as THREE from '../../node_modules/three/build/three.module.js';

// Configuration constants from step-by-step.json
const VOLUME = 8;        // Fixed volume in m³
const DEPTH = 2;         // Fixed depth in m
const BASE_AREA = 4;     // xy = 4 (from Volume = x·y·2 = 8)
const OPTIMAL_LENGTH = 2; // Optimal x value
const BASE_COST_PER_SQM = 70;
const SIDE_COST_PER_SQM = 45;

// Store objectsMap for cleanup
let objectsMap = {};
let currentLength = OPTIMAL_LENGTH;  // Start at optimal (x = 2)
let tankMesh = null;

// Groups for different views
let tankGroup = null;
let graphGroup = null;
let isGraphView = false;
let costTable = null;

// Format number for display
function formatNumber(value, precision = 1) {
    return Number(value.toFixed(precision)).toString();
}

/**
 * Calculate width from length using constraint xy = 4
 */
function calculateWidth(length) {
    return BASE_AREA / length;
}

/**
 * Calculate cost for given dimensions
 */
function calculateCost(length) {
    const width = calculateWidth(length);
    const baseCost = BASE_COST_PER_SQM * BASE_AREA;  // 70 * 4 = 280
    const sideArea = 2 * DEPTH * (length + width);   // 2 * 2 * (x + y) = 4(x + y)
    const sideCost = SIDE_COST_PER_SQM * sideArea;  // 45 * 4(x + y) = 180(x + y)
    const totalCost = baseCost + sideCost;           // 280 + 180(x + y)
    return totalCost;
}

/**
 * Cleans up all lesson objects
 * @param {THREE.Scene} scene - The Three.js scene
 */
function cleanupLesson(scene) {
    // Clean up groups
    if (tankGroup) {
        scene.remove(tankGroup);
        tankGroup = null;
    }
    if (graphGroup) {
        scene.remove(graphGroup);
        graphGroup = null;
    }
    
    // Clean up tank mesh
    if (tankMesh) {
        if (tankMesh.parent) {
            tankMesh.parent.remove(tankMesh);
        }
        tankMesh = null;
    }
    
    // Use the cleanup utility for all other objects
    cleanupObjects(scene, objectsMap);
    
    // Clear the map
    objectsMap = {};
}

/**
 * Creates all lesson objects
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {number} length - The current length value (x)
 * @returns {Object} Map of created objects
 */
function createLessonObjects(scene, length) {
    // Clear and reinitialize objectsMap
    objectsMap = {};
    
    // Always create a new tank group since cleanupLesson destroys it
    tankGroup = new THREE.Group();
    scene.add(tankGroup);
    
    // Calculate dimensions
    const width = calculateWidth(length);
    
    // Calculate label scaling based on view size
    const viewSize = 12;  // Should match the viewSize in setupCoordinateSystem
    const labelScaleFactor = Math.sqrt(viewSize / 15);
    const lessonLabelFontSize = Math.round(28 * labelScaleFactor);
    const lessonLabelScale = 0.025 * labelScaleFactor;
    
    // Create tank visualization (rectangular prism)
    const tankGeometry = new THREE.BoxGeometry(length, DEPTH, width);
    const tankMaterial = new THREE.MeshPhongMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.3,  // More transparent to show it's open at top
        shininess: 30,
        specular: 0x444444,
        side: THREE.DoubleSide
    });
    tankMesh = new THREE.Mesh(tankGeometry, tankMaterial);
    tankMesh.position.set(0, DEPTH/2, 0);  // Center the tank
    tankGroup.add(tankMesh);
    
    // Add edges to the tank
    const edges = new THREE.EdgesGeometry(tankGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ 
        color: 0x000000,
        linewidth: 2
    });
    const tankEdges = new THREE.LineSegments(edges, edgeMaterial);
    tankEdges.position.copy(tankMesh.position);
    tankGroup.add(tankEdges);
    objectsMap['tankEdges'] = { name: 'tankEdges', mesh: tankEdges };
    
    // Add base highlight (different color to show different cost)
    const baseGeometry = new THREE.PlaneGeometry(length, width);
    const baseMaterial = new THREE.MeshPhongMaterial({
        color: 0xff9900,  // Orange for base (higher cost per m²)
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.rotation.x = -Math.PI / 2;
    baseMesh.position.set(0, 0.01, 0);  // Slightly above 0 to avoid z-fighting
    tankGroup.add(baseMesh);
    objectsMap['base'] = { name: 'base', mesh: baseMesh };
    
    // Add measurement indicators
    // Length measurement (x)
    const lengthIndicator = measurementIndicator(
        { x: -length/2, y: 0, z: width/2 + 0.8 },
        { x: length/2, y: 0, z: width/2 + 0.8 },
        {
            color: 0x4488ff,
            mainRadius: 0.025,
            markerRadius: 0.018,
            markerLength: 0.5,
            label: `${formatNumber(length)}`,
            labelPosition: { x: 0, y: 0.4, z: width/2 + 0.8 },
            fontSize: Math.round(20 * labelScaleFactor),
            scale: 0.018 * labelScaleFactor
        }
    );
    tankGroup.add(lengthIndicator);
    objectsMap['lengthIndicator'] = { name: 'lengthIndicator', mesh: lengthIndicator };
    
    // Width measurement (y = 4/x)
    const widthIndicator = measurementIndicator(
        { x: length/2 + 0.8, y: 0, z: -width/2 },
        { x: length/2 + 0.8, y: 0, z: width/2 },
        {
            color: 0x4488ff,
            mainRadius: 0.025,
            markerRadius: 0.018,
            markerLength: 0.5,
            label: `${formatNumber(width)}`,
            labelPosition: { x: length/2 + 1.3, y: 0.3, z: 0 },
            fontSize: Math.round(20 * labelScaleFactor),
            scale: 0.018 * labelScaleFactor
        }
    );
    tankGroup.add(widthIndicator);
    objectsMap['widthIndicator'] = { name: 'widthIndicator', mesh: widthIndicator };
    
    // Depth measurement (2 m)
    const depthIndicator = measurementIndicator(
        { x: length/2 + 0.8, y: 0, z: width/2 },
        { x: length/2 + 0.8, y: DEPTH, z: width/2 },
        {
            color: 0x9966ff,
            mainRadius: 0.02,
            markerRadius: 0.015,
            markerLength: 0.4,
            label: '2',
            labelPosition: { x: length/2 + 1.0, y: DEPTH/2, z: width/2 },
            fontSize: Math.round(20 * labelScaleFactor),
            scale: 0.018 * labelScaleFactor
        }
    );
    tankGroup.add(depthIndicator);
    objectsMap['depthIndicator'] = { name: 'depthIndicator', mesh: depthIndicator };
    
    // Add text labels
    // Label for length 'x'
    const xLabel = label('x', 
        { x: 0, y: -0.8, z: width/2 + 1.2 },  // Moved further out to avoid overlap
        {
            color: '#000000',
            fontSize: lessonLabelFontSize,
            scale: lessonLabelScale
        }
    );
    tankGroup.add(xLabel);
    objectsMap['xLabel'] = { name: 'xLabel', mesh: xLabel };
    
    // Label for width 'y = 4/x'
    const yLabel = label('y = 4/x',
        { x: length/2 + 1.3, y: -0.8, z: 0 },  // Moved further out for clarity
        {
            color: '#000000',
            fontSize: lessonLabelFontSize,  // Same size as other labels
            scale: lessonLabelScale
        }
    );
    tankGroup.add(yLabel);
    objectsMap['yLabel'] = { name: 'yLabel', mesh: yLabel };
    
    
    
    return objectsMap;
}

/**
 * Toggles between tank view and graph view
 * @param {THREE.Scene} scene - The Three.js scene
 */
function toggleView(scene) {
    // Tank is always visible
    if (tankGroup) {
        tankGroup.visible = true;
    }
    // Graph visibility depends on checkbox state
    if (graphGroup) {
        graphGroup.visible = isGraphView;
    }
}

/**
 * Updates control panel displays with current values
 * @param {Object} controlPanel - The control panel instance
 * @param {number} length - Current length value
 */
function updateControlPanelDisplays(controlPanel, length) {
    const width = calculateWidth(length);
    const cost = calculateCost(length);
    const minCost = calculateCost(OPTIMAL_LENGTH);
    
    // Dimensions section
    controlPanel.updateText('length-dimension',
        mathDisplay3D(
            `\\text{Length: } x = ${formatNumber(length)} \\text{ m}`,
            { block: true }
        )
    );
    
    controlPanel.updateText('width-dimension',
        mathDisplay3D(
            `\\text{Width: } y = \\frac{4}{x} = \\frac{4}{${formatNumber(length)}} = ${formatNumber(width)} \\text{ m}`,
            { block: true }
        )
    );
    
    // Cost Calculation section
    controlPanel.updateText('base-cost',
        mathDisplay3D(
            `\\text{Base Cost: } 70 \\times 4 = 280 \\text{ Rs}`,
            { block: true }
        )
    );
    
    const sideArea = 4 * (length + width);
    controlPanel.updateText('side-cost',
        mathDisplay3D(
            `\\text{Side Cost: } 45 \\times 4(${formatNumber(length)} + ${formatNumber(width)}) = ${formatNumber(180 * (length + width))} \\text{ Rs}`,
            { block: true }
        )
    );
    
    controlPanel.updateText('total-cost',
        mathDisplay3D(
            `\\text{Total Cost: } C = 280 + 180(x + \\frac{4}{x}) = ${formatNumber(cost)} \\text{ Rs}`,
            { block: true }
        )
    );
    
    // Optimization section
    const dCdx = 180 - 720 / (length * length);
    
    controlPanel.updateText('derivative',
        mathDisplay3D(
            `\\frac{dC}{dx} = 180 - \\frac{720}{x^2} = 180 - \\frac{720}{${formatNumber(length)}^2} = ${formatNumber(dCdx, 1)}`,
            { block: true }
        )
    );
    
    controlPanel.updateText('critical-point',
        mathDisplay3D(
            `\\text{Critical point: } \\frac{dC}{dx} = 0 \\Rightarrow x = 2 \\text{ m}`,
            { block: true }
        )
    );
    
    // Minimum indicator with comparison
    const percentOfMin = ((cost - minCost) / minCost * 100).toFixed(1);
    if (Math.abs(length - OPTIMAL_LENGTH) < 0.05) {
        controlPanel.updateText('min-indicator',
            mathDisplay3D(
                `\\text{Minimum Cost: } C_{\\text{min}} = 1000 \\text{ Rs at } x = 2 \\quad \\color{green}{\\checkmark}`,
                { block: true }
            )
        );
    } else {
        const excess = cost - minCost;
        controlPanel.updateText('min-indicator',
            mathDisplay3D(
                `\\text{Current: } ${formatNumber(cost)} \\text{ Rs} \\quad (+${formatNumber(excess)} \\text{ Rs above minimum})`,
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
    // Setup coordinate system with isometric view for reduced skewing
    // Isometric angles: 45° around Y, 35.264° elevation
    const distance = 15;
    const isometricX = distance * Math.cos(Math.PI/4) * Math.cos(Math.atan(1/Math.sqrt(2)));
    const isometricY = distance * Math.sin(Math.atan(1/Math.sqrt(2)));
    const isometricZ = distance * Math.sin(Math.PI/4) * Math.cos(Math.atan(1/Math.sqrt(2)));
    
    setupCoordinateSystem(scene, {
        showAxes: false,  // Clean view without axes
        axesRange: 10,
        axesTickStep: 2,
        showGrid: false,  // No grid for cleaner visualization
        enableInteraction: true,
        viewSize: 12,  // Smaller viewSize for better measurement indicator visibility
        cameraPosition: { x: isometricX, y: isometricY, z: isometricZ },
        cameraTarget: { x: 0, y: 1, z: 0 },
        lightingProfile: 'phong'
    });
    
    // Tight style for consistent spacing
    const tightStyle = { margin: '2px 0', padding: '2px 0', lineHeight: '1.2' };
    
    // Create control panel interface
    // SECTION: Problem Setup
    controlPanel.createText('problem-title', 
        '<div class="step-details-title">Problem Setup</div>',
        tightStyle
    );
    
    controlPanel.createText('constraint-volume',
        mathDisplay3D(`\\text{Volume: } V = x \\cdot y \\cdot 2 = 8 \\text{ m}^3 \\text{ (fixed)}`, { block: true }),
        tightStyle
    );
    
    controlPanel.createText('constraint-depth',
        mathDisplay3D(`\\text{Depth: } 2 \\text{ m (fixed)} \\Rightarrow xy = 4`, { block: true }),
        tightStyle
    );
    
    controlPanel.createText('cost-rates',
        mathDisplay3D(`\\text{Base: Rs 70/m}^2, \\text{ Sides: Rs 45/m}^2`, { block: true }),
        tightStyle
    );
    
    // SECTION: Dimensions
    controlPanel.createText('dimensions-title',
        '<div class="step-details-title">Tank Dimensions</div>',
        tightStyle
    );
    
    controlPanel.createText('length-dimension', '', tightStyle);
    controlPanel.createText('width-dimension', '', tightStyle);
    
    // SECTION: Interactive Control
    controlPanel.createText('control-title',
        '<div class="step-details-title">Controls</div>',
        tightStyle
    );
    
    // Length stepper control
    const stepperControl = controlPanel.createStepperWithUnits(
        'tank-length',
        'x',
        currentLength,
        'm',
        {
            title: '',
            showTitle: false,
            min: 0.5,
            max: 8.0,
            step: 0.1,
            precision: 1,
            onChange: (value) => {
                currentLength = value;
                
                // Clear everything except coordinate system
                cleanupLesson(scene);
                
                // Recreate with new length
                createLessonObjects(scene, currentLength);
                
                // Always recreate the graph
                graphGroup = plot(scene, {
                    currentLength: currentLength
                });
                scene.add(graphGroup);
                
                // Tank is always visible, graph visibility depends on checkbox state
                if (tankGroup) {
                    tankGroup.visible = true;
                }
                if (graphGroup) {
                    graphGroup.visible = isGraphView;  // Only show if checkbox is checked
                }
                
                // Update displays
                updateControlPanelDisplays(controlPanel, currentLength);
                
                // Update table selection if visible
                if (costTable && isGraphView) {
                    costTable.updateSelectedLength(currentLength);
                }
            }
        }
    );
    
    // SECTION: Cost Calculation
    controlPanel.createText('cost-title',
        '<div class="step-details-title">Cost Calculation</div>',
        tightStyle
    );
    
    controlPanel.createText('base-cost', '', tightStyle);
    controlPanel.createText('side-cost', '', tightStyle);
    controlPanel.createText('total-cost', '', tightStyle);
    
    // SECTION: Optimization
    controlPanel.createText('optimization-title',
        '<div class="step-details-title">Optimization</div>',
        tightStyle
    );
    
    controlPanel.createText('derivative', '', tightStyle);
    controlPanel.createText('critical-point', '', tightStyle);
    controlPanel.createText('min-indicator', '', tightStyle);
    
    // Graph toggle checkbox
    controlPanel.createText('button-row', 
        `<div style="display: flex; align-items: center; gap: 15px; margin: 15px 0 10px 0;">
            <label style="display: flex; align-items: center; cursor: pointer; white-space: nowrap; padding: 8px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px; font-size: 14px; font-weight: 500; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <input type="checkbox" id="view-toggle" style="margin-right: 8px; width: 18px; height: 18px; cursor: pointer;">
                <span>Show Graph</span>
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
                
                // Only swap the calculation sections with the table
                const calculationSectionIds = [
                    'text-dimensions-title', 'text-length-dimension', 'text-width-dimension',
                    'text-cost-title', 'text-base-cost', 'text-side-cost', 'text-total-cost',
                    'text-optimization-title', 'text-derivative', 'text-critical-point', 'text-min-indicator'
                ];
                
                if (isGraphView) {
                    // Show graph in 3D scene AND show table in place of calculations
                    calculationSectionIds.forEach(id => {
                        const element = document.getElementById(id);
                        if (element) element.style.display = 'none';
                    });
                    
                    if (costTable) {
                        costTable.show();
                        costTable.updateSelectedLength(currentLength);
                    }
                } else {
                    // Hide graph in 3D scene AND show calculations in place of table
                    calculationSectionIds.forEach(id => {
                        const element = document.getElementById(id);
                        if (element) element.style.display = '';
                    });
                    
                    if (costTable) {
                        costTable.hide();
                    }
                }
            };
        }
    }, 0);
    
    // Create initial visualization
    createLessonObjects(scene, currentLength);
    
    // Create graph group
    graphGroup = plot(scene, {
        currentLength: currentLength
    });
    scene.add(graphGroup);
    graphGroup.visible = false;  // Initially hidden
    
    // Create the cost table (initially hidden)
    costTable = createCostTable(controlPanel, OPTIMAL_LENGTH);
    
    // Ensure table is hidden initially since isGraphView starts as false
    if (costTable) {
        costTable.hide();
    }
    
    // Initial display update
    updateControlPanelDisplays(controlPanel, currentLength);
    
    // Enable Stop button to reset lesson
    scene.userData.recreateLesson = () => {
        currentLength = OPTIMAL_LENGTH;
        isGraphView = false;
        
        // Update the stepper value
        const stepperElement = document.getElementById('tank-length-value');
        if (stepperElement) {
            stepperElement.value = currentLength;
        }
        
        // Update the checkbox
        const checkboxElement = document.getElementById('view-toggle');
        if (checkboxElement) {
            checkboxElement.checked = false;
        }
        
        // Hide table and show calculations
        if (costTable) {
            costTable.hide();
        }
        const calculationSectionIds = [
            'text-dimensions-title', 'text-length-dimension', 'text-width-dimension',
            'text-cost-title', 'text-base-cost', 'text-side-cost', 'text-total-cost',
            'text-optimization-title', 'text-derivative', 'text-critical-point', 'text-min-indicator'
        ];
        calculationSectionIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = '';
        });
        
        // Recreate visualization
        cleanupLesson(scene);
        createLessonObjects(scene, currentLength);
        
        // Recreate graph
        graphGroup = plot(scene, {
            currentLength: currentLength
        });
        scene.add(graphGroup);
        graphGroup.visible = false;
        
        updateControlPanelDisplays(controlPanel, currentLength);
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