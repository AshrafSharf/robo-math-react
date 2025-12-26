// {{LESSON_TITLE}} - 3D Maximization Problem
// Template following volume-max structure without paginator

import { setupCoordinateSystem } from '../common/js/native/coordinate_system.js';
import { measurementIndicator } from '../common/js/native/measurement_indicator.js';
import { label } from '../common/js/native/label.js';
import { cleanupObjects } from '../common/js/native/cleanup.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';
import { plot } from './graph.js';
import { createVolumeTable } from './table_details.js';
import * as THREE from 'three';

// Configuration constants - EXTRACT FROM step-by-step.json
const PROBLEM_SIZE = 12;  // TODO: Extract from problem statement
const OPTIMAL_VALUE = 2;  // TODO: Calculate from solution

// Store objects and state
let objectsMap = {};
let currentParameter = OPTIMAL_VALUE;  // Start at optimal
let volumeTable = null;

// Groups for different views
let mainGroup = null;
let graphGroup = null;
let isGraphView = false;

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
    if (mainGroup) {
        scene.remove(mainGroup);
        mainGroup = null;
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
 * @param {number} parameterValue - The current parameter value
 * @returns {Object} Map of created objects
 */
function createLessonObjects(scene, parameterValue) {
    // Clear and reinitialize objectsMap
    objectsMap = {};
    
    // Always create a new main group
    mainGroup = new THREE.Group();
    scene.add(mainGroup);
    
    // TODO: Extract ACTUAL VALUES from step-by-step.json
    // TODO: Create 3D visualization based on visual.png
    // TODO: Add measurement indicators
    // TODO: Add labels
    
    // Example structure (replace with actual implementation):
    // const geometry = new THREE.BoxGeometry(width, height, depth);
    // const material = new THREE.MeshPhongMaterial({
    //     color: 0x4488ff,
    //     transparent: true,
    //     opacity: 0.8
    // });
    // const mesh = new THREE.Mesh(geometry, material);
    // mainGroup.add(mesh);
    // objectsMap['mainObject'] = { name: 'mainObject', mesh: mesh };
    
    return objectsMap;
}

/**
 * Updates control panel displays with current values
 * @param {Object} controlPanel - The control panel instance
 * @param {number} parameterValue - Current parameter value
 */
function updateControlPanelDisplays(controlPanel, parameterValue) {
    // TODO: Calculate values based on parameter
    // const derived = calculateDerived(parameterValue);
    
    // Update displays
    // controlPanel.updateText('value-display',
    //     mathDisplay3D(`\\text{Value: } ${formatNumber(derived)}`, { block: true })
    // );
}

/**
 * Initializes the control panel
 * @param {Object} panel - The control panel instance
 * @param {THREE.Scene} scene - The Three.js scene
 */
function initializeControlPanel(panel, scene) {
    const tightStyle = { margin: '2px 0', padding: '2px 0', lineHeight: '1.2' };
    
    // Problem Setup Section
    panel.createText('problem-title', 
        '<div class="step-details-title">Problem Setup</div>',
        tightStyle
    );
    
    // TODO: Extract problem from step-by-step.json
    panel.createText('problem', 
        mathDisplay3D(`\\text{Problem statement here}`, { block: true }),
        tightStyle
    );
    
    // Controls Section
    panel.createText('control-title',
        '<div class="step-details-title">Controls</div>',
        tightStyle
    );
    
    // Parameter stepper control
    const stepperControl = panel.createStepperWithUnits(
        'parameter',
        'x',  // TODO: Use correct variable name
        currentParameter,
        'units',
        {
            title: '',
            showTitle: false,
            min: 0.1,
            max: PROBLEM_SIZE / 2 - 0.1,
            step: 0.1,
            precision: 1,
            onChange: (value) => {
                currentParameter = value;
                
                // Clear everything except coordinate system
                cleanupLesson(scene);
                
                // Recreate with new parameter value
                createLessonObjects(scene, currentParameter);
                
                // Always recreate the graph
                graphGroup = plot(scene, {
                    problemSize: PROBLEM_SIZE,
                    currentValue: currentParameter
                });
                scene.add(graphGroup);
                
                // Set visibility based on checkbox state
                if (mainGroup) {
                    mainGroup.visible = true;
                }
                if (graphGroup) {
                    graphGroup.visible = isGraphView;  // Only show if checkbox is checked
                }
                
                // Update displays
                updateControlPanelDisplays(panel, currentParameter);
                
                // Update table if visible
                if (volumeTable && isGraphView) {
                    volumeTable.updateSelectedValue(currentParameter);
                }
            }
        }
    );
    
    // Calculations Section
    panel.createText('calc-title',
        '<div class="step-details-title">Calculations</div>',
        tightStyle
    );
    
    // Add calculation displays
    panel.createText('formula', '', tightStyle);
    panel.createText('current-value', '', tightStyle);
    
    // Optimization Section
    panel.createText('optimization-title',
        '<div class="step-details-title">Optimization</div>',
        tightStyle
    );
    
    panel.createText('max-indicator', '', tightStyle);
    
    // Graph toggle checkbox
    panel.createText('button-row', 
        `<div style="display: flex; align-items: center; gap: 15px; margin: 15px 0 10px 0;">
            <label style="display: flex; align-items: center; cursor: pointer; white-space: nowrap; padding: 8px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px; font-size: 14px; font-weight: 500; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <input type="checkbox" id="view-toggle" style="margin-right: 8px; width: 18px; height: 18px; cursor: pointer;">
                <span>Show Graph</span>
            </label>
        </div>`,
        { margin: '0', padding: '0' }
    );
    
    // Add event listener for graph toggle
    setTimeout(() => {
        const viewToggle = document.getElementById('view-toggle');
        
        if (viewToggle) {
            viewToggle.onchange = () => {
                isGraphView = viewToggle.checked;
                
                // Toggle graph visibility
                if (graphGroup) {
                    graphGroup.visible = isGraphView;
                }
                
                // Toggle table visibility
                if (isGraphView) {
                    if (volumeTable) {
                        volumeTable.show();
                        volumeTable.updateSelectedValue(currentParameter);
                    }
                } else {
                    if (volumeTable) {
                        volumeTable.hide();
                    }
                }
            };
        }
    }, 0);
    
    // Create the table (initially hidden)
    volumeTable = createVolumeTable(panel, PROBLEM_SIZE, OPTIMAL_VALUE);
    if (volumeTable) {
        volumeTable.hide();
    }
    
    // Initial display update
    updateControlPanelDisplays(panel, currentParameter);
}

/**
 * Main render function
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {Object} controlPanel - The control panel instance
 */
export function render(scene, controlPanel) {
    // Setup coordinate system for maximization problems
    setupCoordinateSystem(scene, {
        showAxes: false,          // Clean view without axes
        axesRange: 10,
        axesTickStep: 2,
        showGrid: false,          // No grid for cleaner visualization
        enableInteraction: true,
        viewSize: 30,             // Larger view for better spacing
        cameraPosition: { x: 20, y: 18, z: 20 },
        cameraTarget: { x: 0, y: 0, z: 0 },
        lightingProfile: 'phong'
    });
    
    // Create control panel interface
    if (controlPanel) {
        initializeControlPanel(controlPanel, scene);
    }
    
    // Create initial visualization at optimal value
    createLessonObjects(scene, currentParameter);
    
    // Create graph (initially hidden)
    graphGroup = plot(scene, {
        problemSize: PROBLEM_SIZE,
        currentValue: currentParameter
    });
    scene.add(graphGroup);
    graphGroup.visible = false;  // Initially hidden
    
    // Enable Stop button to reset lesson
    scene.userData.recreateLesson = () => {
        currentParameter = OPTIMAL_VALUE;
        isGraphView = false;
        
        // Update the stepper value
        const stepperElement = document.getElementById('parameter-value');
        if (stepperElement) {
            stepperElement.value = currentParameter;
        }
        
        // Update the checkbox
        const checkboxElement = document.getElementById('view-toggle');
        if (checkboxElement) {
            checkboxElement.checked = false;
        }
        
        // Hide table
        if (volumeTable) {
            volumeTable.hide();
        }
        
        // Recreate visualization
        cleanupLesson(scene);
        createLessonObjects(scene, currentParameter);
        
        // Recreate graph (hidden)
        graphGroup = plot(scene, {
            problemSize: PROBLEM_SIZE,
            currentValue: currentParameter
        });
        scene.add(graphGroup);
        graphGroup.visible = false;
        
        updateControlPanelDisplays(controlPanel, currentParameter);
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