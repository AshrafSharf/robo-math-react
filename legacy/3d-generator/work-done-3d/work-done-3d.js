// Work-done-3d - 3D Visualization
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { Diagram } from '../common/js/diagram.js';
import { AnimatedDiagram } from '../common/js/animated_diagram.js';
import { createPaginator } from '../common/js/paginator.js';
import { StepDetails } from './step_details.js';
import { getAllDescriptions } from './step_descriptions.js';

// Import geometry utilities if needed
import { crossProduct, magnitude, normalize, subtractVectors, addVectors, scaleVector } from '../common/js/lhs/lhs_geometry_utils.js';

let scene;
let staticDiagram, animatedDiagram;
let stepsArray = [];
let stepDescriptions = {};
let stepDetails;
let paginatorInstance;

// Generator function for step-by-step visualization
function* renderDiagram(diagram) {
    // Clear any previous elements
    diagram.clear();
    
    // Extract values from step-by-step.json
    // Force vectors
    const force1 = { x: 3, y: -2, z: 2 };
    const force2 = { x: 2, y: 1, z: -1 };
    
    // Resultant force (F1 + F2)
    const resultantForce = { 
        x: force1.x + force2.x,  // 5
        y: force1.y + force2.y,  // -1
        z: force1.z + force2.z   // 1
    };
    
    // Initial and final positions
    const pointA = { x: 1, y: 3, z: -1 };
    const lambda = -4;  // The value we solve for
    const pointB = { x: 4, y: -1, z: lambda };
    
    // Displacement vector
    const displacement = subtractVectors(pointB, pointA);  // (3, -4, -3)
    
    // Origin for force vectors
    const origin = { x: 0, y: 0, z: 0 };
    
    // === STEP 1: Show initial position A ===
    const posA = diagram.point3d(pointA, 'A', 'yellow', {
        radius: 0.15,
        labelOffset: { x: 0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('initial_position');
    yield;
    
    // === STEP 2: Show final position B ===
    const posB = diagram.point3d(pointB, 'B', 'orange', {
        radius: 0.15,
        labelOffset: { x: 0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('final_position');
    yield;
    
    // === STEP 3: Show first force vector F1 ===
    const f1End = scaleVector(normalize(force1), 2.5);  // Scale for visibility
    const vecF1 = diagram.vector(
        origin,
        f1End,
        '\\vec{F}_1',
        'blue',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.3, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('force_vector_1');
    yield;
    
    // === STEP 4: Show second force vector F2 ===
    const f2End = scaleVector(normalize(force2), 2.5);  // Scale for visibility
    const vecF2 = diagram.vector(
        origin,
        f2End,
        '\\vec{F}_2',
        'cyan',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: -0.3, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('force_vector_2');
    yield;
    
    // === STEP 5: Show resultant force F = F1 + F2 ===
    const fResultEnd = scaleVector(normalize(resultantForce), 3);  // Scale for visibility
    const vecFResult = diagram.vector(
        origin,
        fResultEnd,
        '\\vec{F}',
        'red',
        {
            shaftRadius: 0.05,
            headRadius: 0.15,
            headLength: 0.3,
            labelOffset: { x: 0.3, y: 0.3, z: 0.3 },
            isLatex: true
        }
    );
    stepsArray.push('resultant_force');
    yield;
    
    // === STEP 6: Focus on force addition (F1 + F2 = F) ===
    diagram.focus([vecF1, vecF2, vecFResult], 0.05);
    stepsArray.push('force_addition_focus');
    yield;
    diagram.restore();
    
    // === STEP 7: Show displacement vector from A to B ===
    const vecDisplacement = diagram.vector(
        pointA,
        pointB,
        '\\vec{d}',
        'green',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.3, y: -0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('displacement_vector');
    yield;
    
    // === STEP 8: Show parallel indicators for force and displacement directions ===
    // Show the angle relationship between F and d for work calculation
    // Create copies at a common point to visualize the angle
    const commonOrigin = { x: -3, y: 2, z: 3 };
    
    // Parallel copy of resultant force
    const parallelF = diagram.vector(
        commonOrigin,
        addVectors(commonOrigin, scaleVector(normalize(resultantForce), 2.5)),
        '\\vec{F}',
        'red',
        {
            shaftRadius: 0.03,
            headRadius: 0.10,
            headLength: 0.2,
            labelOffset: { x: 0.3, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    
    // Parallel copy of displacement
    const parallelD = diagram.vector(
        commonOrigin,
        addVectors(commonOrigin, scaleVector(normalize(displacement), 2.5)),
        '\\vec{d}',
        'green',
        {
            shaftRadius: 0.03,
            headRadius: 0.10,
            headLength: 0.2,
            labelOffset: { x: -0.3, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    
    stepsArray.push('parallel_vectors_for_angle');
    yield;
    
    // === STEP 9: Show angle between F and d ===
    // Calculate angle for arc
    const dotProd = (resultantForce.x * displacement.x + 
                     resultantForce.y * displacement.y + 
                     resultantForce.z * displacement.z);
    const magF = magnitude(resultantForce);
    const magD = magnitude(displacement);
    const cosTheta = dotProd / (magF * magD);
    const theta = Math.acos(cosTheta);
    
    // Show angle arc between the parallel vectors
    const arcEnd1 = addVectors(commonOrigin, scaleVector(normalize(resultantForce), 1.5));
    const arcEnd2 = addVectors(commonOrigin, scaleVector(normalize(displacement), 1.5));
    
    const angleArc = diagram.arcByThreePoints(
        arcEnd1,
        commonOrigin,
        arcEnd2,
        '\\theta',
        'magenta',
        {
            radius: 1.5,
            isLatex: true
        }
    );
    
    stepsArray.push('angle_between_vectors');
    yield;
    
    // === STEP 10: Focus on work calculation (F · d) ===
    diagram.focus([vecFResult, vecDisplacement], 0.05);
    stepsArray.push('work_calculation_focus');
    yield;
    diagram.restore();
    
    // === STEP 11: Show work done visualization ===
    // Show the scalar projection concept with a dashed line
    const projectionLength = dotProd / magD;  // Projection of F onto d
    const normalizedDisp = normalize(displacement);
    const projectionEnd = addVectors(pointA, scaleVector(normalizedDisp, Math.abs(projectionLength)));
    
    // Draw a dashed line to show the projection
    const projectionLine = diagram.dashedLine3d(
        pointA,
        projectionEnd,
        '',
        'orange',
        {
            dashSize: 0.2,
            gapSize: 0.1
        }
    );
    
    // Add label for the projection
    const projLabel = diagram.label(
        addVectors(pointA, scaleVector(normalizedDisp, Math.abs(projectionLength) / 2)),
        'F_{\\parallel d}',
        { color: 'black', isLatex: true }
    );
    
    stepsArray.push('work_projection');
    yield;
    
    // === STEP 12: Final result with λ = -4 ===
    // Highlight the final position with the solved value
    diagram.focus([posB], 0.05);
    
    // Add label showing λ = -4
    diagram.label(
        { x: pointB.x + 0.5, y: pointB.y - 0.5, z: pointB.z },
        '\\lambda = -4',
        { color: 'black', isLatex: true }
    );
    
    stepsArray.push('final_result');
    yield;
    diagram.restore();
}

/**
 * Renders the Work-done-3d visualization
 * @param {Object} sceneInstance - The 3D scene
 * @param {Object} panel - The control panel
 */
export function render(sceneInstance, panel) {
    scene = sceneInstance;
    
    // Setup coordinate system
    setupCoordinateSystem(scene, {
        showAxes: true,
        axesRange: 10,
        axesTickStep: 2,
        showGrid: false,
        enableInteraction: true,
        cameraPosition: { x: 12, y: 10, z: -15 },
        cameraTarget: { x: 0, y: 0, z: 0 }
    });
    
    stepsArray = [];
    stepDescriptions = getAllDescriptions();
    
    if (panel) {
        stepDetails = new StepDetails(panel);
    }
    
    staticDiagram = new Diagram(scene);
    animatedDiagram = new AnimatedDiagram(scene);
    
    staticDiagram.renderGenerator = function() {
        stepsArray.length = 0;
        return renderDiagram(this);
    };
    
    animatedDiagram.renderGenerator = function() {
        return renderDiagram(this);
    };
    
    paginatorInstance = createPaginator(animatedDiagram, staticDiagram, stepsArray, stepDescriptions, (stepName) => {
        if (stepDetails) {
            stepDetails.highlightDetails(stepName);
        }
    });
    
    paginatorInstance.renderStaticDiagram();
}

export function reset() {
    if (paginatorInstance) {
        paginatorInstance.reset();
    }
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
