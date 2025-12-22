// Rectangular Coordinate System - 3D Visualization
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
    // Values from step-by-step.json
    const P = { x: 4, y: 3, z: 5 };
    const origin = { x: 0, y: 0, z: 0 };
    
    // === STEP 1: Establish coordinate system (axes already shown) ===
    // Axes are automatically created by setupCoordinateSystem
    stepsArray.push('coordinate_system_established');
    yield;
    
    // === STEP 2: Place point P in 3D space ===
    const pointP = diagram.point3d(P, 'P', 'red', {
        radius: 0.15,
        labelOffset: { x: 0.3, y: 0.3, z: 0.3 }
    });
    stepsArray.push('point_p_placed');
    yield;
    
    // === STEP 3: Show diagonal from origin to point P (position vector) ===
    const diagonal = diagram.vector(
        origin,
        P,
        '\\vec{OP}',
        'magenta',
        {
            shaftRadius: 0.05,
            headRadius: 0.15,
            headLength: 0.3,
            labelOffset: { x: 0.3, y: -0.5, z: 0.3 },
            isLatex: true
        }
    );
    stepsArray.push('position_vector_diagonal');
    yield;
    
    // === STEP 4: Draw projection lines parallel to each axis ===
    // Projection along x-axis (from yz-plane to P)
    const projectionStartX = { x: 0, y: P.y, z: P.z };
    const projLineX = diagram.dashedLine3d(projectionStartX, P, '', 'red', {
        dashSize: 0.3,
        gapSize: 0.15,
        radius: 0.03
    });
    stepsArray.push('projection_x_axis');
    yield;
    
    // Projection along y-axis (from xz-plane to P)
    const projectionStartY = { x: P.x, y: 0, z: P.z };
    const projLineY = diagram.dashedLine3d(projectionStartY, P, '', 'green', {
        dashSize: 0.3,
        gapSize: 0.15,
        radius: 0.03
    });
    stepsArray.push('projection_y_axis');
    yield;
    
    // Projection along z-axis (from xy-plane to P)
    const projectionStartZ = { x: P.x, y: P.y, z: 0 };
    const projLineZ = diagram.dashedLine3d(projectionStartZ, P, '', 'blue', {
        dashSize: 0.3,
        gapSize: 0.15,
        radius: 0.03
    });
    stepsArray.push('projection_z_axis');
    yield;
    
    // === STEP 5: Label coordinate values on axes ===
    // Label on x-axis
    const xLabel = diagram.label(
        { x: P.x, y: -0.5, z: 0 },
        `x = ${P.x}`,
        { color: 'black', fontSize: 20 }
    );
    stepsArray.push('x_coordinate_label');
    yield;
    
    // Label on y-axis
    const yLabel = diagram.label(
        { x: -0.5, y: P.y, z: 0 },
        `y = ${P.y}`,
        { color: 'black', fontSize: 20 }
    );
    stepsArray.push('y_coordinate_label');
    yield;
    
    // Label on z-axis
    const zLabel = diagram.label(
        { x: 0, y: -0.5, z: P.z },
        `z = ${P.z}`,
        { color: 'black', fontSize: 20 }
    );
    stepsArray.push('z_coordinate_label');
    yield;
    
    // === STEP 6: Visualize the rectangular box (cuboid) ===
    const cuboidBox = diagram.cuboid(origin, P, '', 'cyan', {
        opacity: 0.2,
        showEdges: true,
        edgeColor: 'blue',
        edgeOpacity: 0.6
    });
    stepsArray.push('rectangular_box_visualization');
    yield;
}

/**
 * Renders the Rectangular Coordinate System visualization
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
