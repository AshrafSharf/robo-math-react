// Distance Between Skew Lines
// Uses new Diagram API for all geometric elements
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { normalize, crossProduct, magnitude, subtractVectors, dotProduct, addVectors, scaleVector } from '../common/js/lhs/lhs_geometry_utils.js';
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

// Initial values for the visualization - Example skew lines
// Line L1: passes through point A with direction vector b
const pointA = { x: 1, y: 2, z: 0 };
const directionB = { x: 2, y: 1, z: -1 };

// Line L2: passes through point C with direction vector d
const pointC = { x: -1, y: 0, z: 3 };
const directionD = { x: 1, y: -2, z: 1 };

// Generator function for rendering diagram step by step
function* renderDiagram(diagram) {
    // Calculate line endpoints for visualization
    const t1 = -3, t2 = 3;
    
    // Line L1 endpoints
    const line1Start = {
        x: pointA.x + directionB.x * t1,
        y: pointA.y + directionB.y * t1,
        z: pointA.z + directionB.z * t1
    };
    const line1End = {
        x: pointA.x + directionB.x * t2,
        y: pointA.y + directionB.y * t2,
        z: pointA.z + directionB.z * t2
    };
    
    // Line L2 endpoints
    const line2Start = {
        x: pointC.x + directionD.x * t1,
        y: pointC.y + directionD.y * t1,
        z: pointC.z + directionD.z * t1
    };
    const line2End = {
        x: pointC.x + directionD.x * t2,
        y: pointC.y + directionD.y * t2,
        z: pointC.z + directionD.z * t2
    };
    
    // === STEP 1: First skew line L1 ===
    const line1 = diagram.segment3dByTwoPoints(line1Start, line1End, '', 'blue');
    diagram.label(
        { x: line1End.x + 0.3, y: line1End.y + 0.3, z: line1End.z },
        'L_1',
        { color: 'black', isLatex: true }
    );
    stepsArray.push('line1');
    yield;
    
    // === STEP 2: Second skew line L2 ===
    const line2 = diagram.segment3dByTwoPoints(line2Start, line2End, '', 'red');
    diagram.label(
        { x: line2End.x + 0.3, y: line2End.y + 0.3, z: line2End.z },
        'L_2',
        { color: 'black', isLatex: true }
    );
    stepsArray.push('line2');
    yield;
    
    // === STEP 3: Point A on L1 ===
    const pointAObj = diagram.point3d(pointA, 'A', 'yellow', {
        labelOffset: { x: -0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('point_a_on_l1');
    yield;
    
    // === STEP 4: Point C on L2 ===
    const pointCObj = diagram.point3d(pointC, 'C', 'yellow', {
        labelOffset: { x: -0.3, y: 0.3, z: 0 }
    });
    stepsArray.push('point_c_on_l2');
    yield;
    
    // === STEP 5: Direction vectors b and d using parallel vector indicators ===
    // Normalize direction vectors and scale to length 1.5
    const normalizedB = normalize(directionB);
    const normalizedD = normalize(directionD);
    const bEnd = addVectors(pointA, scaleVector(normalizedB, 1.5));
    const dEnd = addVectors(pointC, scaleVector(normalizedD, 1.5));
    
    // Calculate perpendicular offsets for the parallel indicators
    // For b: Use cross product with a non-parallel vector to get perpendicular offset
    const perpB = crossProduct(normalizedB, { x: 0, y: 1, z: 0 });
    const offsetB = magnitude(perpB) > 0.1 ? 
        scaleVector(normalize(perpB), 0.3) : 
        scaleVector(normalize(crossProduct(normalizedB, { x: 1, y: 0, z: 0 })), 0.3);
    
    // For d: Similar approach
    const perpD = crossProduct(normalizedD, { x: 0, y: 1, z: 0 });
    const offsetD = magnitude(perpD) > 0.1 ? 
        scaleVector(normalize(perpD), 0.3) : 
        scaleVector(normalize(crossProduct(normalizedD, { x: 1, y: 0, z: 0 })), 0.3);
    
    // Create parallel vector indicators with matching colors to lines
    const vecB = diagram.parallelVectorIndicator(
        pointA, 
        bEnd,
        offsetB,
        '\\vec{b}',
        'blue',  // Match L1's color
        {
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    
    const vecD = diagram.parallelVectorIndicator(
        pointC,
        dEnd,
        scaleVector(offsetD, -1),  // Opposite side for visual clarity
        '\\vec{d}',
        'red',  // Match L2's color
        {
            labelOffset: { x: 0.2, y: 0.3, z: 0.2 },
            isLatex: true
        }
    );
    
    stepsArray.push('direction_vectors');
    yield;
    
    // === STEP 6: Vector AC from A to C ===
    const AC = subtractVectors(pointC, pointA);
    const vecAC = diagram.vector(pointA, pointC, 'AC', 'cyan', {
        labelOffset: { x: -0.5, y: 0.3, z: 0 },
        isLatex: false
    });
    
    stepsArray.push('vector_ac');
    yield;
    
    // === STEP 7: Compute and show cross product ===
    const crossBD = crossProduct(directionB, directionD);
    const crossMag = magnitude(crossBD);
    
    if (crossMag > 0.001) {
        // Show the cross product at origin initially to demonstrate the computation
        const unitCross = normalize(crossBD);
        const origin = { x: 0, y: 0, z: 0 };
        const crossInitialEnd = scaleVector(unitCross, 2.5);
        const tempCrossVecObj = diagram.vector(
            origin,
            crossInitialEnd,
            '\\vec{b} \\times \\vec{d}',
            'magenta',
            {
                labelOffset: { x: 0.3, y: 0.3, z: 0.3 },
                isLatex: true
            }
        );
        
        // The vector method already populates userData with start and end
        
        stepsArray.push('cross_product_computed');
        yield;
        
        // === STEP 8: Focus on cross product operation ===
        // Focus on all three: the vectors being crossed and their result
        diagram.focus([vecB, vecD, tempCrossVecObj], 0.05);
        stepsArray.push('cross_product_focus');
        yield;
        
        diagram.restore();
        
        // === STEP 9: Focus on projection calculation ===
        // This is the CRITICAL step - projecting AC onto the perpendicular direction
        // Focus on the projection operation - this is where the distance is calculated
        diagram.focus([vecAC, tempCrossVecObj], 0.05);
        stepsArray.push('projection_calculation');
        yield;
        
        diagram.restore();
        
        // === STEP 10: Find closest points and prepare to show distance ===
        // The shortest distance is along the direction of b × d
        const distance = Math.abs(dotProduct(AC, unitCross));
        
        // To find the closest points, we need to solve for parameters s and t
        // Using the formula for closest points on skew lines
        const bCrossd = crossBD;
        const bCrossdMagSq = dotProduct(bCrossd, bCrossd);
        
        // Parameter for point on L1
        const s = dotProduct(crossProduct(AC, directionD), bCrossd) / bCrossdMagSq;
        // Parameter for point on L2  
        const t = dotProduct(crossProduct(AC, directionB), bCrossd) / bCrossdMagSq;
        
        // Closest point on L1
        const closestOnL1 = addVectors(pointA, scaleVector(directionB, s));
        // Closest point on L2
        const closestOnL2 = addVectors(pointC, scaleVector(directionD, t));
        
        // Mark the closest points first
        const pointPObj = diagram.point3d(closestOnL1, 'P', 'orange', {
            radius: 0.1,
            labelOffset: { x: 0.2, y: 0.2, z: 0 }
        });
        const pointQObj = diagram.point3d(closestOnL2, 'Q', 'orange', {
            radius: 0.1,
            labelOffset: { x: 0.2, y: 0.2, z: 0 }
        });
        
        stepsArray.push('closest_points');
        yield;
        
        // === STEP 11: Move cross product to show direction ===
        // Move the cross product vector to the perpendicular segment to show the distance direction
        // Pass the vector definition {start, end}, not the Three.js object
        const crossVectorDef = {
            start: origin,
            end: crossInitialEnd
        };
        diagram.shiftToVector(
            crossVectorDef, 
            closestOnL1,
            {
                label: '\\vec{b} \\times \\vec{d}',
                color: 'magenta',
                isLatex: true,
                labelOffset: { x: 0.3, y: 0.3, z: 0.3 }
            }
        );
        stepsArray.push('move_for_direction');
        yield;
        
        // === STEP 12: Show the perpendicular distance segment ===
        // Now show the actual distance segment between the closest points
        const distSegment = diagram.segment3dByTwoPoints(closestOnL1, closestOnL2, 'δ', 'magenta');
        
        stepsArray.push('shortest_distance');
        yield;
        
        // === STEP 13: Show perpendicular nature with right angles ===
        // Get points for right angle markers
        const l1Point = addVectors(closestOnL1, scaleVector(directionB, 0.5));
        const l2Point = addVectors(closestOnL2, scaleVector(directionD, 0.5));
        
        // Right angle at point P (perpendicular to L1)
        diagram.rightAngleMarker(
            l1Point,
            closestOnL1,
            closestOnL2,
            '',
            'gray',
            {
                size: 0.3,
                fillOpacity: 0.5
            }
        );
        
        // Right angle at point Q (perpendicular to L2)
        diagram.rightAngleMarker(
            closestOnL1,
            closestOnL2,
            l2Point,
            '',
            'gray',
            {
                size: 0.3,
                fillOpacity: 0.5
            }
        );
        
        stepsArray.push('perpendicular_verification');
        yield;
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
    
    // Create static diagram instance for initial render (no effects manager needed)
    staticDiagram = new Diagram(scene);
    
    // Create animated diagram instance (will create its own effects manager)
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
        console.log(`[Distance-Skew-Lines] Paginator step change callback triggered for step: ${stepName}`);
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

