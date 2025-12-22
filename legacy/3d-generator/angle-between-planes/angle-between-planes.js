// Angle Between Two Planes in 3D
// Uses Diagram API for all geometric elements
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { normalize, angleBetween } from '../common/js/lhs/lhs_geometry_utils.js';
import { getAngleBetweenPlanes } from '../common/js/lhs/inspect_3d.js';
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

// Define plane parameters
const normal1 = { x: 1, y: 1, z: 1 };  // Normal for plane 1: x + y + z = 3
const normal2 = { x: 0, y: 0, z: 1 };  // Normal for plane 2: z = 2
const plane1Center = { x: 1, y: 1, z: 1 };  // Point on plane 1
const plane2Center = { x: 0, y: 0, z: 2 };  // Point on plane 2
const intersectionPoint = { x: 0, y: 1, z: 2 };  // Point on intersection line

// Generator function for rendering diagram step by step
function* renderDiagram(diagram) {
    // Calculate angle between planes
    const normalizedNormal1 = normalize(normal1);
    const normalizedNormal2 = normalize(normal2);
    const angle = angleBetween(normalizedNormal1, normalizedNormal2);
    const angleDegrees = (angle * 180 / Math.PI).toFixed(1);
    
    // === STEP 1: Plane 1 ===
    const plane1 = diagram.planeByPointAndNormal(plane1Center, normal1, '', 'blue', {
        size: 8,
        opacity: 0.5
    });
    stepsArray.push('plane1');
    yield;
    
    // === STEP 2: Plane 2 ===
    const plane2 = diagram.planeByPointAndNormal(plane2Center, normal2, '', 'red', {
        size: 8,
        opacity: 0.5
    });
    stepsArray.push('plane2');
    yield;
    
    // === STEP 3: Normal vector 1 ===
    const normalLength = 3;
    const normal1End = {
        x: intersectionPoint.x + normalizedNormal1.x * normalLength,
        y: intersectionPoint.y + normalizedNormal1.y * normalLength,
        z: intersectionPoint.z + normalizedNormal1.z * normalLength
    };
    
    diagram.vector(intersectionPoint, normal1End, 'n₁', 'blue', {
        labelOffset: { x: 0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('normal1');
    yield;
    
    // === STEP 4: Normal vector 2 ===
    const normal2End = {
        x: intersectionPoint.x + normalizedNormal2.x * normalLength,
        y: intersectionPoint.y + normalizedNormal2.y * normalLength,
        z: intersectionPoint.z + normalizedNormal2.z * normalLength
    };
    
    diagram.vector(intersectionPoint, normal2End, 'n₂', 'red', {
        labelOffset: { x: 0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('normal2');
    yield;
    
    // === STEP 5: Angle arc between normals ===
    const normalArc = diagram.arcByThreePoints(
        normal1End,
        intersectionPoint,
        normal2End,
        `θ = ${angleDegrees}°`,
        'green',
        {
            radius: 1.5,
            labelOffset: { x: 0.2, y: 0.2, z: 0 }
        }
    );
    stepsArray.push('angle_between_normals');
    yield;
    
    // === STEP 6: Get intersection angle visualization ===
    // This requires the actual plane meshes for intersection calculation
    const anglePoints = getAngleBetweenPlanes(plane1, plane2);
    
    if (anglePoints) {
        // === STEP 7: Lines on planes at intersection ===
        diagram.segment3dByTwoPoints(anglePoints.vertex, anglePoints.point1, '', 'blue', {
            radius: 0.02,
            opacity: 0.8
        });
        stepsArray.push('intersection_line1');
        yield;
        
        diagram.segment3dByTwoPoints(anglePoints.vertex, anglePoints.point2, '', 'red', {
            radius: 0.02,
            opacity: 0.8
        });
        stepsArray.push('intersection_line2');
        yield;
    }
}

// Main render function that sets up the scene and diagrams
export function render(sceneInstance, panel) {
    // Store scene reference
    scene = sceneInstance;
    
    // Setup 3D coordinate system
    setupCoordinateSystem(scene, {
        showAxes: true,
        axesRange: 10,
        axesTickStep: 2,
        showGrid: true,
        enableInteraction: true,
        cameraPosition: { x: -15, y: 12, z: -15 },
        cameraTarget: { x: 0, y: 0, z: 0 },
        lightingProfile: 'phong'
    });
    
    // Reset shared arrays for fresh start
    stepsArray = [];
    
    // Calculate angle for descriptions
    const normalizedNormal1 = normalize(normal1);
    const normalizedNormal2 = normalize(normal2);
    const angle = angleBetween(normalizedNormal1, normalizedNormal2);
    const angleDegrees = (angle * 180 / Math.PI).toFixed(1);
    
    // Initialize step descriptions
    stepDescriptions = getAllDescriptions(angleDegrees);
    
    // Initialize step details panel if provided
    if (panel) {
        console.log('[Angle-Between-Planes] Initializing StepDetails with panel');
        stepDetails = new StepDetails(panel, angleDegrees);
    } else {
        console.warn('[Angle-Between-Planes] Panel is null, cannot initialize StepDetails');
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
        console.log(`[Angle-Between-Planes] Paginator step change callback triggered for step: ${stepName}`);
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