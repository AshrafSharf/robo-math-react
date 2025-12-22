// Plane Normal Distance from Origin
// Derive the vector and Cartesian equations of a plane at perpendicular distance p from origin
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
let paginatorInstance = null;

// Initial values for the visualization
const distance_p = 3; // Perpendicular distance from origin to plane
const unitNormal = { x: 2/3, y: -2/3, z: 1/3 }; // Unit normal vector d̂
const origin = { x: 0, y: 0, z: 0 };

// Generator function for step-by-step visualization
function* renderDiagram(diagram) {
    // === STEP 1: Show origin O ===
    const originObj = diagram.point3d(origin, 'O', 'yellow', {
        labelOffset: { x: -0.3, y: -0.3, z: 0 }
    });
    stepsArray.push('origin');
    yield;
    
    // === STEP 2: Show unit normal vector d̂ from origin ===
    // Unit normal has length 1 (NEVER scale unit vectors)
    const normalEnd = unitNormal;
    const normalVec = diagram.dashedVector(
        origin,
        normalEnd,
        '\\hat{d}',
        'green',
        {
            dashSize: 0.15,
            gapSize: 0.08,
            shaftRadius: 0.02,
            headRadius: 0.08,
            headLength: 0.15,
            labelOffset: { x: 0.3, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('unit_normal');
    yield;
    
    // === STEP 3: Show point A (foot of perpendicular) ===
    // A is at distance p along unit normal: OA = p * d̂
    const pointA = scaleVector(unitNormal, distance_p);
    const pointAObj = diagram.point3d(pointA, 'A', 'red', {
        labelOffset: { x: 0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('foot_perpendicular');
    yield;
    
    // === STEP 4: Show vector OA = p*d̂ ===
    const vecOA = diagram.vector(
        origin,
        pointA,
        'p\\hat{d}',
        'purple',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: -0.5, y: 0.3, z: 0 },
            isLatex: true
        }
    );
    stepsArray.push('position_vector_oa');
    yield;
    
    // === STEP 5: Create and show the plane perpendicular to d̂ at point A ===
    const planeObj = diagram.planeByPointAndNormal(
        pointA,
        unitNormal,
        '',
        'cyan',
        {
            size: 8,
            opacity: 0.3,
            showBorder: true
        }
    );
    stepsArray.push('plane');
    yield;
    
    // === STEP 6: Show an arbitrary point P on the plane ===
    // Choose a point on the plane for demonstration
    // Need to find a point perpendicular to normal
    let perpVector1, perpVector2;
    if (Math.abs(unitNormal.x) < 0.9) {
        perpVector1 = normalize({ x: 1, y: 0, z: -unitNormal.x/unitNormal.z });
    } else {
        perpVector1 = normalize({ x: -unitNormal.y/unitNormal.x, y: 1, z: 0 });
    }
    // Get second perpendicular vector using cross product
    perpVector2 = {
        x: unitNormal.y * perpVector1.z - unitNormal.z * perpVector1.y,
        y: unitNormal.z * perpVector1.x - unitNormal.x * perpVector1.z,
        z: unitNormal.x * perpVector1.y - unitNormal.y * perpVector1.x
    };
    
    // Point P on the plane (offset from A in perpendicular direction)
    const pointP = addVectors(pointA, addVectors(
        scaleVector(perpVector1, 2.5),
        scaleVector(perpVector2, 1.5)
    ));
    
    const pointPObj = diagram.point3d(pointP, 'P', 'orange', {
        labelOffset: { x: 0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('arbitrary_point');
    yield;
    
    // === STEP 7: Show vector AP directly between points ===
    const vecAP = diagram.vector(
        pointA,
        pointP,
        '\\vec{AP}',
        'magenta',
        {
            labelOffset: { x: -0.5, y: 0.3, z: 0 },
            isLatex: true
        }
    );
    stepsArray.push('vector_ap');
    yield;
    
    // === STEP 8: Show position vector r to point P (for equation derivation) ===
    const vecR = diagram.vector(
        origin,
        pointP,
        '\\vec{r}',
        'blue',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.3, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    stepsArray.push('position_vector_r');
    yield;
    
    // === STEP 9: Show right angle between AP and normal (perpendicular condition) ===
    // Right angle marker to show AP ⊥ OA
    diagram.rightAngleMarker(pointP, pointA, origin, '', 'black', {
        size: 0.5
    });
    stepsArray.push('right_angle');
    yield;
    
    // === STEP 10: Focus on perpendicular relationship ===
    diagram.focus([vecOA, vecAP], 0.05);
    stepsArray.push('perpendicular_focus');
    yield;
    diagram.restore();
}

/**
 * Renders the Plane-normal-distance-from-origin visualization
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
    
    // Dispose of paginator if it exists
    if (paginatorInstance) {
        paginatorInstance.dispose();
        paginatorInstance = null;
    }
    
    // Clear references
    stepDetails = null;
}
