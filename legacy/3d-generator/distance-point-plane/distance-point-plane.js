// Distance From Point to Plane - 3D Visualization
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { Diagram } from '../common/js/diagram.js';
import { AnimatedDiagram } from '../common/js/animated_diagram.js';
import { createPaginator } from '../common/js/paginator.js';
import { StepDetails } from './step_details.js';
import { getAllDescriptions } from './step_descriptions.js';

// Import geometry utilities
import { dotProduct, magnitude, normalize, scaleVector } from '../common/js/lhs/lhs_geometry_utils.js';

let scene;
let staticDiagram, animatedDiagram;
let stepsArray = [];
let stepDescriptions = {};
let stepDetails;
let paginatorInstance = null;

// Initial values from step-by-step.json
// Point: (2, 5, -3)
const pointU = { x: 2, y: 5, z: -3 };

// Plane: r·(6i - 3j + 2k) = 5
// Normal vector: n = 6i - 3j + 2k
const normalVector = { x: 6, y: -3, z: 2 };
const planeConstant = 5; // p = 5

// Generator function for step-by-step visualization
function* renderDiagram(diagram) {
    // === STEP 1: Show the plane ===
    // Find a point on the plane to position it
    // Using r·n = p, we can find a point by setting x=0, y=0 and solving for z
    // 0 + 0 + 2z = 5 => z = 2.5
    const pointOnPlane = { x: 0, y: 0, z: planeConstant / normalVector.z };
    
    const plane = diagram.planeByPointAndNormal(
        pointOnPlane,
        normalVector,
        '',
        'lightblue',
        {
            size: 12,
            opacity: 0.3
        }
    );
    
    // Add plane equation label
    diagram.label(
        { x: 4, y: 0, z: 3 },
        '\\vec{r} \\cdot \\vec{n} = 5',
        { color: 'black', isLatex: true }
    );
    
    stepsArray.push('plane');
    yield;
    
    // === STEP 2: Show the point U ===
    const pointUObj = diagram.point3d(pointU, 'U', 'red', {
        labelOffset: { x: 0.3, y: 0.3, z: 0 }
    });
    
    stepsArray.push('point_u');
    yield;
    
    // === STEP 3: Show position vector u from origin to point U ===
    const posVecU = diagram.vector(
        { x: 0, y: 0, z: 0 },
        pointU,
        '\\vec{u}',
        'purple',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    
    stepsArray.push('position_vector_u');
    yield;
    
    // === STEP 4: Show normal vector n of the plane ===
    // Position the normal vector at a point on the plane for better visualization
    const normalEnd = {
        x: pointOnPlane.x + normalVector.x,
        y: pointOnPlane.y + normalVector.y,
        z: pointOnPlane.z + normalVector.z
    };
    
    const normalVec = diagram.vector(
        pointOnPlane,
        normalEnd,
        '\\vec{n}',
        'green',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.3, y: 0.3, z: 0.3 },
            isLatex: true
        }
    );
    
    stepsArray.push('normal_vector');
    yield;
    
    // === STEP 5: Calculate and show the dot product u·n ===
    // This step focuses on the calculation
    const dotProductValue = dotProduct(pointU, normalVector);
    
    // Focus on the vectors involved in the dot product
    diagram.focus([posVecU, normalVec], 0.05);
    stepsArray.push('dot_product_calculation');
    yield;
    diagram.restore();
    
    // === STEP 6: Show the perpendicular distance ===
    // Calculate the actual distance: |u·n - p| / |n|
    const numerator = Math.abs(dotProductValue - planeConstant);
    const normalMagnitude = magnitude(normalVector);
    const distance = numerator / normalMagnitude;
    
    // Find the closest point on the plane for visualization
    // This is done by projecting the point onto the plane along the normal
    const t = (planeConstant - dotProductValue) / (normalMagnitude * normalMagnitude);
    const closestPointOnPlane = {
        x: pointU.x + t * normalVector.x,
        y: pointU.y + t * normalVector.y,
        z: pointU.z + t * normalVector.z
    };
    
    // Show the perpendicular distance line
    const distanceLine = diagram.dashedLine3d(
        pointU,
        closestPointOnPlane,
        '\\delta',
        'magenta',
        {
            dashSize: 0.2,
            gapSize: 0.1,
            radius: 0.025,
            labelOffset: { x: 0.3, y: 0.3, z: 0 },
            isLatex: true
        }
    );
    
    // Add right angle marker to show perpendicularity to the plane
    // Create direction points for the right angle marker
    const dirAlongNormal = {
        x: closestPointOnPlane.x + normalVector.x * 0.5,
        y: closestPointOnPlane.y + normalVector.y * 0.5,
        z: closestPointOnPlane.z + normalVector.z * 0.5
    };
    
    diagram.rightAngleMarker(
        pointU,
        closestPointOnPlane,
        dirAlongNormal,
        '',
        'gray',
        {
            size: 0.5,
            opacity: 0.6
        }
    );
    
    stepsArray.push('perpendicular_distance');
    yield;
    
    // === STEP 7: Highlight the final result ===
    // Focus on the distance line to emphasize the final answer
    diagram.focus([distanceLine], 0.05);
    
    // Add a label showing the calculated distance value
    diagram.label(
        { x: pointU.x - 1, y: pointU.y - 1, z: pointU.z },
        '\\delta = 2',
        { color: 'black', isLatex: true }
    );
    
    stepsArray.push('final_result');
    yield;
    diagram.restore();
}

/**
 * Renders the Distance-point-plane visualization
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
    
    // Dispose paginator if it exists
    if (paginatorInstance) {
        paginatorInstance.dispose();
        paginatorInstance = null;
    }
    
    // Clear references
    stepDetails = null;
}
