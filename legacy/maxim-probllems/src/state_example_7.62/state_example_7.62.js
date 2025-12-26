// Volume Maximization Problem - Clean Implementation
// Following the structure of volume-shell-y-axis without paginator

import { setupCoordinateSystem } from '../common/js/native/coordinate_system.js';
import { createFoldableBoxNet } from '../common/js/native/foldables/foldable_box_net.js';
import { measurementIndicator } from '../common/js/native/measurement_indicator.js';
import { label } from '../common/js/native/label.js';
import { cleanupObjects } from '../common/js/native/cleanup.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';
import { plot } from './graph.js';
import { createVolumeTable } from './table_details.js';
import * as THREE from 'three';

// Configuration constants
const SHEET_SIZE = 12;  // Fixed sheet size for the problem
const OPTIMAL_CUT = SHEET_SIZE / 6;  // Maximum volume occurs at sheet/6

// Store objectsMap for cleanup
let objectsMap = {};
let foldableNet = null;
let boxMesh = null;  // Separate 3D box visualization
let currentCutSize = OPTIMAL_CUT;  // Start at optimal

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
    
    // Clean up box mesh
    if (boxMesh) {
        if (boxMesh.parent) {
            boxMesh.parent.remove(boxMesh);
        }
        boxMesh = null;
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
    const viewSize = 30;  // Match the coordinate system viewSize
    const labelScaleFactor = Math.sqrt(viewSize / 15);
    const lessonLabelFontSize = Math.round(28 * labelScaleFactor);  // Slightly larger for visibility
    const lessonLabelScale = 0.03 * labelScaleFactor;  // Scale up labels
    
    // Create foldable box net with current cut size - positioned on left
    foldableNet = createFoldableBoxNet({
        sheetSize: SHEET_SIZE,
        cutSize: cutSize,
        position: { x: -8, y: 0, z: 0 },  // Move further left for better separation
        colors: {
            sheet: 0x4488ff,  // Blue sheet
            cuts: 0xffb3ba,    // Pink cut corners
            flaps: 0x4488ff    // Blue flaps
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
        showOutlines: true
    });
    
    boxGroup.add(foldableNet.group);
    
    // Add measurement indicators
    const halfSheet = SHEET_SIZE / 2;
    const innerSize = SHEET_SIZE - 2 * cutSize;
    const halfInner = innerSize / 2;
    
    // Sheet width measurement (12 units) - left side (adjusted for new position)
    const sheetWidthIndicator = measurementIndicator(
        { x: -8 - halfSheet - 0.8, y: 0.05, z: -halfSheet },
        { x: -8 - halfSheet - 0.8, y: 0.05, z: halfSheet },
        {
            color: 0x333333,
            mainRadius: 0.03,
            markerRadius: 0.02,
            markerLength: 0.6,
            label: '12',
            labelPosition: { x: -8 - halfSheet - 1.5, y: 0.5, z: 0 }
        }
    );
    boxGroup.add(sheetWidthIndicator);
    objectsMap['sheetWidth'] = { name: 'sheetWidth', mesh: sheetWidthIndicator };
    
    // Box base measurement (12 - 2x) - bottom side
    if (innerSize > 0.5) {
        const baseIndicator = measurementIndicator(
            { x: -8 - halfInner, y: 0.05, z: -halfSheet - 0.8 },
            { x: -8 + halfInner, y: 0.05, z: -halfSheet - 0.8 },
            {
                color: 0x4488ff,
                mainRadius: 0.025,
                markerRadius: 0.018,
                markerLength: 0.5,
                label: `${formatNumber(innerSize)}`,
                labelPosition: { x: -8, y: 0.5, z: -halfSheet - 1.5 }
            }
        );
        boxGroup.add(baseIndicator);
        objectsMap['baseWidth'] = { name: 'baseWidth', mesh: baseIndicator };
    }
    
    // Cut size measurement - top right corner
    if (cutSize > 0.2) {
        const cutIndicator = measurementIndicator(
            { x: -8 + halfSheet - cutSize, y: 0.06, z: halfSheet + 0.5 },
            { x: -8 + halfSheet, y: 0.06, z: halfSheet + 0.5 },
            {
                color: 0xff6666,
                mainRadius: 0.02,
                markerRadius: 0.015,
                markerLength: 0.4,
                label: `${formatNumber(cutSize)}`,
                labelPosition: { x: -8 + halfSheet - cutSize/2, y: 0.5, z: halfSheet + 1.2 }
            }
        );
        boxGroup.add(cutIndicator);
        objectsMap['cutSize'] = { name: 'cutSize', mesh: cutIndicator };
    }
    
    // Height indicator (vertical) when folded - at corner
    if (innerSize > 0.5 && cutSize > 0.2) {
        const heightIndicator = measurementIndicator(
            { x: -8 + halfInner + 0.5, y: 0, z: halfInner },
            { x: -8 + halfInner + 0.5, y: cutSize, z: halfInner },
            {
                color: 0x9966ff,
                mainRadius: 0.02,
                markerRadius: 0.015,
                markerLength: 0.4,
                label: 'h',
                labelPosition: { x: -8 + halfInner + 1.2, y: cutSize/2, z: halfInner }
            }
        );
        boxGroup.add(heightIndicator);
        objectsMap['height'] = { name: 'height', mesh: heightIndicator };
    }
    
    // Add text labels
    // Label for cut size 'x'
    const xLabel = label('x', 
        { x: -8 + halfSheet - cutSize/2, y: 0.5, z: halfSheet - cutSize/2 },
        {
            color: '#000000',
            fontSize: lessonLabelFontSize,
            scale: lessonLabelScale
        }
    );
    boxGroup.add(xLabel);
    objectsMap['xLabel'] = { name: 'xLabel', mesh: xLabel };
    
    // Label for base dimension '12 - 2x'
    if (innerSize > 2) {
        const baseLabel = label('12 - 2x',
            { x: -8, y: 0.5, z: 0 },
            {
                color: '#000000',
                fontSize: Math.round(lessonLabelFontSize * 0.9),
                scale: lessonLabelScale * 0.9
            }
        );
        boxGroup.add(baseLabel);
        objectsMap['baseLabel'] = { name: 'baseLabel', mesh: baseLabel };
    }
    
    // Create separate 3D box on the right side
    if (innerSize > 0.5 && cutSize > 0.1) {
        const boxGeometry = new THREE.BoxGeometry(innerSize, cutSize, innerSize);
        const boxMaterial = new THREE.MeshPhongMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.8,
            shininess: 30,
            specular: 0x444444
        });
        boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
        boxMesh.position.set(8, cutSize/2, 0);  // Position further right for better separation
        boxGroup.add(boxMesh);
        
        // Add edges to the box
        const edges = new THREE.EdgesGeometry(boxGeometry);
        const edgeMaterial = new THREE.LineBasicMaterial({ 
            color: 0x000000,
            linewidth: 2
        });
        const boxEdges = new THREE.LineSegments(edges, edgeMaterial);
        boxEdges.position.copy(boxMesh.position);
        boxGroup.add(boxEdges);
        objectsMap['boxEdges'] = { name: 'boxEdges', mesh: boxEdges };
        
        // Add dimension labels for the box
        const boxHeightLabel = label('x', 
            { x: 8 + innerSize/2 + 0.5, y: cutSize/2, z: 0 },
            {
                color: '#000000',
                fontSize: lessonLabelFontSize,
                scale: lessonLabelScale
            }
        );
        boxGroup.add(boxHeightLabel);
        objectsMap['boxHeightLabel'] = { name: 'boxHeightLabel', mesh: boxHeightLabel };
        
        const boxWidthLabel = label('12 - 2x',
            { x: 8, y: -0.5, z: innerSize/2 + 0.5 },
            {
                color: '#000000',
                fontSize: Math.round(lessonLabelFontSize * 0.9),
                scale: lessonLabelScale * 0.9
            }
        );
        boxGroup.add(boxWidthLabel);
        objectsMap['boxWidthLabel'] = { name: 'boxWidthLabel', mesh: boxWidthLabel };
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
    const w = SHEET_SIZE;  // Sheet width
    const baseSize = w - 2 * cutSize;
    const volume = cutSize * baseSize * baseSize;
    const maxVolume = OPTIMAL_CUT * (w - 2 * OPTIMAL_CUT) ** 2;
    
    // Box Dimensions section
    controlPanel.updateText('base-dimension',
        mathDisplay3D(
            `\\text{Base: } (12 - 2 \\cdot ${formatNumber(cutSize)})^2 = ${formatNumber(baseSize)}^2`,
            { block: true }
        )
    );
    
    controlPanel.updateText('height-dimension',
        mathDisplay3D(
            `\\text{Height: } h = x = ${formatNumber(cutSize)}`,
            { block: true }
        )
    );
    
    // Volume Calculation section
    controlPanel.updateText('formula',
        mathDisplay3D(
            `V = x(w - 2x)^2 = x(12 - 2x)^2`,
            { block: true }
        )
    );
    
    controlPanel.updateText('formula-expanded',
        mathDisplay3D(
            `V = ${formatNumber(cutSize)} \\cdot (${formatNumber(baseSize)})^2 = ${formatNumber(cutSize)} \\cdot ${formatNumber(baseSize * baseSize)}`,
            { block: true }
        )
    );
    
    controlPanel.updateText('volume-value',
        mathDisplay3D(
            `V = ${formatNumber(volume, 1)} \\text{ cubic units}`,
            { block: true }
        )
    );
    
    // Optimization section
    const dVdx = (w - 2 * cutSize) * (w - 6 * cutSize);
    
    controlPanel.updateText('derivative',
        mathDisplay3D(
            `\\frac{dV}{dx} = (w - 2x)(w - 6x)\\\\= (12 - 2 \\cdot ${formatNumber(cutSize)})(12 - 6 \\cdot ${formatNumber(cutSize)}) = ${formatNumber(dVdx, 1)}`,
            { block: true }
        )
    );
    
    controlPanel.updateText('critical-point',
        mathDisplay3D(
            `\\text{Critical point: } \\frac{dV}{dx} = 0 \\Rightarrow x = \\frac{w}{6} = \\frac{12}{6} = 2`,
            { block: true }
        )
    );
    
    // Maximum indicator with comparison
    const percentOfMax = (volume / maxVolume * 100).toFixed(0);
    if (Math.abs(cutSize - OPTIMAL_CUT) < 0.05) {
        controlPanel.updateText('max-indicator',
            mathDisplay3D(
                `\\text{Maximum: } V_{\\text{max}} = ${formatNumber(maxVolume, 1)} \\text{ at } x = 2 \\quad \\color{green}{\\checkmark}`,
                { block: true }
            )
        );
    } else {
        controlPanel.updateText('max-indicator',
            mathDisplay3D(
                `\\text{Current: } ${percentOfMax}\\% \\text{ of max} \\quad (V_{\\text{max}} = ${formatNumber(maxVolume, 1)} \\text{ at } x = 2)`,
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
    // Setup coordinate system with larger viewSize for 12x12 sheet
    setupCoordinateSystem(scene, {
        showAxes: false,  // Clean view without axes
        axesRange: 10,
        axesTickStep: 2,
        showGrid: false,  // No grid for cleaner visualization
        enableInteraction: true,
        viewSize: 30,  // Even larger view for better spacing
        cameraPosition: { x: 20, y: 18, z: 20 },  // Adjusted for larger view
        cameraTarget: { x: 0, y: 0, z: 0 },
        lightingProfile: 'phong'
    });
    
    // Tight style for consistent spacing (matching volume-disk-y-axis)
    const tightStyle = { margin: '2px 0', padding: '2px 0', lineHeight: '1.2' };
    
    // Create control panel interface
    // SECTION: Problem Setup
    controlPanel.createText('problem-title', 
        '<div class="step-details-title">Problem Setup</div>',
        tightStyle
    );
    
    controlPanel.createText('problem', 
        mathDisplay3D(`\\text{Square sheet: } w = 12 \\text{ units}`, { block: true }),
        tightStyle
    );
    
    controlPanel.createText('cut-description',
        mathDisplay3D(`\\text{Cut size: } x \\text{ (from each corner)}`, { block: true }),
        tightStyle
    );
    
    controlPanel.createText('base-dimension', '', tightStyle);
    controlPanel.createText('height-dimension', '', tightStyle);
    
    // SECTION: Interactive Control
    controlPanel.createText('control-title',
        '<div class="step-details-title">Controls</div>',
        tightStyle
    );
    
    // Cut size stepper control (keep it centered)
    const stepperControl = controlPanel.createStepperWithUnits(
        'cut-size',
        'x',
        currentCutSize,
        'units',
        {
            title: '',
            showTitle: false,
            min: 0.1,
            max: 5.9,  // Just under sheet/2
            step: 0.1,
            precision: 1,
            onChange: (value) => {
                currentCutSize = value;
                
                // Clear everything except coordinate system
                cleanupLesson(scene);
                
                // Recreate with new cut size (this creates boxGroup)
                createLessonObjects(scene, currentCutSize);
                
                // Always recreate the graph
                graphGroup = plot(scene, {
                    sheetSize: SHEET_SIZE,
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
    controlPanel.createText('volume-value', '', tightStyle);
    
    // SECTION: Optimization
    controlPanel.createText('optimization-title',
        '<div class="step-details-title">Optimization</div>',
        tightStyle
    );
    
    controlPanel.createText('derivative', '', tightStyle);
    controlPanel.createText('critical-point', '', tightStyle);
    controlPanel.createText('max-indicator', '', tightStyle);
    
    // Create both button and checkbox in a single HTML container
    controlPanel.createText('button-row', 
        `<div style="display: flex; align-items: center; gap: 15px; margin: 15px 0 10px 0;">
            <button id="fold-button" style="flex: 1; padding: 10px; background: #4488ff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 15px; font-weight: 500;">📦 Fold</button>
            <label style="display: flex; align-items: center; cursor: pointer; white-space: nowrap; padding: 8px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px; font-size: 14px; font-weight: 500; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <input type="checkbox" id="view-toggle" style="margin-right: 8px; width: 18px; height: 18px; cursor: pointer;">
                <span>Show Graph</span>
            </label>
        </div>`,
        { margin: '0', padding: '0' }
    );
    
    // Add event listeners after the elements are created
    setTimeout(() => {
        const foldButton = document.getElementById('fold-button');
        const viewToggle = document.getElementById('view-toggle');
        
        if (foldButton) {
            foldButton.onclick = () => {
                if (foldableNet) {
                    foldableNet.toggle(() => {
                        const isFolded = foldableNet.isFolded();
                        foldButton.textContent = isFolded ? '📋 Unfold' : '📦 Fold';
                    });
                }
            };
        }
        
        if (viewToggle) {
            viewToggle.onchange = () => {
                isGraphView = viewToggle.checked;
                toggleView(scene);
                
                // Only swap the calculation sections with the table
                // Keep all other elements (title, problem setup, controls, buttons) visible
                const calculationSectionIds = [
                    'text-base-dimension', 'text-height-dimension',
                    'text-volume-title', 'text-formula', 'text-formula-expanded', 'text-volume-value',
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
    }, 0);
    
    // Create initial visualization
    createLessonObjects(scene, currentCutSize);
    
    // Create graph group
    graphGroup = plot(scene, {
        sheetSize: SHEET_SIZE,
        currentCutSize: currentCutSize
    });
    scene.add(graphGroup);
    graphGroup.visible = false;  // Initially hidden
    
    // Create the volume table (initially hidden)
    volumeTable = createVolumeTable(controlPanel, SHEET_SIZE, OPTIMAL_CUT);
    
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
            'text-base-dimension', 'text-height-dimension',
            'text-volume-title', 'text-formula', 'text-formula-expanded', 'text-volume-value',
            'text-optimization-title', 'text-derivative', 'text-critical-point', 'text-max-indicator'
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
            sheetSize: SHEET_SIZE,
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