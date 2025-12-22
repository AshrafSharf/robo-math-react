// Torque 3D Visualization
// Uses Diagram API for all geometric elements
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { Diagram } from '../common/js/diagram.js';
import { AnimatedDiagram } from '../common/js/animated_diagram.js';
import { createPaginator } from '../common/js/paginator.js';
import { StepDetails } from './step_details.js';
import { getAllDescriptions } from './step_descriptions.js';

// Import geometry utilities
import { crossProduct, magnitude, normalize, addVectors, scaleVector } from '../common/js/lhs/lhs_geometry_utils.js';

// Store references
let scene;
let staticDiagram;
let animatedDiagram;
let paginatorInstance = null;
let stepDetails = null;

// Shared data structures for paginator
let stepsArray = [];
let stepDescriptions = {};

// Values from step-by-step.json
const pointA = { x: 2, y: 0, z: -1 };  // Point about which torque is calculated
const origin = { x: 0, y: 0, z: 0 };   // Force line passes through origin
const forceF = { x: 2, y: 1, z: -1 };  // Force vector F = 2i + j - k

// Generator function for rendering diagram step by step
function* renderDiagram(diagram) {
    // Calculate derived values
    // Position vector OA
    const positionOA = pointA;  // OA = 2i - k
    
    // Vector r from A to O (for torque calculation)
    const vectorAO = { x: -2, y: 0, z: 1 };  // AO = -OA = -2i + k
    
    // Calculate torque: τ = r × F
    const torque = crossProduct(vectorAO, forceF);
    // τ = (-2, 0, 1) × (2, 1, -1) = (-1, 0, -2)
    
    // Calculate magnitude of torque
    const torqueMagnitude = magnitude(torque);
    
    // Calculate direction cosines
    const dirCosL = torque.x / torqueMagnitude;
    const dirCosM = torque.y / torqueMagnitude;
    const dirCosN = torque.z / torqueMagnitude;
    
    // === STEP 1: Point A about which torque is calculated ===
    const pointAObj = diagram.point3d(pointA, 'A', 'yellow', {
        labelOffset: { x: 0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('point_a');
    yield;
    
    // === STEP 2: Position vector OA from origin to point A ===
    const posVecOA = diagram.vector(
        origin,
        pointA,
        '\\vec{OA}',
        'purple',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true,
            labelColor: 'black'
        }
    );
    stepsArray.push('position_vector_oa');
    yield;
    
    // === STEP 3: Vector r from A to O (for torque calculation) ===
    const vecAO = diagram.vector(
        pointA,
        origin,
        '\\vec{r}',
        'cyan',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: -0.3, y: 0.3, z: 0 },
            isLatex: true,
            labelColor: 'black'
        }
    );
    stepsArray.push('vector_r_ao');
    yield;
    
    // === STEP 4: Force vector F at origin ===
    // Show force vector from origin (line of action passes through origin)
    const forceEnd = addVectors(origin, scaleVector(forceF, 2));
    const forceVec = diagram.vector(
        origin,
        forceEnd,
        '\\vec{F}',
        'red',
        {
            shaftRadius: 0.05,
            headRadius: 0.15,
            headLength: 0.3,
            labelOffset: { x: 0.3, y: 0.3, z: 0.2 },
            isLatex: true,
            labelColor: 'black'
        }
    );
    stepsArray.push('force_vector');
    yield;
    
    // === STEP 5: Line of action of force (extended) ===
    // Show the line of action extending in both directions
    const lineStart = addVectors(origin, scaleVector(forceF, -3));
    const lineEnd = addVectors(origin, scaleVector(forceF, 3));
    const lineOfAction = diagram.dashedLine3d(lineStart, lineEnd, '', 'red', {
        dashSize: 0.2,
        gapSize: 0.1
    });
    stepsArray.push('line_of_action');
    yield;
    
    // === STEP 6: Unit vectors for reference ===
    // Show unit i vector
    const unitI = diagram.dashedVector(
        origin,
        { x: 1, y: 0, z: 0 },
        '\\hat{i}',
        'orange',
        {
            dashSize: 0.15,
            gapSize: 0.08,
            shaftRadius: 0.02,
            headRadius: 0.08,
            headLength: 0.15,
            labelOffset: { x: 0.2, y: 0.2, z: 0 },
            isLatex: true,
            labelColor: 'black'
        }
    );
    stepsArray.push('unit_i');
    yield;
    
    // === STEP 7: Unit j vector ===
    const unitJ = diagram.dashedVector(
        origin,
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
            isLatex: true,
            labelColor: 'black'
        }
    );
    stepsArray.push('unit_j');
    yield;
    
    // === STEP 8: Unit k vector ===
    const unitK = diagram.dashedVector(
        origin,
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
            isLatex: true,
            labelColor: 'black'
        }
    );
    stepsArray.push('unit_k');
    yield;
    
    // === STEP 9: Torque vector τ = r × F ===
    // Scale torque for visibility
    const torqueEnd = addVectors(pointA, scaleVector(torque, 2));
    const torqueVec = diagram.vector(
        pointA,
        torqueEnd,
        '\\vec{\\tau}',
        'magenta',
        {
            shaftRadius: 0.06,
            headRadius: 0.18,
            headLength: 0.35,
            labelOffset: { x: 0.3, y: 0.3, z: 0.3 },
            isLatex: true,
            labelColor: 'black'
        }
    );
    stepsArray.push('torque_vector');
    yield;
    
    // === STEP 10: Focus on cross product (r × F) ===
    diagram.focus([vecAO, forceVec, torqueVec], 0.05);
    stepsArray.push('cross_product_focus');
    yield;
    diagram.restore();
    
    // === STEP 11: Show torque components parallel to axes ===
    // Create parallel copies of torque vector at origin to show direction cosines
    const torqueNormalized = normalize(torque);
    const torqueAtOrigin = diagram.vector(
        origin,
        scaleVector(torqueNormalized, 3),
        '\\vec{\\tau}',
        'magenta',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.3, y: -0.3, z: 0.3 },
            isLatex: true,
            labelColor: 'black'
        }
    );
    stepsArray.push('torque_at_origin');
    yield;
    
    // === STEP 12: Angle between τ and i-axis (for direction cosine l) ===
    const angleAlpha = diagram.arcByThreePoints(
        { x: 1.5, y: 0, z: 0 },
        origin,
        { x: torqueNormalized.x * 1.5, y: torqueNormalized.y * 1.5, z: torqueNormalized.z * 1.5 },
        '\\alpha',
        'orange',
        {
            radius: 0.8,
            labelOffset: { x: 0.1, y: 0.1, z: 0 },
            isLatex: true,
            labelColor: 'black'
        }
    );
    stepsArray.push('angle_alpha');
    yield;
    
    // === STEP 13: Angle between τ and k-axis (for direction cosine n) ===
    const angleGamma = diagram.arcByThreePoints(
        { x: 0, y: 0, z: 1.5 },
        origin,
        { x: torqueNormalized.x * 1.5, y: torqueNormalized.y * 1.5, z: torqueNormalized.z * 1.5 },
        '\\gamma',
        'blue',
        {
            radius: 1.0,
            labelOffset: { x: 0.1, y: 0.1, z: 0.1 },
            isLatex: true,
            labelColor: 'black'
        }
    );
    stepsArray.push('angle_gamma');
    yield;
    
    // === STEP 14: Focus on direction angles ===
    diagram.focus([angleAlpha, angleGamma, torqueAtOrigin], 0.05);
    stepsArray.push('direction_angles_focus');
    yield;
    diagram.restore();
    
    // === STEP 15: Complete visualization ===
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