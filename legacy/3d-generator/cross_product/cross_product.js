// Cross Product
// Demonstrates cross product computation, magnitude, parallelogram/triangle area, and unit normal
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { crossProduct, magnitude, normalize, dotProduct, scaleVector, addVectors } from '../common/js/lhs/lhs_geometry_utils.js';
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

// Initial values from step-by-step.json
// Vector u = 2i + j + k = <2, 1, 1>
const vectorU = { x: 2, y: 1, z: 1 };

// Vector v = -4i + 3j + k = <-4, 3, 1>
const vectorV = { x: -4, y: 3, z: 1 };

// Origin for vectors
const origin = { x: 0, y: 0, z: 0 };

// Generator function for rendering diagram step by step
function* renderDiagram(diagram) {
    // === STEP 1: Show vector u from origin ===
    const vecU = diagram.vector(
        origin,
        vectorU,
        '\\vec{u}',
        'blue',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('vector_u');
    yield;
    
    // === STEP 2: Show vector v from origin ===
    const vecV = diagram.vector(
        origin,
        vectorV,
        '\\vec{v}',
        'green',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('vector_v');
    yield;
    
    // === STEP 3: Show the parallelogram formed by u and v ===
    const parallelogram = diagram.parallelogram(
        origin,
        vectorU,
        vectorV,
        '',
        'orange',
        {
            opacity: 0.3,
            showVectors: false
        }
    );
    stepsArray.push('parallelogram');
    yield;
    
    // === STEP 4: Compute and show the cross product u × v ===
    // u × v = <1*1 - 1*3, 1*(-4) - 2*1, 2*3 - 1*(-4)> = <-2, -6, 10>
    const crossUV = crossProduct(vectorU, vectorV);
    
    const crossVec = diagram.vector(
        origin,
        crossUV,
        '\\vec{u} \\times \\vec{v}',
        'magenta',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.3, y: 0.3, z: 0.3 },
            isLatex: true
        }
    );
    
    // Add right angle markers to show perpendicularity
    // Cross product is perpendicular to both u and v
    diagram.rightAngleMarker(vectorU, origin, crossUV, '', 'gray', {
        size: 0.3,
        fillOpacity: 0.5
    });
    
    diagram.rightAngleMarker(vectorV, origin, crossUV, '', 'gray', {
        size: 0.3,
        fillOpacity: 0.5
    });
    
    stepsArray.push('cross_product_computed');
    yield;
    
    // === STEP 5: Focus on the cross product relationship ===
    // Focus on u, v, and their cross product to show perpendicularity
    diagram.focus([vecU, vecV, crossVec], 0.05);
    stepsArray.push('cross_product_focus');
    yield;
    diagram.restore();
    
    // === STEP 6: Show the triangle (half of parallelogram) ===
    // Create a triangle using polygon with three vertices
    const triangle = diagram.polygon(
        [origin, vectorU, vectorV],
        '',
        'cyan',
        {
            opacity: 0.3,
            showEdges: true,
            edgeColor: 'cyan'
        }
    );
    stepsArray.push('triangle_area');
    yield;
    
    // === STEP 7: Show unit normal vector ===
    // Unit normal n_hat = (u × v) / ||u × v||
    const crossMagnitude = magnitude(crossUV);
    const unitNormal = normalize(crossUV);
    
    // Unit vector must have length 1 - no scaling!
    const unitNormalVec = diagram.dashedVector(
        origin,
        unitNormal,
        '\\hat{n}',
        'green',
        {
            dashSize: 0.15,
            gapSize: 0.08,
            shaftRadius: 0.02,    // Thinner than regular vectors
            headRadius: 0.08,     // Smaller arrow head
            headLength: 0.15,     // Smaller arrow head
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('unit_normal');
    yield;
    
    // === STEP 8: Show the anti-commutativity: v × u = -(u × v) ===
    // v × u points in opposite direction
    const crossVU = crossProduct(vectorV, vectorU);  // This will be negative of crossUV
    
    const crossVecOpposite = diagram.vector(
        origin,
        crossVU,  // Show actual vector without scaling
        '\\vec{v} \\times \\vec{u}',
        'red',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: -0.3, y: 0.3, z: -0.3 },
            isLatex: true
        }
    );
    stepsArray.push('anti_commutativity');
    yield;
    
    // === STEP 9: Focus on both cross products to show opposite directions ===
    diagram.focus([crossVec, crossVecOpposite], 0.05);
    stepsArray.push('opposite_directions_focus');
    yield;
    diagram.restore();
    
    // === STEP 10: Show right-hand rule visualization ===
    // Focus on u, v, and u × v to emphasize right-hand rule
    diagram.focus([vecU, vecV, crossVec], 0.05);
    stepsArray.push('right_hand_rule');
    yield;
    diagram.restore();
}

export function render(sceneInstance, panel) {
    scene = sceneInstance;
    
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
