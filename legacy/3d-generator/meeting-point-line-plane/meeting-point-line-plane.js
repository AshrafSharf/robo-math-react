// Meeting-point-line-plane - 3D Visualization
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { Diagram } from '../common/js/diagram.js';
import { AnimatedDiagram } from '../common/js/animated_diagram.js';
import { createPaginator } from '../common/js/paginator.js';
import { StepDetails } from './step_details.js';
import { getAllDescriptions } from './step_descriptions.js';

// Import geometry utilities if needed
import { crossProduct, magnitude, normalize, subtractVectors, addVectors, scaleVector, dotProduct } from '../common/js/lhs/lhs_geometry_utils.js';

let scene;
let staticDiagram, animatedDiagram;
let stepsArray = [];
let stepDescriptions = {};
let stepDetails;
let paginatorInstance;

// Initial values from step-by-step.json
// Line: r = a + t*b where a = (2, -1, 2) and b = (3, 4, 2)
const pointA = { x: 2, y: -1, z: 2 };  // Point on the line
const directionB = { x: 3, y: 4, z: 2 };  // Direction vector of the line

// Plane: x - y + z - 5 = 0, which gives normal n = (1, -1, 1) and p = 5
const normalN = { x: 1, y: -1, z: 1 };  // Normal vector to the plane
const p = 5;  // Constant in the plane equation

// Generator function for step-by-step visualization
function* renderDiagram(diagram) {
    // Calculate line endpoints for visualization
    const t1 = -2, t2 = 2;
    const lineStart = addVectors(pointA, scaleVector(directionB, t1));
    const lineEnd = addVectors(pointA, scaleVector(directionB, t2));
    
    // === STEP 1: Show the line ===
    const line = diagram.segment3dByTwoPoints(lineStart, lineEnd, '', 'blue');
    stepsArray.push('line');
    yield;
    
    // === STEP 2: Show the plane ===
    // Create plane using point and normal
    // Find a point on the plane: if x = 0, y = 0, then z = 5
    const planePoint = { x: 0, y: 0, z: 5 };
    const plane = diagram.planeByPointAndNormal(planePoint, normalN, '', 'green', {
        size: 8,
        opacity: 0.3
    });
    stepsArray.push('plane');
    yield;
    
    // === STEP 3: Show point A on the line ===
    const pointAObj = diagram.point3d(pointA, 'A', 'yellow', {
        labelOffset: { x: -0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('point_a_on_line');
    yield;
    
    // === STEP 4: Show position vector a from origin to A (SOLID - input vector) ===
    const posVecA = diagram.vector(
        { x: 0, y: 0, z: 0 },
        pointA,
        '',
        'purple',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25
        }
    );
    stepsArray.push('position_vector_a');
    yield;
    
    // === STEP 5: Show direction vector b as parallel indicator ===
    const normalizedB = normalize(directionB);
    const bEnd = addVectors(pointA, scaleVector(normalizedB, 1.5));
    
    // Calculate perpendicular offset
    const perpB = crossProduct(normalizedB, { x: 0, y: 1, z: 0 });
    const offsetB = magnitude(perpB) > 0.1 ? 
        scaleVector(normalize(perpB), 0.3) : 
        scaleVector(normalize(crossProduct(normalizedB, { x: 1, y: 0, z: 0 })), 0.3);
    
    const vecB = diagram.parallelVectorIndicator(
        pointA, 
        bEnd,
        offsetB,
        '',
        'blue'  // Match line's color
    );
    stepsArray.push('direction_vector_b');
    yield;
    
    // === STEP 6: Show normal vector n to the plane ===
    // Place normal at a point on the plane for better visualization
    const normalStart = planePoint;
    const normalEnd = addVectors(normalStart, scaleVector(normalN, 2));
    const vecN = diagram.vector(
        normalStart,
        normalEnd,
        '',
        'red',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25
        }
    );
    stepsArray.push('normal_vector_n');
    yield;
    
    // === STEP 7: Check condition b·n ≠ 0 (focus on vectors) ===
    diagram.focus([vecB, vecN], 0.05);
    stepsArray.push('check_parallel_condition');
    yield;
    diagram.restore();
    
    // === STEP 8: Calculate and show intersection point ===
    // Using formula: u = a + ((p - a·n) / (b·n)) * b
    const aDotN = dotProduct(pointA, normalN);  // a·n = 2 + 1 + 2 = 5
    const bDotN = dotProduct(directionB, normalN);  // b·n = 3 - 4 + 2 = 1
    const t = (p - aDotN) / bDotN;  // t = (5 - 5) / 1 = 0
    
    // Intersection point u = a + t*b = a + 0*b = a
    const intersectionU = addVectors(pointA, scaleVector(directionB, t));
    
    // Show the intersection point (it's the same as point A in this case)
    const pointU = diagram.point3d(intersectionU, 'U', 'magenta', {
        radius: 0.15,
        labelOffset: { x: 0.3, y: -0.3, z: 0 }
    });
    stepsArray.push('intersection_point');
    yield;
    
    // === STEP 9: Focus on the intersection ===
    diagram.focus([pointU, plane, line], 0.05);
    stepsArray.push('focus_intersection');
    yield;
    diagram.restore();
}

/**
 * Renders the Meeting-point-line-plane visualization
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

export function cleanup() {
    // Reset step details highlighting
    if (stepDetails) {
        stepDetails.reset();
    }
    
    // Dispose paginator
    if (paginatorInstance) {
        paginatorInstance.dispose();
        paginatorInstance = null;
    }
    
    stepDetails = null;
}
