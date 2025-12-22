// Area-parallelogram-3d - 3D Visualization
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
let paginatorInstance = null;

// Initial values from step-by-step.json
const pointA = { x: 5, y: 2, z: 0 };
const pointB = { x: 2, y: 6, z: 1 };
const pointC = { x: 2, y: 4, z: 7 };
const pointD = { x: 5, y: 0, z: 6 };

// Generator function for step-by-step visualization
function* renderDiagram(diagram) {
    // === STEP 1: Show the four vertices of the quadrilateral ===
    const ptA = diagram.point3d(pointA, 'A', 'red', {
        labelOffset: { x: 0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('point_a');
    yield;
    
    const ptB = diagram.point3d(pointB, 'B', 'blue', {
        labelOffset: { x: -0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('point_b');
    yield;
    
    const ptC = diagram.point3d(pointC, 'C', 'green', {
        labelOffset: { x: -0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('point_c');
    yield;
    
    const ptD = diagram.point3d(pointD, 'D', 'orange', {
        labelOffset: { x: 0.3, y: -0.3, z: 0 }
    });
    stepsArray.push('point_d');
    yield;
    
    // === STEP 2: Draw the quadrilateral edges ===
    const edgeAB = diagram.segment3dByTwoPoints(pointA, pointB, '', 'cyan');
    const edgeBC = diagram.segment3dByTwoPoints(pointB, pointC, '', 'cyan');
    const edgeCD = diagram.segment3dByTwoPoints(pointC, pointD, '', 'cyan');
    const edgeDA = diagram.segment3dByTwoPoints(pointD, pointA, '', 'cyan');
    stepsArray.push('quadrilateral_edges');
    yield;
    
    // === STEP 3: Show vector AB (from A to B) ===
    const vecAB = subtractVectors(pointB, pointA);  // (-3, 4, 1)
    const vectorAB = diagram.vector(pointA, pointB, '\\vec{AB}', 'blue', {
        shaftRadius: 0.04,
        headRadius: 0.12,
        headLength: 0.25,
        labelOffset: { x: -0.5, y: 0.3, z: 0.2 },
        isLatex: true
    });
    stepsArray.push('vector_ab');
    yield;
    
    // === STEP 4: Show vector AD (from A to D) ===
    const vecAD = subtractVectors(pointD, pointA);  // (0, -2, 6)
    const vectorAD = diagram.vector(pointA, pointD, '\\vec{AD}', 'green', {
        shaftRadius: 0.04,
        headRadius: 0.12,
        headLength: 0.25,
        labelOffset: { x: 0.3, y: -0.3, z: 0.2 },
        isLatex: true
    });
    stepsArray.push('vector_ad');
    yield;
    
    // === STEP 5: Show vector CD (from C to D) ===
    const vecCD = subtractVectors(pointD, pointC);  // (3, -4, -1)
    const vectorCD = diagram.vector(pointC, pointD, '\\vec{CD}', 'magenta', {
        shaftRadius: 0.04,
        headRadius: 0.12,
        headLength: 0.25,
        labelOffset: { x: 0.3, y: -0.3, z: 0.2 },
        isLatex: true
    });
    stepsArray.push('vector_cd');
    yield;
    
    // === STEP 6: Show vector CB (from C to B) ===
    const vecCB = subtractVectors(pointB, pointC);  // (0, 2, -6)
    const vectorCB = diagram.vector(pointC, pointB, '\\vec{CB}', 'orange', {
        shaftRadius: 0.04,
        headRadius: 0.12,
        headLength: 0.25,
        labelOffset: { x: -0.3, y: 0.3, z: 0.2 },
        isLatex: true
    });
    stepsArray.push('vector_cb');
    yield;
    
    // === STEP 7: Focus on opposite sides to show parallelism ===
    // Focus on AB and CD (they are negatives of each other)
    diagram.focus([vectorAB, vectorCD], 0.05);
    stepsArray.push('focus_opposite_sides_1');
    yield;
    diagram.restore();
    
    // Focus on AD and CB (they are negatives of each other)
    diagram.focus([vectorAD, vectorCB], 0.05);
    stepsArray.push('focus_opposite_sides_2');
    yield;
    diagram.restore();
    
    // === STEP 8: Show parallelogram formed by AB and AD ===
    const parallelogram = diagram.parallelogram(pointA, pointB, pointD, '', 'cyan', {
        opacity: 0.3,
        showEdges: true,
        edgeColor: 'blue'
    });
    stepsArray.push('parallelogram_visual');
    yield;
    
    // === STEP 9: Compute and show cross product AB × AD ===
    const crossVec = crossProduct(vecAB, vecAD);  // (26, 18, 6)
    
    // Position cross product vector at point A (center of parallelogram base)
    const crossEnd = addVectors(pointA, scaleVector(normalize(crossVec), 3));
    const crossVector = diagram.vector(pointA, crossEnd, '\\vec{AB} \\times \\vec{AD}', 'magenta', {
        shaftRadius: 0.05,
        headRadius: 0.15,
        headLength: 0.3,
        labelOffset: { x: 0.3, y: 0.3, z: 0.3 },
        isLatex: true
    });
    stepsArray.push('cross_product_computed');
    yield;
    
    // === STEP 10: Focus on vectors involved in cross product ===
    diagram.focus([vectorAB, vectorAD, crossVector], 0.05);
    stepsArray.push('cross_product_focus');
    yield;
    diagram.restore();
    
    // === STEP 11: Show perpendicular relationship ===
    // The cross product is perpendicular to both AB and AD
    // We can visualize this with a measurement indicator showing the height
    const areaValue = magnitude(crossVec);  // √1036 ≈ 32.19
    
    // Create a label showing the area value
    diagram.label(
        addVectors(pointA, { x: 0, y: -1.5, z: 0 }),
        `\\text{Area} = ${areaValue.toFixed(2)}`,
        { color: 'black', isLatex: true }
    );
    stepsArray.push('area_value');
    yield;
    
    // === STEP 12: Check if rectangle (optional visualization) ===
    // Show dot product AB · AD to check perpendicularity
    const dotProd = vecAB.x * vecAD.x + vecAB.y * vecAD.y + vecAB.z * vecAD.z;
    // Result: (-3)(0) + (4)(-2) + (1)(6) = 0 - 8 + 6 = -2 (not zero, so not a rectangle)
    
    diagram.label(
        addVectors(pointA, { x: 0, y: -2.5, z: 0 }),
        `\\vec{AB} \\cdot \\vec{AD} = ${dotProd}`,
        { color: 'black', isLatex: true }
    );
    stepsArray.push('dot_product_check');
    yield;
}

/**
 * Renders the Area-parallelogram-3d visualization
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
