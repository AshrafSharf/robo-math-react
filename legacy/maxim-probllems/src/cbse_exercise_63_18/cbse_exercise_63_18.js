// Volume Maximization Problem - Rectangular Sheet
// Based on volume-max reference implementation

import { setupCoordinateSystem } from '../common/js/native/coordinate_system.js';
import { createFoldableRectangularBoxNet } from '../common/js/native/foldables/foldable_rectangular_box_net.js';
import { measurementIndicator } from '../common/js/native/measurement_indicator.js';
import { label } from '../common/js/native/label.js';
import { cleanupObjects } from '../common/js/native/cleanup.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';
import { plot } from './graph.js';
import { createVolumeTable } from './table_details.js';
import * as THREE from 'three';

// Configuration constants from step-by-step.json
const SHEET_LENGTH = 45;  // Length of rectangular sheet
const SHEET_WIDTH = 24;   // Width of rectangular sheet
const OPTIMAL_CUT = 5;    // Maximum volume occurs at x = 5
const VIEW_SIZE = 60;     // Larger view size for rectangular sheet (increase to zoom out)

// Store objectsMap for cleanup
let objectsMap = {};
let foldableNet = null;
let currentCutSize = OPTIMAL_CUT;  // Start at optimal
let isFolded = false;  // Track fold state

// Groups for different views
let boxGroup = null;
let graphGroup = null;
let isGraphView = false;
let volumeTable = null;

// Format number for display
function formatNumber(value, precision = 1) {
    return Number(value.toFixed(precision)).toString();
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
    
    // Clean up foldable net
    if (foldableNet) {
        foldableNet.stop();
        if (foldableNet.group.parent) {
            foldableNet.group.parent.remove(foldableNet.group);
        }
        foldableNet = null;
    }
    
    // Use the cleanup utility for all other objects
    cleanupObjects(scene, objectsMap);
    
    // Clear the map
    objectsMap = {};
}

/**
 * Creates all lesson objects
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {number} cutSize - The current cut size value
 * @returns {Object} Map of created objects
 */
function createLessonObjects(scene, cutSize) {
    // Clear and reinitialize objectsMap
    objectsMap = {};
    
    // Always create a new box group since cleanupLesson destroys it
    boxGroup = new THREE.Group();
    scene.add(boxGroup);
    
    // Calculate label scaling based on view size
    const labelScaleFactor = Math.sqrt(VIEW_SIZE / 15);
    const lessonLabelFontSize = Math.round(28 * labelScaleFactor);
    const lessonLabelScale = 0.03 * labelScaleFactor;
    
    // Create foldable rectangular box net with current cut size - positioned on left
    foldableNet = createFoldableRectangularBoxNet({
        sheetLength: SHEET_LENGTH,
        sheetWidth: SHEET_WIDTH,
        cutSize: cutSize,
        position: { x: 0, y: 0, z: 0 },  // Center the sheet
        colors: {
            sheet: 0x4488ff,  // Blue sheet
            cuts: 0xff6666,   // Red cut corners (matching original)
            flaps: 0x4488ff   // Blue flaps
        },
        opacity: {
            sheet: 0.9,
            cuts: 0.8,
            flaps: 0.9
        },
        animation: {
            duration: 2000,
            easing: 'easeInOut',
            stagger: true
        },
        showOutlines: true,
        showFoldLines: true
    });
    
    boxGroup.add(foldableNet.group);
    
    // Add measurement indicators
    const innerLength = SHEET_LENGTH - 2 * cutSize;
    const innerWidth = SHEET_WIDTH - 2 * cutSize;
    
    // Sheet length measurement (45 units) - bottom side
    const sheetLengthIndicator = measurementIndicator(
        { x: -SHEET_LENGTH/2, y: 0.05, z: -SHEET_WIDTH/2 - 1.5 },
        { x: SHEET_LENGTH/2, y: 0.05, z: -SHEET_WIDTH/2 - 1.5 },
        {
            color: 0x333333,
            mainRadius: 0.03,
            markerRadius: 0.02,
            markerLength: 0.6,
            label: '45',
            labelPosition: { x: 0, y: 0.5, z: -SHEET_WIDTH/2 - 2.2 }
        }
    );
    boxGroup.add(sheetLengthIndicator);
    objectsMap['sheetLength'] = { name: 'sheetLength', mesh: sheetLengthIndicator };
    
    // Sheet width measurement (24 units) - left side
    const sheetWidthIndicator = measurementIndicator(
        { x: -SHEET_LENGTH/2 - 1.5, y: 0.05, z: -SHEET_WIDTH/2 },
        { x: -SHEET_LENGTH/2 - 1.5, y: 0.05, z: SHEET_WIDTH/2 },
        {
            color: 0x333333,
            mainRadius: 0.03,
            markerRadius: 0.02,
            markerLength: 0.6,
            label: '24',
            labelPosition: { x: -SHEET_LENGTH/2 - 2.2, y: 0.5, z: 0 }
        }
    );
    boxGroup.add(sheetWidthIndicator);
    objectsMap['sheetWidth'] = { name: 'sheetWidth', mesh: sheetWidthIndicator };
    
    // Box base length measurement (45 - 2x) - top side
    if (innerLength > 0.5) {
        const baseLengthIndicator = measurementIndicator(
            { x: -innerLength/2, y: 0.05, z: SHEET_WIDTH/2 + 1 },
            { x: innerLength/2, y: 0.05, z: SHEET_WIDTH/2 + 1 },
            {
                color: 0x4488ff,
                mainRadius: 0.025,
                markerRadius: 0.018,
                markerLength: 0.5,
                label: `(45 - 2x) = ${formatNumber(innerLength)}`,
                labelPosition: { x: 0, y: 0.5, z: SHEET_WIDTH/2 + 1.7 }
            }
        );
        boxGroup.add(baseLengthIndicator);
        objectsMap['baseLength'] = { name: 'baseLength', mesh: baseLengthIndicator };
    }
    
    // Box base width measurement (24 - 2x) - right side
    if (innerWidth > 0.5) {
        const baseWidthIndicator = measurementIndicator(
            { x: SHEET_LENGTH/2 + 1, y: 0.05, z: -innerWidth/2 },
            { x: SHEET_LENGTH/2 + 1, y: 0.05, z: innerWidth/2 },
            {
                color: 0x4488ff,
                mainRadius: 0.025,
                markerRadius: 0.018,
                markerLength: 0.5,
                label: `(24 - 2x) = ${formatNumber(innerWidth)}`,
                labelPosition: { x: SHEET_LENGTH/2 + 2.5, y: 0.5, z: 0 }
            }
        );
        boxGroup.add(baseWidthIndicator);
        objectsMap['baseWidth'] = { name: 'baseWidth', mesh: baseWidthIndicator };
    }
    
    // Cut size measurement - top right corner
    if (cutSize > 0.2) {
        const cutIndicator = measurementIndicator(
            { x: SHEET_LENGTH/2 - cutSize, y: 0.06, z: SHEET_WIDTH/2 + 0.3 },
            { x: SHEET_LENGTH/2, y: 0.06, z: SHEET_WIDTH/2 + 0.3 },
            {
                color: 0xff6666,
                mainRadius: 0.02,
                markerRadius: 0.015,
                markerLength: 0.4,
                label: `x = ${formatNumber(cutSize)}`,
                labelPosition: { x: SHEET_LENGTH/2 - cutSize/2, y: 0.5, z: SHEET_WIDTH/2 + 1 }
            }
        );
        boxGroup.add(cutIndicator);
        objectsMap['cutSize'] = { name: 'cutSize', mesh: cutIndicator };
    }
    
    // Add text labels
    // Label for cut size 'x' on each corner
    const cornerLabelPositions = [
        { x: SHEET_LENGTH/2 - cutSize/2, z: SHEET_WIDTH/2 - cutSize/2 },
        { x: SHEET_LENGTH/2 - cutSize/2, z: -SHEET_WIDTH/2 + cutSize/2 },
        { x: -SHEET_LENGTH/2 + cutSize/2, z: SHEET_WIDTH/2 - cutSize/2 },
        { x: -SHEET_LENGTH/2 + cutSize/2, z: -SHEET_WIDTH/2 + cutSize/2 }
    ];
    
    cornerLabelPositions.forEach((pos, index) => {
        const xLabel = label('x', 
            { x: pos.x, y: 0.5, z: pos.z },
            {
                color: '#000000',
                fontSize: lessonLabelFontSize,
                scale: lessonLabelScale
            }
        );
        boxGroup.add(xLabel);
        objectsMap[`xLabel${index}`] = { name: `xLabel${index}`, mesh: xLabel };
    });
    
    // Label for base dimensions
    if (innerLength > 2 && innerWidth > 2) {
        const baseLengthLabel = label('(45 - 2x)',
            { x: 0, y: 0.5, z: 0 },
            {
                color: '#000000',
                fontSize: Math.round(lessonLabelFontSize * 0.9),
                scale: lessonLabelScale * 0.9
            }
        );
        boxGroup.add(baseLengthLabel);
        objectsMap['baseLengthLabel'] = { name: 'baseLengthLabel', mesh: baseLengthLabel };
        
        const baseWidthLabel = label('(24 - 2x)',
            { x: 0, y: 0.5, z: -3 },
            {
                color: '#000000',
                fontSize: Math.round(lessonLabelFontSize * 0.9),
                scale: lessonLabelScale * 0.9
            }
        );
        boxGroup.add(baseWidthLabel);
        objectsMap['baseWidthLabel'] = { name: 'baseWidthLabel', mesh: baseWidthLabel };
    }
    
    // Height indicator (vertical) when folded
    if (innerLength > 0.5 && innerWidth > 0.5 && cutSize > 0.2 && isFolded) {
        const heightIndicator = measurementIndicator(
            { x: innerLength/2 + 0.5, y: 0, z: innerWidth/2 },
            { x: innerLength/2 + 0.5, y: cutSize, z: innerWidth/2 },
            {
                color: 0x9966ff,
                mainRadius: 0.02,
                markerRadius: 0.015,
                markerLength: 0.4,
                label: 'h = x',
                labelPosition: { x: innerLength/2 + 1.5, y: cutSize/2, z: innerWidth/2 }
            }
        );
        boxGroup.add(heightIndicator);
        objectsMap['height'] = { name: 'height', mesh: heightIndicator };
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
 * @param {number} cutSize - Current cut size value
 */
function updateControlPanelDisplays(controlPanel, cutSize) {
    const length = SHEET_LENGTH - 2 * cutSize;
    const width = SHEET_WIDTH - 2 * cutSize;
    const volume = cutSize * length * width;
    const maxVolume = OPTIMAL_CUT * (SHEET_LENGTH - 2 * OPTIMAL_CUT) * (SHEET_WIDTH - 2 * OPTIMAL_CUT);
    
    // Box Dimensions section
    controlPanel.updateText('length-dimension',
        mathDisplay3D(
            `\\text{Length: } 45 - 2x = 45 - 2 \\cdot ${formatNumber(cutSize)} = ${formatNumber(length)} \\text{ cm}`,
            { block: true }
        )
    );
    
    controlPanel.updateText('width-dimension',
        mathDisplay3D(
            `\\text{Width: } 24 - 2x = 24 - 2 \\cdot ${formatNumber(cutSize)} = ${formatNumber(width)} \\text{ cm}`,
            { block: true }
        )
    );
    
    controlPanel.updateText('height-dimension',
        mathDisplay3D(
            `\\text{Height: } h = x = ${formatNumber(cutSize)} \\text{ cm}`,
            { block: true }
        )
    );
    
    // Volume Calculation section
    controlPanel.updateText('formula',
        mathDisplay3D(
            `V = x(45 - 2x)(24 - 2x)`,
            { block: true }
        )
    );
    
    controlPanel.updateText('formula-expanded',
        mathDisplay3D(
            `V = ${formatNumber(cutSize)} \\cdot ${formatNumber(length)} \\cdot ${formatNumber(width)} = ${formatNumber(volume, 1)} \\text{ cm}^3`,
            { block: true }
        )
    );
    
    // Optimization section
    const dVdx = 12 * cutSize * cutSize - 276 * cutSize + 1080;
    
    controlPanel.updateText('derivative',
        mathDisplay3D(
            `\\frac{dV}{dx} = 12x^2 - 276x + 1080 = ${formatNumber(dVdx, 1)}`,
            { block: true }
        )
    );
    
    controlPanel.updateText('critical-points',
        mathDisplay3D(
            `\\text{Critical points: } x = 5 \\text{ or } x = 18`,
            { block: true }
        )
    );
    
    controlPanel.updateText('feasible-point',
        mathDisplay3D(
            `\\text{Feasible: } x = 5 \\text{ (since } x < 12\\text{)}`,
            { block: true }
        )
    );
    
    // Maximum indicator with comparison
    const percentOfMax = (volume / maxVolume * 100).toFixed(0);
    if (Math.abs(cutSize - OPTIMAL_CUT) < 0.05) {
        controlPanel.updateText('max-indicator',
            mathDisplay3D(
                `\\text{Maximum: } V_{\\text{max}} = ${formatNumber(maxVolume, 1)} \\text{ cm}^3 \\text{ at } x = 5 \\quad \\color{green}{\\checkmark}`,
                { block: true }
            )
        );
    } else {
        controlPanel.updateText('max-indicator',
            mathDisplay3D(
                `\\text{Current: } ${percentOfMax}\\% \\text{ of max} \\quad (V_{\\text{max}} = ${formatNumber(maxVolume, 1)} \\text{ at } x = 5)`,
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
    // Setup coordinate system with larger viewSize for rectangular sheet
    setupCoordinateSystem(scene, {
        showAxes: false,  // Clean view without axes
        axesRange: 25,
        axesTickStep: 5,
        showGrid: false,  // No grid for cleaner visualization
        enableInteraction: true,
        viewSize: VIEW_SIZE,
        cameraPosition: { x: VIEW_SIZE * 0.6, y: VIEW_SIZE * 0.5, z: VIEW_SIZE * 0.6 },  // Camera position scales with view size
        cameraTarget: { x: 0, y: 0, z: 0 },
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
    
    controlPanel.createText('problem-line1', 
        mathDisplay3D(`\\text{Sheet: } 45 \\times 24 \\text{ cm}^2`, { block: true }),
        tightStyle
    );
    
    controlPanel.createText('problem-line2', 
        mathDisplay3D(`\\text{Cut } x \\times x \\text{ corners, maximize } V(x)`, { block: true }),
        tightStyle
    );
    
    // SECTION: Box Dimensions
    controlPanel.createText('dimensions-title',
        '<div class="step-details-title">Box Dimensions</div>',
        tightStyle
    );
    
    controlPanel.createText('length-dimension', '', tightStyle);
    controlPanel.createText('width-dimension', '', tightStyle);
    controlPanel.createText('height-dimension', '', tightStyle);
    
    // SECTION: Interactive Control
    controlPanel.createText('control-title',
        '<div class="step-details-title">Controls</div>',
        tightStyle
    );
    
    // Cut size stepper control
    const stepperControl = controlPanel.createStepperWithUnits(
        'cut-size',
        'x',
        currentCutSize,
        'cm',
        {
            title: '',
            showTitle: false,
            min: 0.1,
            max: 11.9,  // Just under width/2
            step: 0.1,
            precision: 1,
            onChange: (value) => {
                currentCutSize = value;
                
                // Clear everything except coordinate system
                cleanupLesson(scene);
                
                // Recreate with new cut size (this creates boxGroup)
                createLessonObjects(scene, currentCutSize);
                
                // Restore fold state after recreation
                if (isFolded && foldableNet) {
                    foldableNet.fold();
                }
                
                // Always recreate the graph
                graphGroup = plot(scene, {
                    sheetLength: SHEET_LENGTH,
                    sheetWidth: SHEET_WIDTH,
                    currentCutSize: currentCutSize
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
                updateControlPanelDisplays(controlPanel, currentCutSize);
                
                // Update table selection if visible
                if (volumeTable && isGraphView) {
                    volumeTable.updateSelectedCut(currentCutSize);
                }
            }
        }
    );
    
    // SECTION: Volume Calculation
    controlPanel.createText('volume-title',
        '<div class="step-details-title">Volume Calculation</div>',
        tightStyle
    );
    
    controlPanel.createText('formula', '', tightStyle);
    controlPanel.createText('formula-expanded', '', tightStyle);
    
    // SECTION: Optimization
    controlPanel.createText('optimization-title',
        '<div class="step-details-title">Optimization</div>',
        tightStyle
    );
    
    controlPanel.createText('derivative', '', tightStyle);
    controlPanel.createText('critical-points', '', tightStyle);
    controlPanel.createText('feasible-point', '', tightStyle);
    controlPanel.createText('max-indicator', '', tightStyle);
    
    // Create checkboxes for graph and fold toggles
    controlPanel.createText('button-row', 
        `<div style="display: flex; align-items: center; gap: 15px; margin: 15px 0 10px 0;">
            <label style="display: flex; align-items: center; cursor: pointer; white-space: nowrap; padding: 8px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px; font-size: 14px; font-weight: 500; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <input type="checkbox" id="view-toggle" style="margin-right: 8px; width: 18px; height: 18px; cursor: pointer;">
                <span>Show Graph</span>
            </label>
            <label style="display: flex; align-items: center; cursor: pointer; white-space: nowrap; padding: 8px 12px; background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%); border-radius: 6px; font-size: 14px; font-weight: 500; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <input type="checkbox" id="fold-toggle" style="margin-right: 8px; width: 18px; height: 18px; cursor: pointer;">
                <span>Fold Box</span>
            </label>
        </div>`,
        { margin: '0', padding: '0' }
    );
    
    // Add event listeners for the checkboxes
    setTimeout(() => {
        const viewToggle = document.getElementById('view-toggle');
        const foldToggle = document.getElementById('fold-toggle');
        
        if (viewToggle) {
            viewToggle.onchange = () => {
                isGraphView = viewToggle.checked;
                toggleView(scene);
                
                // Only swap the calculation sections with the table
                const calculationSectionIds = [
                    'text-dimensions-title', 'text-length-dimension', 'text-width-dimension', 'text-height-dimension',
                    'text-volume-title', 'text-formula', 'text-formula-expanded',
                    'text-optimization-title', 'text-derivative', 'text-critical-points', 
                    'text-feasible-point', 'text-max-indicator'
                ];
                
                if (isGraphView) {
                    // Show graph in 3D scene AND show table in place of calculations
                    calculationSectionIds.forEach(id => {
                        const element = document.getElementById(id);
                        if (element) element.style.display = 'none';
                    });
                    
                    if (volumeTable) {
                        volumeTable.show();
                        volumeTable.updateSelectedCut(currentCutSize);
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
        
        if (foldToggle) {
            foldToggle.onchange = () => {
                isFolded = foldToggle.checked;
                if (foldableNet) {
                    if (isFolded) {
                        foldableNet.fold();
                    } else {
                        foldableNet.unfold();
                    }
                }
            };
        }
    }, 0);
    
    // Create initial visualization
    createLessonObjects(scene, currentCutSize);
    
    // Create graph group
    graphGroup = plot(scene, {
        sheetLength: SHEET_LENGTH,
        sheetWidth: SHEET_WIDTH,
        currentCutSize: currentCutSize
    });
    scene.add(graphGroup);
    graphGroup.visible = false;  // Initially hidden
    
    // Create the volume table (initially hidden)
    volumeTable = createVolumeTable(controlPanel, SHEET_LENGTH, SHEET_WIDTH, OPTIMAL_CUT);
    
    // Ensure table is hidden initially since isGraphView starts as false
    if (volumeTable) {
        volumeTable.hide();
    }
    
    // Initial display update
    updateControlPanelDisplays(controlPanel, currentCutSize);
    
    // Enable Stop button to reset lesson
    scene.userData.recreateLesson = () => {
        currentCutSize = OPTIMAL_CUT;
        isGraphView = false;
        
        // Update the stepper value
        const stepperElement = document.getElementById('cut-size-value');
        if (stepperElement) {
            stepperElement.value = currentCutSize;
        }
        
        // Update the checkboxes
        const viewCheckbox = document.getElementById('view-toggle');
        if (viewCheckbox) {
            viewCheckbox.checked = false;
        }
        const foldCheckbox = document.getElementById('fold-toggle');
        if (foldCheckbox) {
            foldCheckbox.checked = false;
            isFolded = false;
        }
        
        // Hide table and show calculations
        if (volumeTable) {
            volumeTable.hide();
        }
        const calculationSectionIds = [
            'text-dimensions-title', 'text-length-dimension', 'text-width-dimension', 'text-height-dimension',
            'text-volume-title', 'text-formula', 'text-formula-expanded',
            'text-optimization-title', 'text-derivative', 'text-critical-points', 
            'text-feasible-point', 'text-max-indicator'
        ];
        calculationSectionIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = '';
        });
        
        // Recreate visualization
        cleanupLesson(scene);
        createLessonObjects(scene, currentCutSize);
        
        // Recreate graph
        graphGroup = plot(scene, {
            sheetLength: SHEET_LENGTH,
            sheetWidth: SHEET_WIDTH,
            currentCutSize: currentCutSize
        });
        scene.add(graphGroup);
        graphGroup.visible = false;
        
        updateControlPanelDisplays(controlPanel, currentCutSize);
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