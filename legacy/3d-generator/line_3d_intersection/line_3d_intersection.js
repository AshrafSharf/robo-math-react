// Line 3D Intersection - Find line through intersection perpendicular to both
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { Diagram } from '../common/js/diagram.js';
import { AnimatedDiagram } from '../common/js/animated_diagram.js';
import { createPaginator } from '../common/js/paginator.js';
import { StepDetails } from './step_details.js';
import { getAllDescriptions } from './step_descriptions.js';

// Import geometry utilities
import { crossProduct, normalize, addVectors, scaleVector, magnitude } from '../common/js/lhs/lhs_geometry_utils.js';

// Store references
let scene;
let staticDiagram, animatedDiagram;
let stepsArray = [];
let stepDescriptions = {};
let stepDetails;
let paginatorInstance = null;

// Initial values from step-by-step.json
// Line L1: r = (1, 3, -1) + t(2, 3, 2)
const pointA = { x: 1, y: 3, z: -1 };
const directionB = { x: 2, y: 3, z: 2 };

// Line L2: (x-2)/1 = (y-4)/2 = (z+3)/4
const pointC = { x: 2, y: 4, z: -3 };
const directionD = { x: 1, y: 2, z: 4 };

// Intersection point from step-by-step.json: s=1, t=1, intersection at (3, 6, 1)
const intersectionPoint = { x: 3, y: 6, z: 1 };

// Generator function - FOCUS HERE
function* renderDiagram(diagram) {
    // Calculate line endpoints for visualization
    const t1 = -2.5, t2 = 2.5;
    
    // Line L1 endpoints
    const line1Start = addVectors(pointA, scaleVector(directionB, t1));
    const line1End = addVectors(pointA, scaleVector(directionB, t2));
    
    // Line L2 endpoints  
    const line2Start = addVectors(pointC, scaleVector(directionD, t1));
    const line2End = addVectors(pointC, scaleVector(directionD, t2));
    
    // === STEP 1: First line L1 ===
    const line1 = diagram.segment3dByTwoPoints(line1Start, line1End, '', 'blue');
    diagram.label(
        { x: line1End.x + 0.3, y: line1End.y + 0.3, z: line1End.z },
        'L_1',
        { color: 'black', isLatex: true }
    );
    stepsArray.push('line1');
    yield;
    
    // === STEP 2: Second line L2 ===
    const line2 = diagram.segment3dByTwoPoints(line2Start, line2End, '', 'red');
    diagram.label(
        { x: line2End.x + 0.3, y: line2End.y + 0.3, z: line2End.z },
        'L_2',
        { color: 'black', isLatex: true }
    );
    stepsArray.push('line2');
    yield;
    
    // === STEP 3: Show intersection point ===
    const intersectionObj = diagram.point3d(intersectionPoint, 'I', 'yellow', {
        labelOffset: { x: 0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('intersection_point');
    yield;
    
    // === STEP 4: Position vector to point A (for parametric equation) ===
    const posVecA = diagram.vector(
        { x: 0, y: 0, z: 0 },
        pointA,
        '\\vec{a}',
        'purple',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('position_vector_a');
    yield;
    
    // === STEP 5: Position vector to point C (for parametric equation) ===
    const posVecC = diagram.vector(
        { x: 0, y: 0, z: 0 },
        pointC,
        '\\vec{c}',
        'purple',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('position_vector_c');
    yield;
    
    // === STEP 6: Direction vector b using parallel indicator ===
    const normalizedB = normalize(directionB);
    const bEnd = addVectors(intersectionPoint, scaleVector(normalizedB, 1.5));
    
    // Calculate perpendicular offset
    const perpB = crossProduct(normalizedB, { x: 0, y: 1, z: 0 });
    const offsetB = magnitude(perpB) > 0.1 ? 
        scaleVector(normalize(perpB), 0.3) : 
        scaleVector(normalize(crossProduct(normalizedB, { x: 1, y: 0, z: 0 })), 0.3);
    
    const vecB = diagram.parallelVectorIndicator(
        intersectionPoint, 
        bEnd,
        offsetB,
        '\\vec{b}',
        'blue',  // Match L1's color
        {
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('direction_vector_b');
    yield;
    
    // === STEP 7: Direction vector d using parallel indicator ===
    const normalizedD = normalize(directionD);
    const dEnd = addVectors(intersectionPoint, scaleVector(normalizedD, 1.5));
    
    // Calculate perpendicular offset
    const perpD = crossProduct(normalizedD, { x: 0, y: 1, z: 0 });
    const offsetD = magnitude(perpD) > 0.1 ? 
        scaleVector(normalize(perpD), 0.3) : 
        scaleVector(normalize(crossProduct(normalizedD, { x: 1, y: 0, z: 0 })), 0.3);
    
    const vecD = diagram.parallelVectorIndicator(
        intersectionPoint,
        dEnd,
        scaleVector(offsetD, -1),  // Opposite side for visual clarity
        '\\vec{d}',
        'red',  // Match L2's color
        {
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('direction_vector_d');
    yield;
    
    // === STEP 8: Compute cross product b × d ===
    // From step-by-step.json: b × d = (8, -6, 1)
    const crossBD = crossProduct(directionB, directionD);
    const origin = { x: 0, y: 0, z: 0 };
    
    // Position cross product at intersection point for context
    const crossVec = diagram.vector(
        intersectionPoint,
        addVectors(intersectionPoint, scaleVector(normalize(crossBD), 2.5)),
        '\\vec{b} \\times \\vec{d}',
        'magenta',
        {
            shaftRadius: 0.05,
            headRadius: 0.15,
            headLength: 0.3,
            labelOffset: { x: 0.3, y: 0.3, z: 0.3 },
            isLatex: true
        }
    );
    stepsArray.push('cross_product_computed');
    yield;
    
    // === STEP 9: Focus on cross product operation ===
    diagram.focus([vecB, vecD, crossVec], 0.05);
    stepsArray.push('cross_product_focus');
    yield;
    diagram.restore();
    
    // === STEP 10: Create the perpendicular line ===
    const perpLineStart = addVectors(intersectionPoint, scaleVector(crossBD, -1.5));
    const perpLineEnd = addVectors(intersectionPoint, scaleVector(crossBD, 1.5));
    
    const perpLine = diagram.segment3dByTwoPoints(perpLineStart, perpLineEnd, '', 'green');
    diagram.label(
        { x: perpLineEnd.x + 0.3, y: perpLineEnd.y + 0.3, z: perpLineEnd.z },
        'L',
        { color: 'black', isLatex: false }
    );
    stepsArray.push('perpendicular_line');
    yield;
    
    // === STEP 11: Right angle marker for L1 perpendicularity ===
    // Calculate points for right angle
    const p1ForL1 = addVectors(intersectionPoint, scaleVector(normalize(directionB), 0.5));
    const p2ForL1 = addVectors(intersectionPoint, scaleVector(normalize(crossBD), 0.5));
    
    diagram.rightAngleMarker(p1ForL1, intersectionPoint, p2ForL1, '', 'gray', {
        size: 0.4,
        opacity: 0.3
    });
    stepsArray.push('right_angle_l1');
    yield;
    
    // === STEP 12: Right angle marker for L2 perpendicularity ===
    const p1ForL2 = addVectors(intersectionPoint, scaleVector(normalize(directionD), 0.5));
    const p2ForL2 = addVectors(intersectionPoint, scaleVector(normalize(crossBD), 0.5));
    
    diagram.rightAngleMarker(p1ForL2, intersectionPoint, p2ForL2, '', 'gray', {
        size: 0.4,
        opacity: 0.3
    });
    stepsArray.push('right_angle_l2');
    yield;
    
    // === STEP 13: Final focus on complete construction ===
    diagram.focus([line1, line2, perpLine, intersectionObj], 0.05);
    stepsArray.push('final_construction');
    yield;
    diagram.restore();
}

export function render(sceneInstance, panel) {
    scene = sceneInstance;
    
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