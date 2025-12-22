// Condition-line-on-plane - 3D Visualization
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
// Line: (x - 3)/(-4) = (y - 4)/(-7) = (z + 3)/12
const linePoint = { x: 3, y: 4, z: -3 };  // Point on the line when parameter = 0
const lineDirection = { x: -4, y: -7, z: 12 };  // Direction ratios

// Plane: 5x - y + z = 8
const planeNormal = { x: 5, y: -1, z: 1 };  // Normal vector
const planeConstant = 8;

// Generator function for step-by-step visualization
function* renderDiagram(diagram) {
    // Calculate line endpoints for visualization
    const t1 = -2, t2 = 2;
    const lineStart = addVectors(linePoint, scaleVector(lineDirection, t1));
    const lineEnd = addVectors(linePoint, scaleVector(lineDirection, t2));
    
    // === STEP 1: Draw the plane ===
    // Find a point on the plane by setting x=0, y=0: z = 8
    const planePoint = { x: 0, y: 0, z: 8 };
    const plane = diagram.planeByPointAndNormal(planePoint, planeNormal, '', 'cyan', {
        size: 12,
        opacity: 0.3
    });
    stepsArray.push('plane');
    yield;
    
    // === STEP 2: Draw the line ===
    const line = diagram.segment3dByTwoPoints(lineStart, lineEnd, '', 'blue');
    diagram.label(
        { x: lineEnd.x + 0.3, y: lineEnd.y + 0.3, z: lineEnd.z },
        'L',
        { color: 'black', isLatex: false }
    );
    stepsArray.push('line');
    yield;
    
    // === STEP 3: Show point on the line ===
    const pointObj = diagram.point3d(linePoint, 'P', 'yellow', {
        labelOffset: { x: -0.3, y: 0.3, z: 0 },
        radius: 0.12
    });
    stepsArray.push('point_on_line');
    yield;
    
    // === STEP 4: Show direction vector of the line ===
    // Use parallel vector indicator for direction vector
    const normalizedDir = normalize(lineDirection);
    const dirEnd = addVectors(linePoint, scaleVector(normalizedDir, 1.5));
    
    // Calculate perpendicular offset for the parallel indicator
    const perpDir = crossProduct(normalizedDir, { x: 0, y: 1, z: 0 });
    const offsetDir = magnitude(perpDir) > 0.1 ? 
        scaleVector(normalize(perpDir), 0.3) : 
        scaleVector(normalize(crossProduct(normalizedDir, { x: 1, y: 0, z: 0 })), 0.3);
    
    const dirVector = diagram.parallelVectorIndicator(
        linePoint, 
        dirEnd,
        offsetDir,
        '\\vec{d}',
        'blue',  // Match line's color
        {
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('direction_vector');
    yield;
    
    // === STEP 5: Show normal vector of the plane ===
    // Position normal vector at a point on the plane
    const normalStart = planePoint;
    const normalEnd = addVectors(normalStart, scaleVector(normalize(planeNormal), 2));
    const normalVector = diagram.vector(
        normalStart,
        normalEnd,
        '\\vec{n}',
        'magenta',
        {
            labelOffset: { x: 0.3, y: 0.3, z: 0.3 },
            isLatex: true,
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25
        }
    );
    stepsArray.push('normal_vector');
    yield;
    
    // === STEP 6: Check if point lies on plane ===
    // Visual indicator for checking the point
    // Calculate if point satisfies plane equation: 5(3) - (4) + (-3) = 15 - 4 - 3 = 8
    const pointValue = planeNormal.x * linePoint.x + planeNormal.y * linePoint.y + planeNormal.z * linePoint.z;
    const pointOnPlane = Math.abs(pointValue - planeConstant) < 0.001;
    
    // Show visual feedback - highlight the point
    diagram.focus([pointObj], 0.3);
    stepsArray.push('check_point_on_plane');
    yield;
    diagram.restore();
    
    // === STEP 7: Check perpendicularity with dot product ===
    // Focus on direction vector and normal vector for dot product
    diagram.focus([dirVector, normalVector], 0.3);
    stepsArray.push('check_perpendicularity');
    yield;
    diagram.restore();
    
    // === STEP 8: Show conclusion ===
    // The dot product is -20 + 7 + 12 = -1 ≠ 0
    // So the line does not lie in the plane
    // Visual emphasis on the non-perpendicular relationship
    const dotProd = dotProduct(lineDirection, planeNormal);
    const isPerpendicular = Math.abs(dotProd) < 0.001;
    
    // Add a visual indicator showing the line crosses the plane
    if (!isPerpendicular && pointOnPlane) {
        // Line passes through the plane but is not contained in it
        // Show intersection point (which is the point P itself)
        // Add visual emphasis that the line crosses but doesn't lie in the plane
        const intersection = diagram.point3d(linePoint, '', 'red', {
            radius: 0.18
        });
        stepsArray.push('conclusion');
        yield;
    } else if (!pointOnPlane) {
        // Line doesn't even touch the plane
        stepsArray.push('conclusion');
        yield;
    } else {
        // Line lies in the plane (both conditions satisfied)
        stepsArray.push('conclusion');
        yield;
    }
}

/**
 * Renders the Condition-line-on-plane visualization
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
