// Lines Co-planarity - 3D Visualization
// Shows that two lines are coplanar and finds the equation of the plane containing them
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { Diagram } from '../common/js/diagram.js';
import { AnimatedDiagram } from '../common/js/animated_diagram.js';
import { createPaginator } from '../common/js/paginator.js';
import { StepDetails } from './step_details.js';
import { getAllDescriptions } from './step_descriptions.js';

// Import geometry utilities
import { crossProduct, magnitude, normalize, subtractVectors, dotProduct, addVectors, scaleVector } from '../common/js/lhs/lhs_geometry_utils.js';

// Store references
let scene;
let staticDiagram, animatedDiagram;
let stepsArray = [];
let stepDescriptions = {};
let stepDetails;
let paginatorInstance = null;

// Initial values from step-by-step.json
// Line L1: r = a + sb where a = (-1, -3, -5) and b = (3, 5, 7)
const pointA = { x: -1, y: -3, z: -5 };
const directionB = { x: 3, y: 5, z: 7 };

// Line L2: r = c + td where c = (2, 4, 6) and d = (1, 4, 7)
const pointC = { x: 2, y: 4, z: 6 };
const directionD = { x: 1, y: 4, z: 7 };

// Generator function for step-by-step visualization
function* renderDiagram(diagram) {
    // Calculate line endpoints for visualization
    const t1 = -2, t2 = 2;
    
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
    
    // === STEP 3: Point A on line L1 ===
    const pointAObj = diagram.point3d(pointA, 'A', 'yellow', {
        labelOffset: { x: -0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('point_a_on_l1');
    yield;
    
    // === STEP 4: Point C on line L2 ===
    const pointCObj = diagram.point3d(pointC, 'C', 'yellow', {
        labelOffset: { x: 0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('point_c_on_l2');
    yield;
    
    // === STEP 5: Position vectors from origin (SOLID - they're input vectors) ===
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
    stepsArray.push('position_vectors');
    yield;
    
    // === STEP 6: Direction vectors using parallel indicators ===
    const normalizedB = normalize(directionB);
    const bEnd = addVectors(pointA, scaleVector(normalizedB, 1.5));
    
    // Calculate perpendicular offset for b
    const perpB = crossProduct(normalizedB, { x: 0, y: 1, z: 0 });
    const offsetB = magnitude(perpB) > 0.1 ? 
        scaleVector(normalize(perpB), 0.3) : 
        scaleVector(normalize(crossProduct(normalizedB, { x: 1, y: 0, z: 0 })), 0.3);
    
    const vecB = diagram.parallelVectorIndicator(
        pointA, 
        bEnd,
        offsetB,
        '\\vec{b}',
        'blue',  // Match L1's color
        { labelOffset: { x: 0.2, y: 0.3, z: 0.2 }, isLatex: true }
    );
    
    // Direction vector d
    const normalizedD = normalize(directionD);
    const dEnd = addVectors(pointC, scaleVector(normalizedD, 1.5));
    
    // Calculate perpendicular offset for d
    const perpD = crossProduct(normalizedD, { x: 0, y: 1, z: 0 });
    const offsetD = magnitude(perpD) > 0.1 ? 
        scaleVector(normalize(perpD), 0.3) : 
        scaleVector(normalize(crossProduct(normalizedD, { x: 1, y: 0, z: 0 })), 0.3);
    
    const vecD = diagram.parallelVectorIndicator(
        pointC,
        dEnd,
        scaleVector(offsetD, -1),  // Opposite side for visual clarity
        '\\vec{d}',
        'red',  // Match L2's color
        { labelOffset: { x: 0.2, y: 0.3, z: 0.2 }, isLatex: true }
    );
    
    stepsArray.push('direction_vectors');
    yield;
    
    // === STEP 7: Cross product b × d (at midpoint between lines for context) ===
    const crossBD = crossProduct(directionB, directionD);
    // Place cross product at midpoint between A and C for better context
    const midpoint = { 
        x: (pointA.x + pointC.x) / 2, 
        y: (pointA.y + pointC.y) / 2, 
        z: (pointA.z + pointC.z) / 2 
    };
    
    // Normalize and scale for visualization
    const crossVec = diagram.vector(
        midpoint,
        addVectors(midpoint, scaleVector(normalize(crossBD), 2.5)),
        '\\vec{b} \\times \\vec{d}',
        'magenta',
        { labelOffset: { x: 0.3, y: 0.3, z: 0.3 }, isLatex: true }
    );
    stepsArray.push('cross_product_computed');
    yield;
    
    // === STEP 8: Focus on cross product operation ===
    diagram.focus([vecB, vecD, crossVec], 0.05);
    stepsArray.push('cross_product_focus');
    yield;
    diagram.restore();
    
    // === STEP 9: Vector AC from A to C (c - a) ===
    const AC = subtractVectors(pointC, pointA);
    const vecAC = diagram.vector(pointA, pointC, '\\vec{c} - \\vec{a}', 'cyan', {
        labelOffset: { x: -0.5, y: 0.3, z: 0 },
        isLatex: true
    });
    stepsArray.push('vector_ac');
    yield;
    
    // === STEP 10: Scalar triple product calculation (coplanarity check) ===
    // Focus on the vectors involved in the scalar triple product
    diagram.focus([vecAC, crossVec], 0.05);
    stepsArray.push('scalar_triple_product_focus');
    yield;
    diagram.restore();
    
    // === STEP 11: Compute dot product (c - a) · (b × d) ===
    const scalarTriple = dotProduct(AC, crossBD);
    // Since the result is 0, the lines are coplanar
    stepsArray.push('coplanarity_confirmed');
    yield;
    
    // === STEP 12: Show the plane containing both lines ===
    // The plane equation is (r - a) · (b × d) = 0
    // For visualization, create a plane through point A with normal b × d
    const normalizedCross = normalize(crossBD);
    const plane = diagram.planeByPointAndNormal(
        pointA,
        normalizedCross,
        '',
        'green',
        {
            size: 8,
            opacity: 0.2,
            showGrid: true,
            gridDivisions: 8
        }
    );
    
    // Add label for the plane
    const planePoint = addVectors(pointA, scaleVector(normalizedCross, 3));
    diagram.label(
        planePoint,
        '\\pi',
        { color: 'black', isLatex: true }
    );
    
    stepsArray.push('plane_containing_lines');
    yield;
    
    // === STEP 13: Show normal vector to the plane ===
    // The normal is b × d (or its normalized version)
    const normalEnd = addVectors(pointA, scaleVector(normalizedCross, 2));
    const normalVec = diagram.vector(
        pointA,
        normalEnd,
        '\\vec{n}',
        'orange',
        {
            shaftRadius: 0.05,
            headRadius: 0.15,
            headLength: 0.3,
            labelOffset: { x: 0.3, y: 0.3, z: 0.3 },
            isLatex: true
        }
    );
    
    stepsArray.push('plane_normal');
    yield;
}

/**
 * Renders the Lines Co-planarity visualization
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
