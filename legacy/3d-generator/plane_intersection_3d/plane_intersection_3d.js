// Plane Intersection 3D - Using Generator Pattern
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { Diagram } from '../common/js/diagram.js';
import { AnimatedDiagram } from '../common/js/animated_diagram.js';
import { createPaginator } from '../common/js/paginator.js';
import { StepDetails } from './step_details.js';
import { getAllDescriptions } from './step_descriptions.js';
import { normalize, crossProduct, magnitude, dotProduct, addVectors, scaleVector } from '../common/js/lhs/lhs_geometry_utils.js';

// Store references
let scene;
let staticDiagram;
let animatedDiagram;
let paginatorInstance = null;
let stepDetails = null;

// Shared data structures for paginator
let stepsArray = [];
let stepDescriptions = {};

// Define the plane equations
const plane1Eq = { a: 1, b: 1, c: 1, d: -3 };  // x + y + z = 3
const plane2Eq = { a: 2, b: -1, c: 1, d: -1 }; // 2x - y + z = 1

// Generator function for rendering diagram step by step
function* renderDiagram(diagram) {
    // Normal vectors for the planes
    const normal1 = { x: plane1Eq.a, y: plane1Eq.b, z: plane1Eq.c };
    const normal2 = { x: plane2Eq.a, y: plane2Eq.b, z: plane2Eq.c };
    
    // === STEP 1: First plane P1 ===
    const plane1 = diagram.planeByPointAndNormal(
        { x: 3, y: 0, z: 0 },  // Point on plane (when y=0, z=0: x=3)
        normal1,
        '',
        'blue',
        { size: 8, opacity: 0.4 }
    );
    
    // Label for plane 1
    diagram.label(
        { x: 4, y: 2, z: 0 },
        'P_1',
        { color: 'black', isLatex: true }
    );
    
    stepsArray.push('plane1');
    yield;
    
    // === STEP 2: Normal vector n1 for plane P1 ===
    const n1Start = { x: 1, y: 1, z: 1 };  // Point on plane
    const n1End = addVectors(n1Start, scaleVector(normalize(normal1), 2));
    const n1Vec = diagram.vector(
        n1Start,
        n1End,
        '\vec{n}_1',
        'cyan',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    
    stepsArray.push('normal1');
    yield;
    
    // === STEP 3: Second plane P2 ===
    const plane2 = diagram.planeByPointAndNormal(
        { x: 0.5, y: 0, z: 0 },  // Point on plane (when y=0, z=0: x=0.5)
        normal2,
        '',
        'red',
        { size: 8, opacity: 0.4 }
    );
    
    // Label for plane 2
    diagram.label(
        { x: -2, y: 1, z: 3 },
        'P_2',
        { color: 'black', isLatex: true }
    );
    
    stepsArray.push('plane2');
    yield;
    
    // === STEP 4: Normal vector n2 for plane P2 ===
    const n2Start = { x: -1, y: 0, z: 2 };  // Point on plane
    const n2End = addVectors(n2Start, scaleVector(normalize(normal2), 2));
    const n2Vec = diagram.vector(
        n2Start,
        n2End,
        '\vec{n}_2',
        'orange',
        {
            shaftRadius: 0.04,
            headRadius: 0.12,
            headLength: 0.25,
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    
    stepsArray.push('normal2');
    yield;
    
    // === STEP 5: Calculate intersection ===
    const crossN1N2 = crossProduct(normal1, normal2);
    const crossMag = magnitude(crossN1N2);
    
    if (crossMag > 0.001) {
        // Planes intersect in a line
        
        // === STEP 6: Show cross product of normals ===
        const origin = { x: 0, y: 0, z: 0 };
        const crossEnd = scaleVector(normalize(crossN1N2), 3);
        const crossVec = diagram.vector(
            origin,
            crossEnd,
            '\vec{n}_1 \times \vec{n}_2',
            'magenta',
            {
                shaftRadius: 0.04,
                headRadius: 0.12,
                headLength: 0.25,
                labelOffset: { x: 0.3, y: 0.3, z: 0.3 },
                isLatex: true
            }
        );
        
        stepsArray.push('cross_product');
        yield;
        
        // === STEP 7: Focus on cross product operation ===
        diagram.focus([n1Vec, n2Vec, crossVec], 0.05);
        stepsArray.push('cross_product_focus');
        yield;
        diagram.restore();
        
        // === STEP 8: Find a point on the intersection line ===
        // We need to find a point that satisfies both plane equations
        // Set one coordinate to 0 and solve for the other two
        let pointOnLine;
        
        // Try setting z = 0
        // x + y = 3 (from plane 1)
        // 2x - y = 1 (from plane 2)
        // Adding: 3x = 4, so x = 4/3
        // Substituting: y = 3 - 4/3 = 5/3
        pointOnLine = { x: 4/3, y: 5/3, z: 0 };
        
        // Verify this point is on both planes
        const check1 = plane1Eq.a * pointOnLine.x + plane1Eq.b * pointOnLine.y + plane1Eq.c * pointOnLine.z + plane1Eq.d;
        const check2 = plane2Eq.a * pointOnLine.x + plane2Eq.b * pointOnLine.y + plane2Eq.c * pointOnLine.z + plane2Eq.d;
        
        // === STEP 9: Show the intersection line ===
        const lineDirection = normalize(crossN1N2);
        const t = 8;  // Line parameter range
        const lineStart = addVectors(pointOnLine, scaleVector(lineDirection, -t));
        const lineEnd = addVectors(pointOnLine, scaleVector(lineDirection, t));
        
        const intersectionLine = diagram.segment3dByTwoPoints(
            lineStart,
            lineEnd,
            '',
            'green'
        );
        
        // Label the intersection line
        diagram.label(
            addVectors(lineEnd, { x: 0.3, y: 0.3, z: 0.3 }),
            'L',
            { color: 'black', isLatex: false }
        );
        
        stepsArray.push('intersection_line');
        yield;
        
        // === STEP 10: Show direction vector of intersection line ===
        const dirStart = pointOnLine;
        const dirEnd = addVectors(pointOnLine, scaleVector(lineDirection, 2));
        
        // Calculate perpendicular offset for parallel indicator
        const perpDir = crossProduct(lineDirection, { x: 0, y: 1, z: 0 });
        const offset = magnitude(perpDir) > 0.1 ? 
            scaleVector(normalize(perpDir), 0.3) : 
            scaleVector(normalize(crossProduct(lineDirection, { x: 1, y: 0, z: 0 })), 0.3);
        
        diagram.parallelVectorIndicator(
            dirStart,
            dirEnd,
            offset,
            '\vec{d}',
            'green',
            {
                labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
                isLatex: true
            }
        );
        
        stepsArray.push('direction_vector');
        yield;
        
        // === STEP 11: Verify perpendicularity ===
        // Show that the direction is perpendicular to both normals
        diagram.focus([n1Vec, n2Vec, intersectionLine], 0.05);
        stepsArray.push('perpendicular_verification');
        yield;
        diagram.restore();
        
    } else {
        // Planes are parallel or identical
        
        // Check if the planes are identical
        // Normal vectors are proportional, check if d values match
        let ratio = 0;
        if (Math.abs(plane2Eq.a) > 0.001) ratio = plane1Eq.a / plane2Eq.a;
        else if (Math.abs(plane2Eq.b) > 0.001) ratio = plane1Eq.b / plane2Eq.b;
        else if (Math.abs(plane2Eq.c) > 0.001) ratio = plane1Eq.c / plane2Eq.c;
        
        if (Math.abs(plane1Eq.d - ratio * plane2Eq.d) < 0.001) {
            // === STEP 6: Planes are identical ===
            diagram.label(
                { x: 0, y: 3, z: 0 },
                '\text{Identical planes}',
                { color: 'black', isLatex: true }
            );
            stepsArray.push('identical_planes');
            yield;
        } else {
            // === STEP 6: Planes are parallel ===
            // Show parallel relationship
            diagram.focus([n1Vec, n2Vec], 0.05);
            stepsArray.push('parallel_normals');
            yield;
            diagram.restore();
            
            // Show no intersection
            diagram.label(
                { x: 0, y: 3, z: 0 },
                '\text{Parallel planes}',
                { color: 'black', isLatex: true }
            );
            stepsArray.push('parallel_planes');
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
    
    // Initialize step descriptions
    stepDescriptions = getAllDescriptions();
    
    // Initialize step details panel if provided
    if (panel) {
        stepDetails = new StepDetails(panel);
    }
    
    // Create static diagram instance
    staticDiagram = new Diagram(scene);
    
    // Create animated diagram instance
    animatedDiagram = new AnimatedDiagram(scene);
    
    // Add render generator method to both diagrams
    staticDiagram.renderGenerator = function() {
        stepsArray.length = 0; // Clear array contents
        return renderDiagram(this);
    };
    
    animatedDiagram.renderGenerator = function() {
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
    
    // Dispose paginator if it exists
    if (paginatorInstance) {
        paginatorInstance.dispose();
        paginatorInstance = null;
    }
    
    // Clear references
    stepDetails = null;
}