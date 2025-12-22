// Line Through Point with Given Direction - 3D Visualization
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
    // Extract values from step-by-step.json
    const pointA = { x: 2, y: -3, z: 4 };  // Point the line passes through
    const directionB = { x: 3, y: 2, z: 2 };  // Direction vector
    
    // === STEP 1: Show the point A ===
    const pointAObj = diagram.point3d(pointA, 'A', 'red', {
        labelOffset: { x: 0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('point_a');
    yield;
    
    // === STEP 2: Show position vector a from origin to point A ===
    const vecA = diagram.vector({ x: 0, y: 0, z: 0 }, pointA, '\\vec{a}', 'blue', {
        labelOffset: { x: -0.5, y: 0.3, z: 0 },
        isLatex: true
    });
    stepsArray.push('position_vector_a');
    yield;
    
    // === STEP 3: Show direction vector b from point A ===
    const translatedBEnd = addVectors(pointA, directionB);
    const vecB = diagram.vector(pointA, translatedBEnd, '\\vec{b}', 'green', {
        labelOffset: { x: 0.3, y: 0.3, z: 0 },
        isLatex: true
    });
    stepsArray.push('direction_vector_b');
    yield;
    
    // === STEP 4: Focus on the position and direction vectors ===
    diagram.focus([pointAObj, vecA, vecB], 0.3);
    stepsArray.push('focus_direction_vector');
    yield;
    diagram.restore();
    
    // === STEP 5: Draw the line through point A in direction b ===
    // Calculate two points on the line for visualization
    const t1 = -2.5, t2 = 2.5;
    const lineStart = addVectors(pointA, scaleVector(directionB, t1));
    const lineEnd = addVectors(pointA, scaleVector(directionB, t2));
    
    const line = diagram.segment3dByTwoPoints(lineStart, lineEnd, 'L', 'magenta', {
        radius: 0.03,
        labelOffset: { x: 0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('line');
    yield;
    
    // === STEP 6: Show a sample point on the line (parametric form visualization) ===
    const t_sample = 1;
    const samplePoint = addVectors(pointA, scaleVector(directionB, t_sample));
    diagram.point3d(samplePoint, 'R', 'orange', {
        radius: 0.12,
        labelOffset: { x: 0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('sample_point');
    yield;
    
    // === STEP 7: Show vector from origin to sample point (r = a + tb) ===
    const vecR = diagram.vector({ x: 0, y: 0, z: 0 }, samplePoint, '\\vec{r}', 'cyan', {
        labelOffset: { x: 0.3, y: 0.3, z: 0 },
        isLatex: true
    });
    stepsArray.push('position_vector_r');
    yield;
    
    // === STEP 8: Trace animation showing r = a + tb ===
    // Show how we reach point R by first going along a, then along tb
    const origin = { x: 0, y: 0, z: 0 };
    const scaledDirection = scaleVector(directionB, t_sample);
    
    // Direct path: from origin to R
    const directPath = {
        start: origin,
        end: samplePoint
    };
    
    // Vector pairs: first along a, then along tb
    const vectorPairs = [
        { start: origin, end: pointA },  // Vector a
        { start: pointA, end: samplePoint }  // Vector tb (from A to R)
    ];
    
    // Animate the trace to show the vector addition
    diagram.traceVectorPath(directPath, vectorPairs, {
        duration: 1.2,
        traceColor: 0x00ff00,  // Green for component path
        directColor: 0x00ffff   // Cyan for direct path (matching vecR)
    });
    
    stepsArray.push('trace_vector_path');
    yield;
    
    // === STEP 9: Highlight the parametric equation components ===
    diagram.focus([vecA, vecB, vecR], 0.3);
    stepsArray.push('parametric_equation');
    yield;
    diagram.restore();
}

/**
 * Renders the Line Through Point with Given Direction visualization
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
        cameraPosition: { x: 15, y: 12, z: -15 },
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
