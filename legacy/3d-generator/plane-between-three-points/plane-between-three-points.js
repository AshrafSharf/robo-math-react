// Plane Between Three Points
// Derives the parametric vector equation of a plane passing through three non-collinear points
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { Diagram } from '../common/js/diagram.js';
import { AnimatedDiagram } from '../common/js/animated_diagram.js';
import { createPaginator } from '../common/js/paginator.js';
import { StepDetails } from './step_details.js';
import { getAllDescriptions } from './step_descriptions.js';
import { subtractVectors, addVectors, scaleVector, crossProduct, magnitude, normalize } from '../common/js/lhs/lhs_geometry_utils.js';

// Store references
let scene;
let staticDiagram;
let animatedDiagram;
let paginatorInstance = null;
let stepDetails = null;

// Shared data structures for paginator
let stepsArray = [];
let stepDescriptions = {};

// Initial values - three non-collinear points
const pointA = { x: 2, y: 1, z: 0 };
const pointB = { x: -1, y: 3, z: 2 };
const pointC = { x: 0, y: -2, z: 4 };

// Generator function for rendering diagram step by step
function* renderDiagram(diagram) {
    // === STEP 1: Point A ===
    const pointAObj = diagram.point3d(pointA, 'A', 'red', {
        labelOffset: { x: 0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('point_a');
    yield;
    
    // === STEP 2: Point B ===
    const pointBObj = diagram.point3d(pointB, 'B', 'blue', {
        labelOffset: { x: -0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('point_b');
    yield;
    
    // === STEP 3: Point C ===
    const pointCObj = diagram.point3d(pointC, 'C', 'green', {
        labelOffset: { x: 0.3, y: -0.3, z: 0 }
    });
    stepsArray.push('point_c');
    yield;
    
    // === STEP 4: Position vector to A ===
    const posVecA = diagram.vector(
        { x: 0, y: 0, z: 0 },
        pointA,
        '\\vec{a}',
        'red',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('position_vector_a');
    yield;
    
    // === STEP 5: Position vector to B ===
    const posVecB = diagram.vector(
        { x: 0, y: 0, z: 0 },
        pointB,
        '\\vec{b}',
        'blue',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: -0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('position_vector_b');
    yield;
    
    // === STEP 6: Position vector to C ===
    const posVecC = diagram.vector(
        { x: 0, y: 0, z: 0 },
        pointC,
        '\\vec{c}',
        'green',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.2, y: -0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('position_vector_c');
    yield;
    
    // === STEP 7: Direction vector AB = b - a ===
    const AB = subtractVectors(pointB, pointA);
    const vecAB = diagram.vector(pointA, pointB, 'AB', 'cyan', {
        labelOffset: { x: -0.5, y: 0.3, z: 0 }
    });
    stepsArray.push('vector_ab');
    yield;
    
    // === STEP 8: Focus on vector subtraction for AB ===
    diagram.focus([posVecA, posVecB, vecAB], 0.3);
    stepsArray.push('vector_ab_focus');
    yield;
    diagram.restore();
    
    // === STEP 9: Direction vector AC = c - a ===
    const AC = subtractVectors(pointC, pointA);
    const vecAC = diagram.vector(pointA, pointC, 'AC', 'magenta', {
        labelOffset: { x: 0.5, y: 0.3, z: 0 }
    });
    stepsArray.push('vector_ac');
    yield;
    
    // === STEP 10: Focus on vector subtraction for AC ===
    diagram.focus([posVecA, posVecC, vecAC], 0.3);
    stepsArray.push('vector_ac_focus');
    yield;
    diagram.restore();
    
    // === STEP 11: Show the plane spanned by AB and AC ===
    // Calculate normal vector for the plane
    const normal = crossProduct(AB, AC);
    const normalMag = magnitude(normal);
    
    if (normalMag > 0.001) {
        // Create the plane through point A with normal vector
        diagram.planeByPointAndNormal(pointA, normal, '', 'yellow', {
            size: 12,
            opacity: 0.3,
            showGrid: true,
            gridDivisions: 8
        });
        stepsArray.push('plane_through_points');
        yield;
        
        // === STEP 12: Show arbitrary point P on the plane ===
        // Choose parameters s=0.3, t=0.4 for visualization
        const s = 0.3;
        const t = 0.4;
        const pointP = addVectors(pointA, addVectors(scaleVector(AB, s), scaleVector(AC, t)));
        
        const pointPObj = diagram.point3d(pointP, 'P', 'orange', {
            labelOffset: { x: 0.3, y: 0.3, z: 0 }
        });
        stepsArray.push('arbitrary_point_p');
        yield;
        
        // === STEP 13: Position vector to P ===
        const posVecP = diagram.vector(
            { x: 0, y: 0, z: 0 },
            pointP,
            '\\vec{r}',
            'orange',
            {
                shaftRadius: 0.04,
                headRadius: 0.12,
                headLength: 0.25,
                labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
                isLatex: true
            }
        );
        stepsArray.push('position_vector_r');
        yield;
        
        // === STEP 14: Show AP = r - a ===
        const vecAP = diagram.vector(pointA, pointP, 'AP', 'purple', {
            labelOffset: { x: -0.5, y: 0.3, z: 0 }
        });
        stepsArray.push('vector_ap');
        yield;
        
        // === STEP 15: Focus on vector subtraction for AP ===
        diagram.focus([posVecA, posVecP, vecAP], 0.3);
        stepsArray.push('vector_ap_focus');
        yield;
        diagram.restore();
        
        // === STEP 16: Show linear combination visualization ===
        // Show s(b-a) component from A
        const sABEnd = addVectors(pointA, scaleVector(AB, s));
        const vecSAB = diagram.dashedVector(pointA, sABEnd, '', 'cyan', {
            dashSize: 0.15,
            gapSize: 0.08,
            shaftRadius: 0.03,
            headRadius: 0.1,
            headLength: 0.2
        });
        
        // Show t(c-a) component from the end of s(b-a)
        const vecTAC = diagram.dashedVector(sABEnd, pointP, '', 'magenta', {
            dashSize: 0.15,
            gapSize: 0.08,
            shaftRadius: 0.03,
            headRadius: 0.1,
            headLength: 0.2
        });
        
        stepsArray.push('linear_combination');
        yield;
        
        // === STEP 17: Focus on the linear combination ===
        diagram.focus([vecAP, vecSAB, vecTAC], 0.3);
        stepsArray.push('linear_combination_focus');
        yield;
        diagram.restore();
        
        // === STEP 18: Trace animation showing r = a + s(b-a) + t(c-a) ===
        // Show how we reach point P by first going along a, then s(b-a), then t(c-a)
        const origin = { x: 0, y: 0, z: 0 };
        
        // Direct path: from origin to P
        const directPath = {
            start: origin,
            end: pointP
        };
        
        // Vector pairs: first along a, then s(b-a), then t(c-a)
        const vectorPairs = [
            { start: origin, end: pointA },  // Vector a
            { start: pointA, end: sABEnd },  // Vector s(b-a) from A
            { start: sABEnd, end: pointP }   // Vector t(c-a) from end of s(b-a)
        ];
        
        // Animate the trace to show the vector addition
        diagram.traceVectorPath(directPath, vectorPairs, {
            duration: 1.5,
            traceColor: 0x00ff00,  // Green for component path
            directColor: 0xffa500   // Orange for direct path (matching vecR)
        });
        
        stepsArray.push('trace_vector_path');
        yield;
        
        // === STEP 19: Highlight the parametric equation components ===
        diagram.focus([posVecA, vecAB, vecAC], 0.3);
        stepsArray.push('parametric_equation_components');
        yield;
        diagram.restore();
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
    
    // Dispose of paginator instance
    if (paginatorInstance) {
        paginatorInstance.dispose();
        paginatorInstance = null;
    }
    
    // Clear references
    stepDetails = null;
}
