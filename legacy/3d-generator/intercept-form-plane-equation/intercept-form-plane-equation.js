// Intercept Form of Plane Equation
// Uses new Diagram API for all geometric elements
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { Diagram } from '../common/js/diagram.js';
import { AnimatedDiagram } from '../common/js/animated_diagram.js';
import { createPaginator } from '../common/js/paginator.js';
import { StepDetails } from './step_details.js';
import { getAllDescriptions } from './step_descriptions.js';

// Store references
let scene;
let staticDiagram, animatedDiagram;
let stepsArray = [];
let stepDescriptions = {};
let stepDetails;
let paginatorInstance = null;

// Initial values from step-by-step.json
const xIntercept = 4;
const yIntercept = -6;
const zIntercept = 8;

// Generator function for rendering diagram step by step
function* renderDiagram(diagram) {
    // === STEP 1: Show x-intercept point with unit vector ===
    const xInterceptPoint = { x: xIntercept, y: 0, z: 0 };
    const xPoint = diagram.point3d(xInterceptPoint, 'A', 'red', {
        labelOffset: { x: 0.3, y: 0.3, z: 0 }
    });
    // Add unit vector along x-axis
    const xUnitVector = diagram.dashedVector(
        xInterceptPoint,
        { x: xIntercept + 1, y: 0, z: 0 },
        '\\hat{i}',
        'red',
        { isLatex: true, labelOffset: { x: 0, y: -0.3, z: 0 } }
    );
    stepsArray.push('x_intercept');
    yield;
    
    // === STEP 2: Show y-intercept point with unit vector ===
    const yInterceptPoint = { x: 0, y: yIntercept, z: 0 };
    const yPoint = diagram.point3d(yInterceptPoint, 'B', 'green', {
        labelOffset: { x: -0.3, y: -0.5, z: 0 }
    });
    // Add unit vector along y-axis (negative direction since y-intercept is negative)
    const yUnitVector = diagram.dashedVector(
        yInterceptPoint,
        { x: 0, y: yIntercept - 1, z: 0 },
        '\\hat{j}',
        'green',
        { isLatex: true, labelOffset: { x: 0.3, y: 0, z: 0 } }
    );
    stepsArray.push('y_intercept');
    yield;
    
    // === STEP 3: Show z-intercept point with unit vector ===
    const zInterceptPoint = { x: 0, y: 0, z: zIntercept };
    const zPoint = diagram.point3d(zInterceptPoint, 'C', 'blue', {
        labelOffset: { x: -0.3, y: 0.3, z: 0.3 }
    });
    // Add unit vector along z-axis
    const zUnitVector = diagram.dashedVector(
        zInterceptPoint,
        { x: 0, y: 0, z: zIntercept + 1 },
        '\\hat{k}',
        'blue',
        { isLatex: true, labelOffset: { x: -0.3, y: 0, z: 0 } }
    );
    stepsArray.push('z_intercept');
    yield;
    
    // === STEP 4: Connect x and y intercepts ===
    const edgeXY = diagram.segment3dByTwoPoints(xInterceptPoint, yInterceptPoint, '', 'orange');
    stepsArray.push('edge_xy');
    yield;
    
    // === STEP 5: Connect y and z intercepts ===
    const edgeYZ = diagram.segment3dByTwoPoints(yInterceptPoint, zInterceptPoint, '', 'orange');
    stepsArray.push('edge_yz');
    yield;
    
    // === STEP 6: Connect z and x intercepts ===
    const edgeZX = diagram.segment3dByTwoPoints(zInterceptPoint, xInterceptPoint, '', 'orange');
    stepsArray.push('edge_zx');
    yield;
    
    // === STEP 7: Show the triangular plane section ===
    const planeTriangle = diagram.planeByThreePoints(
        xInterceptPoint, 
        yInterceptPoint, 
        zInterceptPoint, 
        '', 
        'cyan',
        {
            opacity: 0.3,
            showEdges: false,
            size: 20
        }
    );
    stepsArray.push('plane_triangle');
    yield;
    
    // === STEP 8: Add plane equation label ===
    // Position the label at the centroid of the triangle
    const centroid = {
        x: (xInterceptPoint.x + yInterceptPoint.x + zInterceptPoint.x) / 3,
        y: (xInterceptPoint.y + yInterceptPoint.y + zInterceptPoint.y) / 3,
        z: (xInterceptPoint.z + yInterceptPoint.z + zInterceptPoint.z) / 3
    };
    
    diagram.label(
        { x: centroid.x, y: centroid.y + 1, z: centroid.z },
        '\\frac{x}{4} + \\frac{y}{-6} + \\frac{z}{8} = 1',
        { 
            color: 'black', 
            isLatex: true,
            fontSize: 18
        }
    );
    stepsArray.push('equation_label');
    yield;
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
        showGrid: false,
        enableInteraction: true,
        cameraPosition: { x: 15, y: 12, z: -15 },
        cameraTarget: { x: 0, y: 0, z: 0 },
        lightingProfile: 'phong'
    });
    
    // Reset arrays
    stepsArray = [];
    stepDescriptions = getAllDescriptions();
    
    // Initialize step details panel if provided
    if (panel) {
        stepDetails = new StepDetails(panel);
    }
    
    // Create diagram instances
    staticDiagram = new Diagram(scene);
    animatedDiagram = new AnimatedDiagram(scene);
    
    // Attach generator functions to diagram instances
    staticDiagram.renderGenerator = function() {
        stepsArray.length = 0;
        return renderDiagram(this);
    };
    
    animatedDiagram.renderGenerator = function() {
        return renderDiagram(this);
    };
    
    // Create paginator to control animation
    paginatorInstance = createPaginator(animatedDiagram, staticDiagram, stepsArray, stepDescriptions, (stepName) => {
        if (stepDetails) {
            stepDetails.highlightDetails(stepName);
        }
    });
    
    // Render the static diagram initially
    paginatorInstance.renderStaticDiagram();
}

// Reset function
export function reset() {
    if (stepDetails) {
        stepDetails.reset();
    }
    
    if (paginatorInstance) {
        paginatorInstance.dispose();
        paginatorInstance = null;
    }
    
    stepDetails = null;
}
