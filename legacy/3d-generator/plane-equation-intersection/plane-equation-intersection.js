// Plane-equation-intersection - 3D Visualization
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
let paginatorInstance = null;

// Initial values from step-by-step.json
// First plane: r·(i + j + k) + 1 = 0  => r·(i + j + k) = -1
const normal1 = { x: 1, y: 1, z: 1 };
const d1 = -1;

// Second plane: r·(2i - 3j + 5k) = 2
const normal2 = { x: 2, y: -3, z: 5 };
const d2 = 2;

// Point through which the new plane passes
const givenPoint = { x: -1, y: 2, z: 1 };

// Lambda value calculated in step 4
const lambda = 1/2;  // Will be shown as 1/2 in the visualization

// Generator function for step-by-step visualization
function* renderDiagram(diagram) {
    // === STEP 1: First plane P1 ===
    // Find a point on the first plane for visualization
    // Using x=0, y=0: z = -d1/n1.z = 1
    const pointOnPlane1 = { x: 0, y: 0, z: 1 };
    
    const plane1 = diagram.planeByPointAndNormal(pointOnPlane1, normal1, 'P_1', 'blue', {
        size: 8,
        opacity: 0.3
    });
    
    // No equation labels - equations belong in control panel only
    
    stepsArray.push('first_plane');
    yield;
    
    // === STEP 2: Second plane P2 ===
    // Find a point on the second plane
    // Using x=0, y=0: 5z = 2, z = 2/5 = 0.4
    const pointOnPlane2 = { x: 0, y: 0, z: 0.4 };
    
    const plane2 = diagram.planeByPointAndNormal(pointOnPlane2, normal2, 'P_2', 'red', {
        size: 8,
        opacity: 0.3
    });
    
    // No equation labels - equations belong in control panel only
    
    stepsArray.push('second_plane');
    yield;
    
    // === STEP 3: Show normal vectors ===
    // Position vectors at points on the planes
    const n1Vec = diagram.vector(
        pointOnPlane1,
        addVectors(pointOnPlane1, scaleVector(normalize(normal1), 2)),
        '\vec{n}_1',
        'blue',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    
    const n2Vec = diagram.vector(
        pointOnPlane2,
        addVectors(pointOnPlane2, scaleVector(normalize(normal2), 2)),
        '\vec{n}_2',
        'red',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    
    stepsArray.push('normal_vectors');
    yield;
    
    // === STEP 4: Line of intersection ===
    // The line of intersection has direction parallel to n1 × n2
    const lineDirection = crossProduct(normal1, normal2);
    
    // Find a point on the line of intersection
    // We need to solve the system of two plane equations
    // Let's set x = 0 and solve for y and z
    // y + z = -1 (from plane 1)
    // -3y + 5z = 2 (from plane 2)
    // From first: y = -1 - z
    // Substitute: -3(-1 - z) + 5z = 2
    // 3 + 3z + 5z = 2
    // 8z = -1
    // z = -1/8, y = -7/8
    const pointOnLine = { x: 0, y: -7/8, z: -1/8 };
    
    // Calculate line endpoints for visualization
    const t1 = -3, t2 = 3;
    const lineStart = addVectors(pointOnLine, scaleVector(normalize(lineDirection), t1));
    const lineEnd = addVectors(pointOnLine, scaleVector(normalize(lineDirection), t2));
    
    const intersectionLine = diagram.segment3dByTwoPoints(lineStart, lineEnd, 'L', 'magenta');
    
    stepsArray.push('intersection_line');
    yield;
    
    // === STEP 5: Given point ===
    const pointObj = diagram.point3d(givenPoint, 'A', 'yellow', {
        labelOffset: { x: -0.3, y: 0.3, z: 0 }
    });
    
    stepsArray.push('given_point');
    yield;
    
    // === STEP 6: Third plane passing through intersection and point ===
    // The equation is (r·n1 - d1) + λ(r·n2 - d2) = 0
    // With λ = 1/2, the normal becomes: n1 + λn2
    const normal3 = addVectors(normal1, scaleVector(normal2, lambda));
    
    // The third plane passes through the given point
    const plane3 = diagram.planeByPointAndNormal(givenPoint, normal3, 'P', 'green', {
        size: 8,
        opacity: 0.4
    });
    
    // No equation labels - equations belong in control panel only
    
    stepsArray.push('third_plane');
    yield;
    
    // === STEP 7: Show combined normal vector ===
    const n3Vec = diagram.vector(
        givenPoint,
        addVectors(givenPoint, scaleVector(normalize(normal3), 2)),
        '\vec{n}_1 + \lambda\vec{n}_2',
        'green',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.3, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    
    stepsArray.push('combined_normal');
    yield;
    
    // === STEP 8: Focus on the solution ===
    diagram.focus([plane3, pointObj], 0.05);
    stepsArray.push('solution_focus');
    yield;
    diagram.restore();
}

/**
 * Renders the Plane-equation-intersection visualization
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
