// Distance-two-parallel-planes - 3D Visualization
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

// Values from step-by-step.json
// First plane: x + 2y - 2z + 1 = 0
const plane1Normal = { x: 1, y: 2, z: -2 };
const plane1Constant = 1;  // d1 = 1

// Second plane: 2x + 4y - 4z + 5 = 0
const plane2Normal = { x: 2, y: 4, z: -4 };
const plane2Constant = 5;  // Original constant before normalization

// Normalized second plane: x + 2y - 2z + 5/2 = 0
const plane2ConstantNormalized = 5/2;  // d2 = 5/2 after dividing by 2

// Generator function for step-by-step visualization
function* renderDiagram(diagram) {
    // Choose a point on the first plane for visualization
    // Using x = 0, y = 0, we get: -2z + 1 = 0, so z = 1/2
    const pointOnPlane1 = { x: 0, y: 0, z: 0.5 };
    
    // Choose a point on the second plane for visualization
    // Using x = 0, y = 0, we get: -4z + 5 = 0, so z = 5/4
    const pointOnPlane2 = { x: 0, y: 0, z: 1.25 };
    
    // === STEP 1: First plane with normal vector ===
    const plane1 = diagram.planeByPointAndNormal(
        pointOnPlane1,
        plane1Normal,
        '',
        'blue',
        {
            size: 8,
            opacity: 0.3,
            showEdges: true
        }
    );
    
    // Add label for first plane (simplified)
    diagram.label(
        { x: 4, y: 4, z: pointOnPlane1.z },
        '\\pi_1',
        { color: 'black', isLatex: true }
    );
    
    // Show normal vector for first plane
    const normalEnd1 = addVectors(pointOnPlane1, plane1Normal);
    const normal1 = diagram.vector(
        pointOnPlane1,
        normalEnd1,
        '\\vec{n}_1',
        'cyan',
        {
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    
    stepsArray.push('first_plane');
    yield;
    
    // === STEP 2: Second plane with normal vector ===
    const plane2 = diagram.planeByPointAndNormal(
        pointOnPlane2,
        plane2Normal,
        '',
        'red',
        {
            size: 8,
            opacity: 0.3,
            showEdges: true
        }
    );
    
    // Add label for second plane (simplified)
    diagram.label(
        { x: 4, y: 4, z: pointOnPlane2.z },
        '\\pi_2',
        { color: 'black', isLatex: true }
    );
    
    // Show normal vector for second plane
    const normalEnd2 = addVectors(pointOnPlane2, scaleVector(plane2Normal, 0.5));
    const normal2 = diagram.vector(
        pointOnPlane2,
        normalEnd2,
        '\\vec{n}_2',
        'orange',
        {
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    
    stepsArray.push('second_plane');
    yield;
    
    // === STEP 3: Show that normals are parallel (n2 = 2*n1) ===
    // Focus on both normal vectors to show they're parallel
    diagram.focus([normal1, normal2], 0.05);
    stepsArray.push('normals_parallel');
    yield;
    diagram.restore();
    
    // === STEP 4: Show normalized form of second plane ===
    // No additional labels needed - equations are in step details
    
    stepsArray.push('normalized_form');
    yield;
    
    // === STEP 5: Visualize the distance formula ===
    // Show the perpendicular distance between planes
    const distanceValue = Math.abs(plane1Constant - plane2ConstantNormalized) / magnitude(plane1Normal);
    
    // Find two points to show the perpendicular distance
    // Point on plane 1 at x=0, y=0
    const p1 = { x: 0, y: 0, z: 0.5 };
    // Point on plane 2 directly above/below it
    const p2 = { x: 0, y: 0, z: 1.25 };
    
    // Show perpendicular distance line
    const distanceLine = diagram.dashedLine3d(
        p1,
        p2,
        'd',
        'magenta',
        {
            dashSize: 0.15,
            gapSize: 0.08,
            radius: 0.025,
            labelOffset: { x: 0.3, y: 0.3, z: 0 }
        }
    );
    
    stepsArray.push('distance_visualization');
    yield;
    
    // === STEP 6: Show calculation components ===
    // Calculations are shown in step details panel, not on diagram
    
    stepsArray.push('calculation_components');
    yield;
    
    // === STEP 7: Show final distance result ===
    // Final result is shown in step details panel
    
    // Highlight the distance line
    diagram.focus([distanceLine], 0.05);
    stepsArray.push('final_distance');
    yield;
    diagram.restore();
}

/**
 * Renders the Distance-two-parallel-planes visualization
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
