// Distance Between Two Parallel Lines in 3D
// Uses Diagram API for all geometric elements
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { normalize, subtractVectors, addVectors, scaleVector } from '../common/js/lhs/lhs_geometry_utils.js';
import { distanceBetweenParallelLines, projectPointOntoLineWithDirection } from '../common/js/geo_utils.js';
import { Diagram } from '../common/js/diagram.js';
import { AnimatedDiagram } from '../common/js/animated_diagram.js';
import { createPaginator } from '../common/js/paginator.js';
import { StepDetails } from './step_details.js';
import { getAllDescriptions } from './step_descriptions.js';

// Store references
let scene;
let staticDiagram;
let animatedDiagram;
let paginatorInstance = null;
let stepDetails = null;

// Shared data structures for paginator
let stepsArray = [];
let stepDescriptions = {};

// Extract values from step-by-step.json
const pointA = { x: 1, y: 2, z: 3 };  // Point on L1 when t=0
const pointC = { x: 4, y: 0, z: 1 };  // Point on L2 when s=0  
const directionB = { x: 2, y: -1, z: 2 };  // Common direction vector

// Generator function for rendering diagram step by step
function* renderDiagram(diagram) {
    // Calculate distance using reusable utility function
    const distance = distanceBetweenParallelLines(pointA, directionB, pointC, directionB);
    
    // Calculate the closest point D on L2 from A using projection utility
    const pointD = projectPointOntoLineWithDirection(pointA, pointC, directionB);
    
    // VISUAL: Extend lines for visibility
    const tRange = 4;
    const lineStart1 = addVectors(pointA, scaleVector(directionB, -tRange));
    const lineEnd1 = addVectors(pointA, scaleVector(directionB, tRange));
    const lineStart2 = addVectors(pointC, scaleVector(directionB, -tRange));
    const lineEnd2 = addVectors(pointC, scaleVector(directionB, tRange));
    
    // === STEP 1: First line L1 (red) ===
    const lineL1 = diagram.segment3dByTwoPoints(lineStart1, lineEnd1, '', 'red');
    // Add L1 label near the line with KaTeX
    diagram.label(
        { x: lineEnd1.x + 0.5, y: lineEnd1.y, z: lineEnd1.z },
        'L_1',
        { color: 'red', fontSize: 18, isLatex: true }
    );
    stepsArray.push('line1');
    yield;
    
    // === STEP 2: Second line L2 (blue) ===
    const lineL2 = diagram.segment3dByTwoPoints(lineStart2, lineEnd2, '', 'blue');
    // Add L2 label near the line with KaTeX
    diagram.label(
        { x: lineEnd2.x + 0.5, y: lineEnd2.y, z: lineEnd2.z },
        'L_2',
        { color: 'blue', fontSize: 18, isLatex: true }
    );
    stepsArray.push('line2');
    yield;
    
    // === STEP 3: Point A on L1 with position vector a ===
    const pointAMesh = diagram.point3d(pointA, 'A', 'red');
    // Position vector a (from origin to A) with label
    diagram.vector({ x: 0, y: 0, z: 0 }, pointA, '\\vec{a}', 'red', {
        labelColor: 'black'
    });
    stepsArray.push('point_a_with_vector');
    yield;
    
    // === STEP 4: Point B/C on L2 with position vector c ===
    const pointCMesh = diagram.point3d(pointC, 'B', 'blue');
    // Position vector c (from origin to C/B) with label
    diagram.vector({ x: 0, y: 0, z: 0 }, pointC, '\\vec{c}', 'blue', {
        labelColor: 'black'
    });
    stepsArray.push('point_c_with_vector');
    yield;
    
    // === STEP 5: Point D (perpendicular projection on L2) ===
    const pointDMesh = diagram.point3d(pointD, 'D', 'purple');
    stepsArray.push('point_d');
    yield;
    
    // === STEP 6: Direction vector b with parallel indicators ===
    // Show parallel indicator vector offset from L1 (use L1's color: red)
    const offset1 = { x: -0.5, y: 1, z: -0.5 };  // Offset perpendicular to L1
    diagram.parallelVectorIndicator(
        pointA, 
        addVectors(pointA, scaleVector(normalize(directionB), 2)),
        offset1,
        '\\vec{b}',
        'red',  // Match L1's color
        { labelOffset: { x: 0, y: 0.3, z: 0 } }
    );
    
    // Show parallel indicator vector offset from L2 (use L2's color: blue)
    const offset2 = { x: 0.5, y: -1, z: 0.5 };  // Offset perpendicular to L2
    diagram.parallelVectorIndicator(
        pointC, 
        addVectors(pointC, scaleVector(normalize(directionB), 2)),
        offset2,
        '\\vec{b}',
        'blue',  // Match L2's color
        { labelOffset: { x: 0, y: -0.3, z: 0 } }
    );
    
    stepsArray.push('direction_vector');
    yield;
    
    // === STEP 7: Perpendicular distance d from A to D ===
    const distanceLine = diagram.dashedLine3d(pointA, pointD, 'd', 'orange', {
        labelOffset: { x: -0.3, y: 0, z: 0 }
    });
    stepsArray.push('perpendicular_distance');
    yield;
    
    // === STEP 8: Vector AC (a - c) ===
    // Show vector from C to A - this completes the triangle ACD
    const vectorCA = diagram.vector(pointC, pointA, '\\vec{a} - \\vec{c}', 'green', {
        labelColor: 'black',
        labelOffset: { x: 0.5, y: 0, z: 0 }  // Offset to the right
    });
    stepsArray.push('vector_ac_difference');
    yield;
    
    // === STEP 9: Angles in the triangle ACD ===
    // Now that all edges of triangle ACD are visible, show the angles
    
    // Right angle at A (perpendicular to L1)
    const dirPoint1 = addVectors(pointA, scaleVector(normalize(directionB), 1));
    const rightAngleA = diagram.rightAngleMarker(dirPoint1, pointA, pointD, '', 'gray');
    
    // Right angle at D (perpendicular to L2)
    const dirPoint2 = addVectors(pointD, scaleVector(normalize(directionB), 1));
    const rightAngleD = diagram.rightAngleMarker(pointA, pointD, dirPoint2, '', 'gray');
    
    // Angle theta at C between vector (a - c) and direction vector b
    // This shows the coterminal angle where sin(180° - θ) = sin(θ)
    const acVector = subtractVectors(pointA, pointC); // Vector from C to A (a - c)
    const acDirection = scaleVector(normalize(acVector), 1.5);
    const bDirection = scaleVector(normalize(directionB), 1.5); // Direction vector b
    
    const acPoint = addVectors(pointC, acDirection); // Point along (a - c) vector
    const bPoint = addVectors(pointC, bDirection);   // Point along b vector
    
    // Draw arc between (a - c) vector and b vector at point C
    const angleTheta = diagram.arcByThreePoints(acPoint, pointC, bPoint, 'θ', 'green', {
        radius: 0.5
    });
    
    stepsArray.push('triangle_angles');
    yield;
    
    // === STEP 10: Focus on the triangle ACD ===
    // Collect all triangle-related objects
    const triangleElements = [
        pointAMesh,      // Point A
        pointCMesh,      // Point C (labeled as B)
        pointDMesh,      // Point D
        distanceLine,    // AD edge (perpendicular distance)
        vectorCA,        // CA edge (vector from C to A)
        lineL2,          // L2 contains the CD segment
        rightAngleD,     // Right angle at D (perpendicular meets L2)
        angleTheta       // Angle theta at C
    ];
    
    // Focus on the triangle, dimming everything else
    diagram.focus(triangleElements, 0.15, 0.3);
    stepsArray.push('focus_triangle');
    yield;
    
    // === STEP 11: Restore all elements ===
    diagram.restore();
    stepsArray.push('restore_all');
    yield;
}

// Main render function that sets up the scene and diagrams
export function render(sceneInstance, panel) {
    // Store scene reference
    scene = sceneInstance;
    
    // Setup 3D coordinate system with better camera angle to match visual
    setupCoordinateSystem(scene, {
        showAxes: true,
        axesRange: 10,
        axesTickStep: 2,
        showGrid: true,
        enableInteraction: true,
        cameraPosition: { x: -12, y: 8, z: -15 },
        cameraTarget: { x: 2, y: 1, z: 2 }
    });
    
    // Reset shared arrays for fresh start
    stepsArray = [];
    
    // Initialize step descriptions
    stepDescriptions = getAllDescriptions();
    
    // Initialize step details panel if provided
    if (panel) {
        stepDetails = new StepDetails(panel);
    }
    
    // Create static diagram instance for initial render (no effects manager needed)
    staticDiagram = new Diagram(scene);
    
    // Create animated diagram instance (will create its own effects manager)
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