// Direction Cosines 3D Visualization
// Uses new Diagram API for all geometric elements
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { Diagram } from '../common/js/diagram.js';
import { AnimatedDiagram } from '../common/js/animated_diagram.js';
import { createPaginator } from '../common/js/paginator.js';
import { StepDetails } from './step_details.js';
import { getAllDescriptions } from './step_descriptions.js';
import { normalize, magnitude } from '../common/js/lhs/lhs_geometry_utils.js';

// Store references
let scene;
let staticDiagram;
let animatedDiagram;
let paginatorInstance = null;
let stepDetails = null;

// Shared data structures for paginator
let stepsArray = [];
let stepDescriptions = {};

// Vector components from step-by-step.json concept
const vectorComponents = { x: 3, y: 4, z: 2 };

// Generator function for rendering diagram step by step
function* renderDiagram(diagram) {
    // Calculate derived values
    const vectorMagnitude = magnitude(vectorComponents);
    const normalizedVector = normalize(vectorComponents);
    
    // Calculate direction cosines
    const cosAlpha = vectorComponents.x / vectorMagnitude;
    const cosBeta = vectorComponents.y / vectorMagnitude;
    const cosGamma = vectorComponents.z / vectorMagnitude;
    
    // === STEP 1: Main vector v ===
    const mainVector = diagram.vector(
        { x: 0, y: 0, z: 0 },
        vectorComponents,
        '\\vec{v}',
        'purple',
        {
            shaftRadius: 0.06,
            headRadius: 0.15,
            headLength: 0.3,
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('main_vector');
    yield;
    
    // === STEP 2: Unit vector i (x-axis) ===
    const unitI = diagram.dashedVector(
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        '\\hat{i}',
        'red',
        {
            dashSize: 0.15,
            gapSize: 0.08,
            shaftRadius: 0.02,
            headRadius: 0.08,
            headLength: 0.15,
            labelOffset: { x: 0.2, y: 0.2, z: 0 },
            isLatex: true
        }
    );
    stepsArray.push('unit_i');
    yield;
    
    // === STEP 3: Unit vector j (y-axis) ===
    const unitJ = diagram.dashedVector(
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        '\\hat{j}',
        'green',
        {
            dashSize: 0.15,
            gapSize: 0.08,
            shaftRadius: 0.02,
            headRadius: 0.08,
            headLength: 0.15,
            labelOffset: { x: 0.2, y: 0.2, z: 0 },
            isLatex: true
        }
    );
    stepsArray.push('unit_j');
    yield;
    
    // === STEP 4: Unit vector k (z-axis) ===
    const unitK = diagram.dashedVector(
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 0, z: 1 },
        '\\hat{k}',
        'blue',
        {
            dashSize: 0.15,
            gapSize: 0.08,
            shaftRadius: 0.02,
            headRadius: 0.08,
            headLength: 0.15,
            labelOffset: { x: 0, y: 0.2, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('unit_k');
    yield;
    
    // === STEP 5: Angle α between v and i-axis ===
    const alphaArc = diagram.arcByThreePoints(
        { x: 1.5, y: 0, z: 0 },
        { x: 0, y: 0, z: 0 },
        { x: normalizedVector.x * 1.5, y: normalizedVector.y * 1.5, z: normalizedVector.z * 1.5 },
        '\\alpha',
        'orange',
        {
            radius: 1.5,
            labelOffset: { x: 0.1, y: 0.1, z: 0 },
            isLatex: true
        }
    );
    stepsArray.push('angle_alpha');
    yield;
    
    // === STEP 6: Angle β between v and j-axis ===
    const betaArc = diagram.arcByThreePoints(
        { x: 0, y: 1.5, z: 0 },
        { x: 0, y: 0, z: 0 },
        { x: normalizedVector.x * 1.5, y: normalizedVector.y * 1.5, z: normalizedVector.z * 1.5 },
        '\\beta',
        'cyan',
        {
            radius: 2.0,
            labelOffset: { x: 0.1, y: 0.1, z: 0 },
            isLatex: true
        }
    );
    stepsArray.push('angle_beta');
    yield;
    
    // === STEP 7: Angle γ between v and k-axis ===
    const gammaArc = diagram.arcByThreePoints(
        { x: 0, y: 0, z: 1.5 },
        { x: 0, y: 0, z: 0 },
        { x: normalizedVector.x * 1.5, y: normalizedVector.y * 1.5, z: normalizedVector.z * 1.5 },
        '\\gamma',
        'magenta',
        {
            radius: 2.5,
            labelOffset: { x: 0.1, y: 0.1, z: 0 },
            isLatex: true
        }
    );
    stepsArray.push('angle_gamma');
    yield;
    
    // === STEP 8: Focus on all angles together ===
    diagram.focus([alphaArc, betaArc, gammaArc], 0.05);
    stepsArray.push('all_angles_focus');
    yield;
    diagram.restore();
    
    // === STEP 9: Unit vector in direction of v ===
    const unitV = diagram.dashedVector(
        { x: 0, y: 0, z: 0 },
        normalizedVector,
        '\\hat{v}',
        'purple',
        {
            dashSize: 0.15,
            gapSize: 0.08,
            shaftRadius: 0.02,
            headRadius: 0.08,
            headLength: 0.15,
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('unit_v');
    yield;
    
    // === STEP 10: Complete visualization ===
    stepsArray.push('complete');
    yield;
}

export function render(sceneInstance, panel) {
    scene = sceneInstance;
    
    // Setup 3D coordinate system
    setupCoordinateSystem(scene, {
        showAxes: true,
        axesRange: 10,
        axesTickStep: 2,
        showGrid: false,
        enableInteraction: true,
        cameraPosition: { x: -15, y: 12, z: -15 },
        cameraTarget: { x: 0, y: 0, z: 0 },
        lightingProfile: 'phong'
    });
    
    // Reset arrays
    stepsArray = [];
    stepDescriptions = getAllDescriptions();
    
    // Initialize step details panel if provided
    if (panel) {
        stepDetails = new StepDetails(panel);
    }
    
    // Create diagrams
    staticDiagram = new Diagram(scene);
    animatedDiagram = new AnimatedDiagram(scene);
    
    // Set up generator functions
    staticDiagram.renderGenerator = function() {
        stepsArray.length = 0;
        return renderDiagram(this);
    };
    
    animatedDiagram.renderGenerator = function() {
        return renderDiagram(this);
    };
    
    // Create paginator
    paginatorInstance = createPaginator(animatedDiagram, staticDiagram, stepsArray, stepDescriptions, (stepName) => {
        if (stepDetails) {
            stepDetails.highlightDetails(stepName);
        }
    });
    
    // Render static diagram
    paginatorInstance.renderStaticDiagram();
}

export function cleanup() {
    if (stepDetails) {
        stepDetails.reset();
    }
    
    if (paginatorInstance) {
        paginatorInstance.dispose();
        paginatorInstance = null;
    }
    
    stepDetails = null;
}