// Distance Between Point and Line in 3D
// Uses new Diagram API for all geometric elements
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { normalize, crossProduct, magnitude, subtractVectors, dotProduct, translatePoint, getRightAnglePoints, closestPointOnLine } from '../common/js/lhs/lhs_geometry_utils.js';
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

// Initial values for the visualization
const pointQ = { x: 3, y: -1, z: 4 };
const linePoint = { x: -2, y: 0, z: 1 };  // Point P when t=0
const lineDirection = { x: 3, y: -2, z: 4 };  // Direction vector

// Generator function for rendering diagram step by step
function* renderDiagram(diagram) {
    // Calculate two points on the line for visualization
    // Use the original direction vector (not normalized) for parametric line representation
    const t1 = -3, t2 = 3;
    const lineStart = {
        x: linePoint.x + lineDirection.x * t1,
        y: linePoint.y + lineDirection.y * t1,
        z: linePoint.z + lineDirection.z * t1
    };
    const lineEnd = {
        x: linePoint.x + lineDirection.x * t2,
        y: linePoint.y + lineDirection.y * t2,
        z: linePoint.z + lineDirection.z * t2
    };
    
    // === STEP 1: Line ===
    // Create the line
    diagram.segment3dByTwoPoints(lineStart, lineEnd, '', 'blue');
    stepsArray.push('line');
    yield;
    
    // === STEP 2: Point P on the line ===
    diagram.point3d(linePoint, 'P', 'yellow', {
        labelOffset: { x: -0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('point_on_line');
    yield;
    
    // === STEP 3: External point Q ===
    diagram.point3d(pointQ, 'Q', 'red', {
        labelOffset: { x: 0.3, y: 0.3, z: 0 }
    });
    
    stepsArray.push('external_point');
    yield;
    
    // === STEP 4: Vector PQ ===
    const PQ = subtractVectors(pointQ, linePoint);
    
    diagram.vector(linePoint, pointQ, '\\vec{PQ}', 'cyan', {
        labelOffset: { x: -0.5, y: 0.3, z: 0 }
    });
    
    stepsArray.push('vector_pq');
    yield;
    
    // === STEP 5: Show direction vector u ===
    const parallelogramEnd2 = {
        x: linePoint.x + lineDirection.x,
        y: linePoint.y + lineDirection.y,
        z: linePoint.z + lineDirection.z
    };
    
    diagram.vector(linePoint, parallelogramEnd2, '\\vec{u}', 'green', {
        labelOffset: { x: 0.2, y: 0.3, z: 0.2 }
    });
    
    stepsArray.push('direction_vector');
    yield;
    
    // === STEP 6: Show parallelogram formed by PQ and u ===
    // The area of this parallelogram equals ||PQ × u||
    const parallelogramEnd1 = {
        x: linePoint.x + PQ.x,
        y: linePoint.y + PQ.y,
        z: linePoint.z + PQ.z
    };
    
    diagram.parallelogram(linePoint, parallelogramEnd1, parallelogramEnd2, '', 'cyan', {
        opacity: 0.3,
        showEdges: true,
        edgeColor: 'blue'
    });
    
    stepsArray.push('parallelogram_area');
    yield;
    
    // === STEP 7: Show perpendicular distance ===
    // Calculate distance using cross product formula
    const dirMag = magnitude(lineDirection);
    
    if (dirMag > 0.001) {
        // Calculate distance using cross product formula
        const cross = crossProduct(PQ, lineDirection);
        const crossMag = magnitude(cross);
        const distance = crossMag / dirMag;
        
        // Find the closest point for visualization only (not part of the lesson)
        const closestPoint = closestPointOnLine(pointQ, linePoint, lineDirection);
        
        // Show perpendicular distance line (the height of the parallelogram)
        if (distance > 0.01) {
            // Create dashed distance line using diagram method
            diagram.dashedLine3d(pointQ, closestPoint, 'd', 'magenta', {
                dashSize: 0.2,
                gapSize: 0.1,
                radius: 0.025,
                labelOffset: { x: 0.3, y: 0.3, z: 0 }
            });
            
            stepsArray.push('perpendicular_distance');
            yield;
        }
    }
}

// Main render function that sets up the scene and diagrams
export function render(sceneInstance, panel) {
    // Store scene reference
    scene = sceneInstance;
    
    // Setup 3D coordinate system
    setupCoordinateSystem(scene, {
        showAxes: true,
        axesRange: 8,
        axesTickStep: 2,
        showGrid: false,
        enableInteraction: true,
        cameraPosition: { x: 12, y: 10, z: -15 },
        cameraTarget: { x: 0, y: 0, z: 0 },
        lightingProfile: 'phong'
    });
    
    // Reset shared arrays for fresh start
    stepsArray = [];
    
    // Initialize step descriptions
    stepDescriptions = getAllDescriptions();
    
    // Initialize step details panel if provided
    if (panel) {
        console.log('[Distance-Point-Line] Initializing StepDetails with panel');
        stepDetails = new StepDetails(panel);
    } else {
        console.warn('[Distance-Point-Line] Panel is null, cannot initialize StepDetails');
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
        console.log(`[Distance-Point-Line] Paginator step change callback triggered for step: ${stepName}`);
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