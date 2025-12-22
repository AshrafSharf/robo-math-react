// Line 3D Intersection - Refactored using LHS APIs
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { line } from '../common/js/lhs/lhs_line.js';
import { point } from '../common/js/lhs/lhs_point.js';
import { vector } from '../common/js/lhs/lhs_vector.js';
import { label } from '../common/js/lhs/lhs_label.js';
import { rightAngle } from '../common/js/lhs/lhs_right_angle.js';
import { crossProduct, normalize, getRightAnglePoints } from '../common/js/lhs/lhs_geometry_utils.js';
import { createPaginator } from '../common/js/lhs/lhs_paginator.js';
import { getAllDescriptions } from './step_descriptions.js';

function buildAnimationSequence(objectsMap) {
    const sequencedObjects = [];
    
    // Step 1: Convert lines to parametric form and find intersection point
    // Show both lines first
    if (objectsMap['line1']) sequencedObjects.push(objectsMap['line1']);
    if (objectsMap['line1Label']) sequencedObjects.push(objectsMap['line1Label']);
    if (objectsMap['line2']) sequencedObjects.push(objectsMap['line2']);
    if (objectsMap['line2Label']) sequencedObjects.push(objectsMap['line2Label']);
    
    // Show the intersection point
    if (objectsMap['intersectionPoint']) sequencedObjects.push(objectsMap['intersectionPoint']);
    if (objectsMap['intersectionLabel']) sequencedObjects.push(objectsMap['intersectionLabel']);
    
    // Step 2: Find direction vector perpendicular to both lines
    // Show direction vectors
    if (objectsMap['direction1']) sequencedObjects.push(objectsMap['direction1']);
    if (objectsMap['direction1Label']) sequencedObjects.push(objectsMap['direction1Label']);
    if (objectsMap['direction2']) sequencedObjects.push(objectsMap['direction2']);
    if (objectsMap['direction2Label']) sequencedObjects.push(objectsMap['direction2Label']);
    
    // Show perpendicular direction (cross product result)
    if (objectsMap['perpDirection']) sequencedObjects.push(objectsMap['perpDirection']);
    if (objectsMap['perpDirectionLabel']) sequencedObjects.push(objectsMap['perpDirectionLabel']);
    
    // Step 3: Write equation of required line
    // Show the perpendicular line
    if (objectsMap['resultLine']) sequencedObjects.push(objectsMap['resultLine']);
    if (objectsMap['resultLineLabel']) sequencedObjects.push(objectsMap['resultLineLabel']);
    
    // Show right angles to demonstrate perpendicularity
    if (objectsMap['rightAngle1']) sequencedObjects.push(objectsMap['rightAngle1']);
    if (objectsMap['rightAngle2']) sequencedObjects.push(objectsMap['rightAngle2']);
    
    return sequencedObjects;
}

export function render(scene, panel) {
    const objectsMap = {};
    
    // Setup 3D coordinate system with enhanced Phong lighting
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
    
    // Step 1: Define lines from step-by-step.json
    // Line 1: r = (1, 3, -1) + t(2, 3, 2)
    const line1Point = { x: 1, y: 3, z: -1 };
    const line1Direction = { x: 2, y: 3, z: 2 };
    
    // Line 2: (x-2)/1 = (y-4)/2 = (z+3)/4
    const line2Point = { x: 2, y: 4, z: -3 };
    const line2Direction = { x: 1, y: 2, z: 4 };
    
    // Calculate intersection point (from step-by-step.json: s=1, t=1, intersection at (3, 6, 1))
    const intersectionPoint = { x: 3, y: 6, z: 1 };
    
    // Calculate perpendicular direction using cross product
    const perpDirection = crossProduct(line1Direction, line2Direction);
    // Result from step-by-step.json: (8, -6, 1)
    
    // Create Line 1
    const line1Start = {
        x: line1Point.x - 4 * line1Direction.x,
        y: line1Point.y - 4 * line1Direction.y,
        z: line1Point.z - 4 * line1Direction.z
    };
    const line1End = {
        x: line1Point.x + 4 * line1Direction.x,
        y: line1Point.y + 4 * line1Direction.y,
        z: line1Point.z + 4 * line1Direction.z
    };
    
    const line1Mesh = line(line1Start, line1End, {
        color: 0x0000ff,  // Blue
        thickness: 3
    });
    scene.add(line1Mesh);
    objectsMap['line1'] = { name: 'line1', mesh: line1Mesh, method: 'line', delay: 0.3 };
    
    // Label for Line 1
    const line1LabelPos = {
        x: line1Point.x + 1.5 * line1Direction.x,
        y: line1Point.y + 1.5 * line1Direction.y + 0.5,
        z: line1Point.z + 1.5 * line1Direction.z
    };
    const line1Label = label('L₁', line1LabelPos, {
        color: '#000000'
    });
    if (line1Label) {
        scene.add(line1Label);
        objectsMap['line1Label'] = { name: 'line1Label', mesh: line1Label, method: 'label', delay: 0.2 };
    }
    
    // Create Line 2
    const line2Start = {
        x: line2Point.x - 4 * line2Direction.x,
        y: line2Point.y - 4 * line2Direction.y,
        z: line2Point.z - 4 * line2Direction.z
    };
    const line2End = {
        x: line2Point.x + 4 * line2Direction.x,
        y: line2Point.y + 4 * line2Direction.y,
        z: line2Point.z + 4 * line2Direction.z
    };
    
    const line2Mesh = line(line2Start, line2End, {
        color: 0xff0000,  // Red
        thickness: 3
    });
    scene.add(line2Mesh);
    objectsMap['line2'] = { name: 'line2', mesh: line2Mesh, method: 'line', delay: 0.3 };
    
    // Label for Line 2
    const line2LabelPos = {
        x: line2Point.x + 1.5 * line2Direction.x,
        y: line2Point.y + 1.5 * line2Direction.y + 0.5,
        z: line2Point.z + 1.5 * line2Direction.z
    };
    const line2Label = label('L₂', line2LabelPos, {
        color: '#000000'
    });
    if (line2Label) {
        scene.add(line2Label);
        objectsMap['line2Label'] = { name: 'line2Label', mesh: line2Label, method: 'label', delay: 0.2 };
    }
    
    // Create intersection point
    const intersectionMesh = point(intersectionPoint, {
        color: 0xffff00,  // Yellow
        size: 0.2
    });
    scene.add(intersectionMesh);
    objectsMap['intersectionPoint'] = { name: 'intersectionPoint', mesh: intersectionMesh, method: 'point', delay: 0.3 };
    
    // Label for intersection point
    const intersectionLabelPos = {
        x: intersectionPoint.x + 0.5,
        y: intersectionPoint.y + 0.5,
        z: intersectionPoint.z
    };
    const intersectionLabel = label('I(3, 6, 1)', intersectionLabelPos, {
        color: '#000000'
    });
    if (intersectionLabel) {
        scene.add(intersectionLabel);
        objectsMap['intersectionLabel'] = { name: 'intersectionLabel', mesh: intersectionLabel, method: 'label', delay: 0.2 };
    }
    
    // Create direction vectors from intersection point
    const direction1Mesh = vector(intersectionPoint, 
        {
            x: intersectionPoint.x + 2 * line1Direction.x,
            y: intersectionPoint.y + 2 * line1Direction.y,
            z: intersectionPoint.z + 2 * line1Direction.z
        }, 
        {
            color: 0x800080,  // Purple - distinct from blue line
            thickness: 6,      // Thicker than line for visibility
            shaftRadius: 0.08, // Explicitly set shaft radius
            headRadius: 0.15   // Explicitly set head radius
        }
    );
    scene.add(direction1Mesh);
    objectsMap['direction1'] = { name: 'direction1', mesh: direction1Mesh, method: 'vector', delay: 0.3 };
    
    // Label for direction 1
    const dir1LabelPos = {
        x: intersectionPoint.x + line1Direction.x,
        y: intersectionPoint.y + line1Direction.y + 0.3,
        z: intersectionPoint.z + line1Direction.z
    };
    const dir1Label = label('b⃗', dir1LabelPos, {
        color: '#000000'
    });
    if (dir1Label) {
        scene.add(dir1Label);
        objectsMap['direction1Label'] = { name: 'direction1Label', mesh: dir1Label, method: 'label', delay: 0.2 };
    }
    
    // Create direction vector 2
    const direction2Mesh = vector(intersectionPoint, 
        {
            x: intersectionPoint.x + 2 * line2Direction.x,
            y: intersectionPoint.y + 2 * line2Direction.y,
            z: intersectionPoint.z + 2 * line2Direction.z
        }, 
        {
            color: 0xff1493,  // Deep pink - more distinct from red line
            thickness: 6,      // Thicker than line for visibility
            shaftRadius: 0.08, // Explicitly set shaft radius
            headRadius: 0.15   // Explicitly set head radius
        }
    );
    scene.add(direction2Mesh);
    objectsMap['direction2'] = { name: 'direction2', mesh: direction2Mesh, method: 'vector', delay: 0.3 };
    
    // Label for direction 2
    const dir2LabelPos = {
        x: intersectionPoint.x + line2Direction.x,
        y: intersectionPoint.y + line2Direction.y + 0.3,
        z: intersectionPoint.z + line2Direction.z
    };
    const dir2Label = label('d⃗', dir2LabelPos, {
        color: '#000000'
    });
    if (dir2Label) {
        scene.add(dir2Label);
        objectsMap['direction2Label'] = { name: 'direction2Label', mesh: dir2Label, method: 'label', delay: 0.2 };
    }
    
    // Create perpendicular direction vector (cross product result)
    const perpDirectionNorm = normalize(perpDirection);
    const perpVectorMesh = vector(intersectionPoint,
        {
            x: intersectionPoint.x + 3 * perpDirectionNorm.x,
            y: intersectionPoint.y + 3 * perpDirectionNorm.y,
            z: intersectionPoint.z + 3 * perpDirectionNorm.z
        },
        {
            color: 0xffa500,  // Orange - distinct from green result line
            thickness: 6,      // Thick for visibility
            shaftRadius: 0.08, // Explicitly set shaft radius
            headRadius: 0.15   // Explicitly set head radius
        }
    );
    scene.add(perpVectorMesh);
    objectsMap['perpDirection'] = { name: 'perpDirection', mesh: perpVectorMesh, method: 'vector', delay: 0.3 };
    
    // Label for perpendicular direction
    const perpLabelPos = {
        x: intersectionPoint.x + 1.5 * perpDirectionNorm.x,
        y: intersectionPoint.y + 1.5 * perpDirectionNorm.y + 0.3,
        z: intersectionPoint.z + 1.5 * perpDirectionNorm.z
    };
    const perpLabel = label('b⃗ × d⃗', perpLabelPos, {
        color: '#000000'
    });
    if (perpLabel) {
        scene.add(perpLabel);
        objectsMap['perpDirectionLabel'] = { name: 'perpDirectionLabel', mesh: perpLabel, method: 'label', delay: 0.2 };
    }
    
    // Create the result line (perpendicular to both lines)
    const resultLineStart = {
        x: intersectionPoint.x - 3 * perpDirection.x,
        y: intersectionPoint.y - 3 * perpDirection.y,
        z: intersectionPoint.z - 3 * perpDirection.z
    };
    const resultLineEnd = {
        x: intersectionPoint.x + 3 * perpDirection.x,
        y: intersectionPoint.y + 3 * perpDirection.y,
        z: intersectionPoint.z + 3 * perpDirection.z
    };
    
    const resultLineMesh = line(resultLineStart, resultLineEnd, {
        color: 0x00ff00,  // Green
        thickness: 4      // Slightly thicker than other lines for emphasis
    });
    scene.add(resultLineMesh);
    objectsMap['resultLine'] = { name: 'resultLine', mesh: resultLineMesh, method: 'line', delay: 0.3 };
    
    // Label for result line
    const resultLabelPos = {
        x: intersectionPoint.x + 2.5 * perpDirectionNorm.x,
        y: intersectionPoint.y + 2.5 * perpDirectionNorm.y - 0.5,
        z: intersectionPoint.z + 2.5 * perpDirectionNorm.z
    };
    const resultLabel = label('L', resultLabelPos, {
        color: '#000000'
    });
    if (resultLabel) {
        scene.add(resultLabel);
        objectsMap['resultLineLabel'] = { name: 'resultLineLabel', mesh: resultLabel, method: 'label', delay: 0.2 };
    }
    
    // Create right angles to show perpendicularity
    // Use getRightAnglePoints utility as per documentation
    
    // First right angle between line1 and perpendicular line
    const rightAnglePoints1 = getRightAnglePoints(
        intersectionPoint,  // vertex at intersection
        line1Direction,     // direction along line1
        perpDirection,      // perpendicular direction
        0.4                // size factor
    );
    
    const rightAngle1Mesh = rightAngle(
        rightAnglePoints1.point1,
        rightAnglePoints1.vertex,
        rightAnglePoints1.point2,
        {
            size: 0.5,
            color: 0x666666,  // Gray for visibility
            filled: true,
            fillOpacity: 0.3
        }
    );
    if (rightAngle1Mesh) {
        scene.add(rightAngle1Mesh);
        objectsMap['rightAngle1'] = { name: 'rightAngle1', mesh: rightAngle1Mesh, method: 'rightAngle', delay: 0.2 };
    }
    
    // Second right angle between line2 and perpendicular line
    const rightAnglePoints2 = getRightAnglePoints(
        intersectionPoint,  // vertex at intersection
        line2Direction,     // direction along line2
        perpDirection,      // perpendicular direction
        0.4                // size factor
    );
    
    const rightAngle2Mesh = rightAngle(
        rightAnglePoints2.point1,
        rightAnglePoints2.vertex,
        rightAnglePoints2.point2,
        {
            size: 0.5,
            color: 0x666666,  // Gray for visibility
            filled: true,
            fillOpacity: 0.3
        }
    );
    if (rightAngle2Mesh) {
        scene.add(rightAngle2Mesh);
        objectsMap['rightAngle2'] = { name: 'rightAngle2', mesh: rightAngle2Mesh, method: 'rightAngle', delay: 0.2 };
    }
    
    // Build animation sequence and create paginator
    const sequencedObjects = buildAnimationSequence(objectsMap);
    const descriptions = getAllDescriptions();
    createPaginator(sequencedObjects, descriptions);
}