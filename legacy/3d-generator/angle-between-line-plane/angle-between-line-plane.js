// Angle-between-line-plane - 3D Visualization
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

// Extract values from step-by-step.json
// Line: r = (2i + 3j + k) + t(i − j + k)
const linePoint = { x: 2, y: 3, z: 1 };  // Position vector (2i + 3j + k)
const lineDirection = { x: 1, y: -1, z: 1 };  // Direction vector b = (i - j + k)

// Plane: 2x − y + z = 5
// Normal vector n = (2i - j + k)
const planeNormal = { x: 2, y: -1, z: 1 };
// Find a point on the plane: when x=0, y=0, then z=5
const planePoint = { x: 0, y: 0, z: 5 };

// Generator function for step-by-step visualization
function* renderDiagram(diagram) {
    // Calculate line endpoints for visualization
    const t1 = -4, t2 = 4;
    const lineStart = addVectors(linePoint, scaleVector(lineDirection, t1));
    const lineEnd = addVectors(linePoint, scaleVector(lineDirection, t2));
    
    // === STEP 1: Draw the plane ===
    // Create the plane using point and normal
    const plane = diagram.planeByPointAndNormal(
        planePoint,
        planeNormal,
        '',
        'lightblue',
        {
            size: 12,
            opacity: 0.3,
            showGridLines: true
        }
    );
    // Plane is visually clear - no label needed to avoid confusion
    stepsArray.push('plane');
    yield;
    
    // === STEP 2: Draw the line ===
    const line = diagram.segment3dByTwoPoints(lineStart, lineEnd, '', 'blue');
    diagram.label(
        { x: lineEnd.x + 0.5, y: lineEnd.y + 0.5, z: lineEnd.z },
        'L',
        { color: 'black', isLatex: false }
    );
    stepsArray.push('line');
    yield;
    
    // === STEP 3: Show a point on the line (position vector) ===
    const pointOnLine = diagram.point3d(linePoint, 'P', 'yellow', {
        labelOffset: { x: -0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('point_on_line');
    yield;
    
    // === STEP 4: Position vector from origin (SOLID - it's an input vector) ===
    const posVec = diagram.vector(
        { x: 0, y: 0, z: 0 },
        linePoint,
        '\\vec{r_0}',
        'purple',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('position_vector');
    yield;
    
    // === STEP 5: Direction vector of the line (parallel indicator) ===
    const normalizedB = normalize(lineDirection);
    const bEnd = addVectors(linePoint, scaleVector(normalizedB, 2));
    
    // Calculate perpendicular offset for parallel indicator
    const perpB = crossProduct(normalizedB, { x: 0, y: 1, z: 0 });
    const offsetB = magnitude(perpB) > 0.1 ? 
        scaleVector(normalize(perpB), 0.3) : 
        scaleVector(normalize(crossProduct(normalizedB, { x: 1, y: 0, z: 0 })), 0.3);
    
    const vecB = diagram.parallelVectorIndicator(
        linePoint,
        bEnd,
        offsetB,
        '\\vec{b}',
        'blue',  // Match line color
        {
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('direction_vector');
    yield;
    
    // === STEP 6: Normal vector of the plane ===
    // Position the normal vector at a point on the plane to show it's perpendicular to the plane
    const normalStart = planePoint;
    const normalEnd = addVectors(normalStart, scaleVector(normalize(planeNormal), 2.5));
    
    const vecN = diagram.vector(
        normalStart,
        normalEnd,
        '\\vec{n}',
        'green',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.3, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('normal_vector');
    yield;
    
    // === STEP 7: Show both vectors from a common point for angle visualization ===
    // Place both vectors at the origin to show the angle between them
    const origin = { x: 0, y: 0, z: 0 };
    
    // Direction vector from origin (for angle visualization)
    const dirFromOrigin = diagram.vector(
        origin,
        scaleVector(normalize(lineDirection), 3),
        '\\vec{b}',
        'blue',
        {
            shaftRadius: 0.03,
            headRadius: 0.10,
            headLength: 0.20,
            labelOffset: { x: -0.3, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    
    // Normal vector from origin (for angle visualization)
    const normFromOrigin = diagram.vector(
        origin,
        scaleVector(normalize(planeNormal), 3),
        '\\vec{n}',
        'green',
        {
            shaftRadius: 0.03,
            headRadius: 0.10,
            headLength: 0.20,
            labelOffset: { x: 0.3, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    
    stepsArray.push('vectors_from_origin');
    yield;
    
    // === STEP 8: Show angle φ between b and n ===
    // This is the angle between the direction vector and normal
    const angleArc = diagram.arcByThreePoints(
        scaleVector(normalize(lineDirection), 1.5),
        origin,
        scaleVector(normalize(planeNormal), 1.5),
        '\\phi',
        'blue',  // Changed to blue for better contrast
        {
            isLatex: true,
            labelOffset: { x: 0.2, y: 0.2, z: 0.1 },
            radius: 1.5  // Explicit radius for phi
        }
    );
    stepsArray.push('angle_phi');
    yield;
    
    // === STEP 9: Show the complementary angle θ (90° - φ) ===
    // Create a perpendicular to the normal in the plane containing b and n
    const crossBN = crossProduct(lineDirection, planeNormal);
    const perpToNormal = crossProduct(planeNormal, crossBN);
    const perpNormalized = normalize(perpToNormal);
    
    // Draw dashed line perpendicular to normal
    const perpEnd = scaleVector(perpNormalized, 2.5);
    diagram.dashedLine3d(
        origin,
        perpEnd,
        '',
        'gray',
        {
            dashSize: 0.15,
            gapSize: 0.08,
            radius: 0.02
        }
    );
    
    // Show right angle between normal and perpendicular
    diagram.rightAngleMarker(
        scaleVector(normalize(planeNormal), 0.5),
        origin,
        scaleVector(perpNormalized, 0.5),
        '',
        'black'
    );
    
    // Show angle θ between line direction and perpendicular (which equals the angle between line and plane)
    const thetaArc = diagram.arcByThreePoints(
        scaleVector(normalize(lineDirection), 2.0),  // Changed to 2.0 for different radius
        origin,
        scaleVector(perpNormalized, 2.0),  // Changed to 2.0 for different radius
        '\\theta',
        'orange',  // Changed to orange for contrast with blue
        {
            isLatex: true,
            labelOffset: { x: -0.2, y: 0.2, z: 0.1 },
            radius: 2.0  // Explicit radius for theta
        }
    );
    
    stepsArray.push('angle_theta');
    yield;
    
    // === STEP 10: Focus on the angle relationship ===
    // Focus on both angles to show θ = 90° - φ
    diagram.focus([angleArc, thetaArc, normFromOrigin, dirFromOrigin], 0.05);
    stepsArray.push('angle_relationship_focus');
    yield;
    diagram.restore();
    
    // === STEP 11: Final result ===
    // Show the final angle value - calculation details are in the control panel
    // No additional visual elements needed since all geometry is already shown
    stepsArray.push('final_result');
    yield;
}

/**
 * Renders the Angle-between-line-plane visualization
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
