// Image of Point in Plane
// Uses new Diagram API for all geometric elements
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { Diagram } from '../common/js/diagram.js';
import { AnimatedDiagram } from '../common/js/animated_diagram.js';
import { createPaginator } from '../common/js/paginator.js';
import { StepDetails } from './step_details.js';
import { getAllDescriptions } from './step_descriptions.js';

// Import geometry utilities if needed
import { dotProduct, addVectors, scaleVector } from '../common/js/lhs/lhs_geometry_utils.js';

let scene;
let staticDiagram, animatedDiagram;
let stepsArray = [];
let stepDescriptions = {};
let stepDetails;
let paginatorInstance = null;

// Initial values from step-by-step.json
// Point u = i + 2j + 3k
const pointU = { x: 1, y: 2, z: 3 };
// Normal vector n = i + 2j + 4k
const normalN = { x: 1, y: 2, z: 4 };
// Scalar p = 38
const p = 38;

// Generator function for step-by-step visualization
function* renderDiagram(diagram) {
    // === STEP 1: Show the plane ===
    // First, find a point on the plane for visualization
    // Use the formula: r·n = p, so we need point where x + 2y + 4z = 38
    // Let's use x = 2, y = 0, then 2 + 0 + 4z = 38, so z = 9
    const pointOnPlane = { x: 2, y: 0, z: 9 };
    
    const plane = diagram.planeByPointAndNormal(pointOnPlane, normalN, 'π', 'cyan', {
        size: 12,
        opacity: 0.3,
        labelOffset: { x: 0.5, y: 0.5, z: 0.5 }
    });
    
    stepsArray.push('plane');
    yield;
    
    // === STEP 2: Show the original point U ===
    const pointUObj = diagram.point3d(pointU, 'U', 'red', {
        labelOffset: { x: 0.3, y: 0.3, z: 0 }
    });
    
    stepsArray.push('original_point');
    yield;
    
    // === STEP 3: Show position vector u from origin to U ===
    const posVecU = diagram.vector(
        { x: 0, y: 0, z: 0 },
        pointU,
        'u',
        'purple',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 }
        }
    );
    
    stepsArray.push('position_vector_u');
    yield;
    
    // === STEP 4: Show normal vector n at a point on the plane ===
    // Show it from the point on plane
    const normalEnd = addVectors(pointOnPlane, scaleVector(normalN, 2));
    const normalVec = diagram.vector(
        pointOnPlane,
        normalEnd,
        'n',
        'green',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.3, y: 0.3, z: 0.3 }
        }
    );
    
    stepsArray.push('normal_vector');
    yield;
    
    // === STEP 5: Calculate and show the formula components ===
    // Calculate u·n
    const uDotN = dotProduct(pointU, normalN);  // = 17
    
    // Calculate |n|²
    const nMagnitudeSquared = dotProduct(normalN, normalN);  // = 21
    
    // Calculate the scalar factor: 2(p - u·n)/|n|²
    const scalarFactor = 2 * (p - uDotN) / nMagnitudeSquared;  // = 2 * 21 / 21 = 2
    
    // Show the calculation step visually with focus
    diagram.focus([posVecU, normalVec], 0.05);
    stepsArray.push('dot_product_calculation');
    yield;
    diagram.restore();
    
    // === STEP 6: Calculate the displacement vector ===
    // Displacement = scalar * n = 2 * n
    const displacement = scaleVector(normalN, scalarFactor);
    
    // Show the displacement vector from U
    const displacementVec = diagram.vector(
        pointU,
        addVectors(pointU, displacement),
        'd',
        'orange',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.3, y: 0.3, z: 0 }
        }
    );
    
    stepsArray.push('displacement_vector');
    yield;
    
    // === STEP 7: Calculate and show the image point V ===
    // v = u + 2n = (1,2,3) + 2(1,2,4) = (3,6,11)
    const pointV = addVectors(pointU, displacement);
    
    const pointVObj = diagram.point3d(pointV, 'V', 'blue', {
        labelOffset: { x: 0.3, y: 0.3, z: 0 }
    });
    
    stepsArray.push('image_point');
    yield;
    
    // === STEP 8: Show the perpendicular line from U to plane through V ===
    // This helps visualize that U and V are reflections across the plane
    const perpLine = diagram.dashedLine3d(pointU, pointV, '', 'magenta', {
        dashSize: 0.2,
        gapSize: 0.1,
        radius: 0.025
    });
    
    stepsArray.push('perpendicular_line');
    yield;
    
    // === STEP 9: Find and mark the midpoint (foot of perpendicular) ===
    // The midpoint between U and V should lie on the plane
    const midpoint = scaleVector(addVectors(pointU, pointV), 0.5);
    
    const midpointObj = diagram.point3d(midpoint, 'M', 'yellow', {
        radius: 0.08,
        labelOffset: { x: -0.3, y: 0.3, z: 0 }
    });
    
    stepsArray.push('midpoint_on_plane');
    yield;
    
    // === STEP 10: Final focus showing the reflection relationship ===
    diagram.focus([pointUObj, pointVObj, midpointObj, perpLine], 0.05);
    stepsArray.push('reflection_relationship');
    yield;
    diagram.restore();
}

// Main render function that sets up the scene and diagrams
export function render(sceneInstance, panel) {
    // Store scene reference
    scene = sceneInstance;
    
    // Setup 3D coordinate system
    setupCoordinateSystem(scene, {
        showAxes: true,
        axesRange: 12,
        axesTickStep: 2,
        showGrid: false,
        enableInteraction: true,
        cameraPosition: { x: 15, y: 12, z: -15 },
        cameraTarget: { x: 0, y: 0, z: 0 },
        lightingProfile: 'phong'
    });
    
    // Reset shared arrays for fresh start
    stepsArray = [];
    
    // Initialize step descriptions
    stepDescriptions = getAllDescriptions();
    
    // Initialize step details panel if provided
    if (panel) {
        stepDetails = new StepDetails(panel);
    }
    
    // Create static diagram instance for initial render
    staticDiagram = new Diagram(scene);
    
    // Create animated diagram instance
    animatedDiagram = new AnimatedDiagram(scene);
    
    // Add render generator method to both diagrams
    staticDiagram.renderGenerator = function() {
        stepsArray.length = 0; // Clear array contents
        return renderDiagram(this);
    };
    
    animatedDiagram.renderGenerator = function() {
        // Don't reset stepsArray here - it's already populated from static render
        return renderDiagram(this);
    };
    
    // Create paginator instance with both diagrams and step callback
    paginatorInstance = createPaginator(animatedDiagram, staticDiagram, stepsArray, stepDescriptions, (stepName) => {
        if (stepDetails) {
            stepDetails.highlightDetails(stepName);
        }
    });
    
    // Start with static rendering using paginator's method
    paginatorInstance.renderStaticDiagram();
}

// Cleanup function
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
