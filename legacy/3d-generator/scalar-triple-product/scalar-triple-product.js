// Scalar Triple Product - 3D Visualization
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { Diagram } from '../common/js/diagram.js';
import { AnimatedDiagram } from '../common/js/animated_diagram.js';
import { createPaginator } from '../common/js/paginator.js';
import { StepDetails } from './step_details.js';
import { getAllDescriptions } from './step_descriptions.js';

// Import geometry utilities
import { crossProduct, magnitude, normalize, subtractVectors, addVectors, scaleVector, dotProduct } from '../common/js/lhs/lhs_geometry_utils.js';

let scene;
let staticDiagram, animatedDiagram;
let stepsArray = [];
let stepDescriptions = {};
let stepDetails;
let paginatorInstance;

// Generator function for step-by-step visualization
function* renderDiagram(diagram) {
    // Define the three vectors that form the parallelepiped
    const origin = { x: 0, y: 0, z: 0 };
    const vectorU = { x: 2, y: 1, z: 3 };
    const vectorV = { x: 2, y: 0, z: 0 };
    const vectorW = { x: 0, y: 2, z: 0 };
    
    // === STEP 1: Show vector u ===
    const vecU = diagram.vector(origin, vectorU, '\\vec{u}', 'red', {
        labelOffset: { x: 0.3, y: 0.3, z: 0 },
        isLatex: true
    });
    stepsArray.push('vector_u');
    yield;
    
    // === STEP 2: Show vector v ===
    const vecV = diagram.vector(origin, vectorV, '\\vec{v}', 'blue', {
        labelOffset: { x: 0.3, y: -0.3, z: 0 },
        isLatex: true
    });
    stepsArray.push('vector_v');
    yield;
    
    // === STEP 3: Show vector w ===
    const vecW = diagram.vector(origin, vectorW, '\\vec{w}', 'green', {
        labelOffset: { x: -0.3, y: 0.3, z: 0 },
        isLatex: true
    });
    stepsArray.push('vector_w');
    yield;
    
    // === STEP 4: Show parallelogram base (v × w) ===
    // First show the parallelogram formed by v and w
    const parallelogramBase = diagram.parallelogram(origin, vectorV, vectorW, '', 'cyan', {
        opacity: 0.4,
        showEdges: true,
        edgeColor: 'black'
    });
    stepsArray.push('base_parallelogram');
    yield;
    
    // === STEP 5: Show cross product v × w ===
    const crossVW = crossProduct(vectorV, vectorW);
    const crossVWEnd = addVectors(origin, crossVW);
    
    const normalVector = diagram.vector(origin, crossVWEnd, '\\vec{v} \\times \\vec{w}', 'orange', {
        labelOffset: { x: 0.5, y: 0.3, z: 0 },
        isLatex: true
    });
    stepsArray.push('cross_product');
    yield;
    
    // === STEP 6: Show angle between u and v×w ===
    // Calculate angle for visualization
    const crossMag = magnitude(crossVW);
    const uMag = magnitude(vectorU);
    
    if (crossMag > 0.001 && uMag > 0.001) {
        // Normalize vectors for angle arc
        const normalizedCross = normalize(crossVW);
        const normalizedU = normalize(vectorU);
        
        // Scale them to same length for angle visualization
        const arcRadius = 2;
        const crossForArc = scaleVector(normalizedCross, arcRadius);
        const uForArc = scaleVector(normalizedU, arcRadius);
        
        // Create angle arc
        const angleArc = diagram.arcByThreePoints(
            crossForArc,
            origin,
            uForArc,
            '\\theta',
            'magenta',
            { isLatex: true }
        );
        stepsArray.push('angle_arc');
        yield;
    }
    
    // === STEP 7: Show the complete parallelepiped using boxProduct ===
    // Create the parallelepiped volume without recreating vectors
    const volume = diagram.boxProduct(vectorU, vectorV, vectorW, '', 'cyan', {
        opacity: 0.5,
        showEdges: true,
        edgeColor: 'black',
        labelOffset: { x: 0, y: 0, z: 0.5 }
    });
    
    stepsArray.push('parallelepiped');
    yield;
    
    // === STEP 8: Highlight the scalar triple product formula ===
    // Add V label to indicate this is the volume
    const centerPoint = {
        x: (vectorU.x + vectorV.x + vectorW.x) / 3,
        y: (vectorU.y + vectorV.y + vectorW.y) / 3,
        z: (vectorU.z + vectorV.z + vectorW.z) / 3
    };
    
    diagram.label(centerPoint, 'V', {
        color: 'black',
        fontSize: 20,
        isLatex: false
    });
    
    stepsArray.push('volume_formula');
    yield;
}

/**
 * Renders the Scalar Triple Product visualization
 * @param {Object} sceneInstance - The 3D scene
 * @param {Object} panel - The control panel
 */
export function render(sceneInstance, panel) {
    scene = sceneInstance;
    
    // Setup coordinate system
    setupCoordinateSystem(scene, {
        showAxes: true,
        axesRange: 6,
        axesTickStep: 2,
        showGrid: false,
        enableInteraction: true,
        cameraPosition: { x: -10, y: 8, z: -10 },
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