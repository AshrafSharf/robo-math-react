// Dot-projection - 3D Visualization
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

// Generator function for step-by-step visualization
function* renderDiagram(diagram) {
    // Clear any previous elements
    diagram.clear();
    
    // Define 3 examples with angles of 45°, 60°, 70° between v and u
    const examples = [
        {
            // Example 1: 45° angle between v and u
            v: { x: 2, y: 2, z: 1 },
            // Create u at 45° from v
            u: { x: 0.816, y: 0.408, z: 0.408 }, // Normalized vector at ~45° from v
            title: "45° angle",
            offset: { x: -5, y: 0, z: 5 }  // Position in 3D space
        },
        {
            // Example 2: 60° angle between v and u
            v: { x: 3, y: 0, z: 2 },
            // Create u at 60° from v  
            u: { x: 0.6, y: 0.7, z: 0.4 }, // Will normalize this
            title: "60° angle",
            offset: { x: 5, y: 0, z: 5 }  // Position in 3D space
        },
        {
            // Example 3: 70° angle between v and u
            v: { x: 1, y: 3, z: 1 },
            // Create u at 70° from v
            u: { x: 0.8, y: 0.2, z: 0.566 }, // Will normalize this
            title: "70° angle",
            offset: { x: 0, y: 0, z: -5 }  // Position in 3D space
        }
    ];
    
    // Normalize all u vectors
    examples.forEach(example => {
        const length = Math.sqrt(example.u.x * example.u.x + 
                                example.u.y * example.u.y + 
                                example.u.z * example.u.z);
        example.u.x /= length;
        example.u.y /= length;
        example.u.z /= length;
    });
    
    // Process each example sequentially with yields
    for (let index = 0; index < examples.length; index++) {
        const example = examples[index];
        const origin = example.offset;
        
        // === STEP 1: Show vector v for this example ===
        const vEnd = addVectors(origin, example.v);
        const vVector = diagram.vector(origin, vEnd, `\\vec{v}`, 'blue', {
            labelColor: 'black',
            labelOffset: { x: 0.3, y: 0.3, z: 0 }
        });
        stepsArray.push(`vector_v_${index+1}`);
        yield;
        
        // === STEP 2: Show unit vector u for this example ===
        const uEnd = addVectors(origin, example.u);
        const uVector = diagram.dashedVector(origin, uEnd, `\\hat{u}`, 'green', {
            labelColor: 'black',
            labelOffset: { x: -0.3, y: 0.3, z: 0 },
            dashSize: 0.15,      // Small dashes for unit vector
            gapSize: 0.08,       // Small gaps
            shaftRadius: 0.02,   // Thinner shaft for unit vector
            headRadius: 0.08,    // Smaller arrow head
            headLength: 0.15     // Smaller arrow head
        });
        stepsArray.push(`unit_vector_u_${index+1}`);
        yield;
        
        // === STEP 3: Show perpendicular projection line ===
        // Calculate dot product
        const dotProduct = example.v.x * example.u.x + 
                          example.v.y * example.u.y + 
                          example.v.z * example.u.z;
        
        // Calculate projection point on unit vector direction
        const projectionPoint = addVectors(origin, scaleVector(example.u, dotProduct));
        
        // Add dashed line from vector tip to projection point
        const perpLine = diagram.dashedLine3d(
            vEnd,           // From tip of vector v
            projectionPoint, // To projection point
            '',             // No label
            'gray',         // Gray color for perpendicular
            {
                dashSize: 0.1,
                gapSize: 0.05,
                radius: 0.015   // Thin line
            }
        );
        stepsArray.push(`projection_line_${index+1}`);
        yield;
        
        // === STEP 4: Show measurement indicator ===
        // Show projection using dotProjection method
        const projectionIndicator = diagram.dotProjection(
            { start: origin, end: vEnd },
            { start: origin, end: uEnd },
            'd',  // Distance label
            'red',
            {
                mainRadius: 0.02,
                markerRadius: 0.015,
                markerLength: 0.2,
                offsetDistance: 0.2,  // Small offset parallel to projection
                labelOffset: { x: 0, y: -0.5, z: 0 }
            }
        );
        stepsArray.push(`measurement_${index+1}`);
        yield;
    }
    
    // === Final step: Show all together ===
    stepsArray.push('final_view');
}

/**
 * Renders the Dot-projection visualization
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

export function reset() {
    if (paginatorInstance) {
        paginatorInstance.reset();
    }
}
