// Vector Subtraction in 3D
// Uses Diagram API for all geometric elements
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { addVectors, scaleVector } from '../common/js/lhs/lhs_geometry_utils.js';
import { Diagram } from '../common/js/diagram.js';
import { AnimatedDiagram } from '../common/js/animated_diagram.js';
import { createPaginator } from '../common/js/paginator.js';
import { StepDetails } from './step_details.js';
import { getAllDescriptions } from './step_descriptions.js';

// Store references
let scene;
let staticDiagram;
let animatedDiagram;
let paginatorInstance = null;
let stepDetails = null;

// Shared data structures for paginator
let stepsArray = [];
let stepDescriptions = {};

// Extract values from step-by-step.json
const vectorU = { x: 4, y: 2, z: 3 };  // u = ⟨4, 2, 3⟩
const vectorV = { x: 2, y: 4, z: 1 };  // v = ⟨2, 4, 1⟩
const vectorNegV = { x: -2, y: -4, z: -1 };  // -v = ⟨-2, -4, -1⟩
const resultVector = { x: 2, y: -2, z: 2 };  // u - v = ⟨2, -2, 2⟩

// Generator function for rendering diagram step by step
function* renderDiagram(diagram) {
    const origin = { x: 0, y: 0, z: 0 };
    
    // === STEP 1: Draw the first vector u from the origin (blue) ===
    const vectorUMesh = diagram.vector(origin, vectorU, '\\vec{u}', 'blue', {
        labelOffset: { x: 0.5, y: 0.6, z: 0.2 }
    });
    
    stepsArray.push('vector_u');
    yield;
    
    // === STEP 2: Draw the second vector v from the origin (green) ===
    const vectorVMesh = diagram.vector(origin, vectorV, '\\vec{v}', 'green', {
        labelOffset: { x: 0.5, y: 0.6, z: 0.2 }
    });
    
    stepsArray.push('vector_v');
    yield;
    
    // === STEP 3: Use reverseVector to show -v (v flipped in opposite direction) ===
    // This demonstrates that -v is literally v reversed/flipped
    const vectorNegVMesh = diagram.reverseVector(
        {start: origin, end: vectorV},  // Pass the original vector's coordinates
        {
            label: '-\\vec{v}',
            color: 'red',
            labelOffset: { x: 0.6, y: 0.7, z: 0.3 },
            animationDuration: 1.5  // Longer duration for clearer animation
        }
    );
    
    stepsArray.push('negative_v');
    yield;
    
    // === STEP 4: Move -v to the tip of u ===
    // This shows the tip-to-tail arrangement for addition
    const vectorNegVTranslated = diagram.shiftToVector(
        {start: origin, end: vectorNegV},  // -v goes from origin to vectorNegV
        vectorU,                            // Move it to the tip of u
        {
            label: '-\\vec{v}',             // Pass the label for the moved vector
            color: 'red',
            animationDuration: 1.0,
            labelOffset: { x: 0.6, y: 0.7, z: 0.3 }
        }
    );
    
    stepsArray.push('translate_neg_v');
    yield;
    
    // === STEP 5: Show u - v as vector from origin to tip of translated -v ===
    // u + (-v) gives us the result from origin
    const vectorResultMesh = diagram.vector(origin, resultVector, '\\vec{u} - \\vec{v}', 'purple', {
        labelOffset: { x: 0.6, y: -0.5, z: 0.4 }
    });
    
    stepsArray.push('result_vector');
    yield;
    
    // === STEP 6: Move the result vector to show it from tip of v to tip of u ===
    // This shows the direct geometric interpretation: u - v points from v to u
    const vectorDifferenceDirectMoved = diagram.shiftToVector(
        {start: origin, end: resultVector},  // The result vector u - v
        vectorV,                              // Move it to start at the tip of v
        {
            label: '\\vec{u} - \\vec{v}',
            color: 'orange',
            animationDuration: 1.0,
            labelOffset: { x: 0.2, y: 0.8, z: 0.3 }
        }
    );
    
    stepsArray.push('difference_direct');
    yield;
    
    // === STEP 7: Focus on key elements ===
    const keyElements = [
        vectorUMesh,
        vectorVMesh,
        vectorNegVMesh,
        vectorNegVTranslated,
        vectorResultMesh,
        vectorDifferenceDirectMoved
    ];
    
    // Focus on the key elements
    diagram.focus(keyElements, 0.2, 0.3);
    stepsArray.push('focus_key');
    yield;
    
    // === STEP 8: Restore all elements ===
    diagram.restore(0.3);
    stepsArray.push('restore_all');
    yield;
}

// Main render function that sets up the scene and diagrams
export function render(sceneInstance, panel) {
    // Store scene reference
    scene = sceneInstance;
    
    // Setup 3D coordinate system
    setupCoordinateSystem(scene, {
        showAxes: true,
        axesRange: 8,
        axesTickStep: 2,
        showGrid: true,
        enableInteraction: true,
        cameraPosition: { x: -12, y: 10, z: -12 },
        cameraTarget: { x: 1, y: 0, z: 1 }
    });
    
    // Reset shared arrays for fresh start
    stepsArray = [];
    stepDescriptions = getAllDescriptions();
    
    // Create step details handler if panel exists
    if (panel) {
        stepDetails = new StepDetails(panel);
    }
    
    // Create static and animated diagrams
    staticDiagram = new Diagram(scene);
    animatedDiagram = new AnimatedDiagram(scene);
    
    // Set up render generators
    staticDiagram.renderGenerator = function() {
        stepsArray.length = 0;
        return renderDiagram(this);
    };
    
    animatedDiagram.renderGenerator = function() {
        return renderDiagram(this);
    };
    
    // Create paginator with callback for step highlighting
    paginatorInstance = createPaginator(animatedDiagram, staticDiagram, stepsArray, stepDescriptions, (stepName) => {
        if (stepDetails) {
            stepDetails.highlightDetails(stepName);
        }
    });
    
    // Render the static diagram initially
    paginatorInstance.renderStaticDiagram();
}

// Reset function to clean up
export function reset() {
    if (paginatorInstance) {
        paginatorInstance.cleanup();
        paginatorInstance = null;
    }
    
    if (staticDiagram) {
        staticDiagram.clearAll();
    }
    
    if (animatedDiagram) {
        animatedDiagram.clearAll();
    }
    
    if (stepDetails) {
        stepDetails.reset();
        stepDetails = null;
    }
    
    stepsArray = [];
    stepDescriptions = {};
}