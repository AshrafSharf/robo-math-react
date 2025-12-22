// Angle Between Two Planes in 3D using LHS modules
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { plane } from '../common/js/lhs/lhs_plane.js';
import { vector } from '../common/js/lhs/lhs_vector.js';
import { arcByThreePoints } from '../common/js/lhs/lhs_angle_arc.js';
import { label } from '../common/js/lhs/lhs_label.js';
import { line } from '../common/js/lhs/lhs_line.js';
import { normalize, angleBetween } from '../common/js/lhs/lhs_geometry_utils.js';
import { getAngleBetweenPlanes } from '../common/js/lhs/inspect_3d.js';
import { createPaginator } from '../common/js/lhs/lhs_paginator.js';
import { getAllDescriptions } from './step_descriptions.js';

/**
 * Build the animation sequence order for the angle between planes visualization
 * @param {Object} objectsMap - Map of all created objects with their metadata
 * @returns {Array} Ordered array of objects for animation sequence
 */
function buildAnimationSequence(objectsMap) {
    const sequencedObjects = [];
    
    // 1. Add planes
    if (objectsMap['plane1']) sequencedObjects.push(objectsMap['plane1']);
    if (objectsMap['plane2']) sequencedObjects.push(objectsMap['plane2']);
    
    // 2. Add normal vectors with their labels
    if (objectsMap['normal1Vector']) sequencedObjects.push(objectsMap['normal1Vector']);
    if (objectsMap['n1Label']) sequencedObjects.push(objectsMap['n1Label']);
    if (objectsMap['normal2Vector']) sequencedObjects.push(objectsMap['normal2Vector']);
    if (objectsMap['n2Label']) sequencedObjects.push(objectsMap['n2Label']);
    
    // 3. Add angle visualization elements
    if (objectsMap['normalArc']) sequencedObjects.push(objectsMap['normalArc']);
    if (objectsMap['mainAngleLabel']) sequencedObjects.push(objectsMap['mainAngleLabel']);
    
    // 4. Add intersection angle elements
    if (objectsMap['line1']) sequencedObjects.push(objectsMap['line1']);
    if (objectsMap['line2']) sequencedObjects.push(objectsMap['line2']);
    if (objectsMap['intersectionArc']) sequencedObjects.push(objectsMap['intersectionArc']);
    if (objectsMap['angleLabel1']) sequencedObjects.push(objectsMap['angleLabel1']);
    
    return sequencedObjects;
}

export function render(scene) {
    // Store objects by name for sequencing
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
        lightingProfile: 'phong'  // Enhanced lighting for better visualization
    });
    
    // Define two planes by their normal vectors and a point
    // Plane 1: x + y + z = 3 (tilted plane)
    const normal1 = { x: 1, y: 1, z: 1 };  // Normal vector (a, b, c)
    const normalizedNormal1 = normalize(normal1);
    
    // Plane 2: z = 2 (horizontal plane)
    const normal2 = { x: 0, y: 0, z: 1 };  // Normal vector
    const normalizedNormal2 = normalize(normal2);
    
    // Calculate angle between planes (angle between normals)
    const angle = angleBetween(normalizedNormal1, normalizedNormal2);
    const angleDegrees = (angle * 180 / Math.PI).toFixed(1);
    
    // Create plane 1 (blue, tilted)
    const plane1Mesh = plane(
        { x: 1, y: 1, z: 1 },  // Center point on the plane
        normal1,
        {
            size: 8,
            color: 0x0000ff  // Blue
        }
    );
    scene.add(plane1Mesh);
    objectsMap['plane1'] = { name: 'plane1', mesh: plane1Mesh, method: 'plane', delay: 0.3 };
    
    // Create plane 2 (red, horizontal)
    const plane2Mesh = plane(
        { x: 0, y: 0, z: 2 },  // Center point on the plane
        normal2,
        {
            size: 8,
            color: 0xff0000  // Red
        }
    );
    scene.add(plane2Mesh);
    objectsMap['plane2'] = { name: 'plane2', mesh: plane2Mesh, method: 'plane', delay: 0.3 };
    
    // Get the intersection points for drawing the angle
    const anglePoints = getAngleBetweenPlanes(plane1Mesh, plane2Mesh);
    
    console.log('Angle points:', anglePoints);
    
    if (anglePoints) {
        // Draw the angle arc at the intersection
        const intersectionArc = arcByThreePoints(
            anglePoints.point1,
            anglePoints.vertex,
            anglePoints.point2,
            {
                color: 0x00ff00  // Green for angle
            }
        );
        console.log('Intersection arc created:', intersectionArc);
        if (intersectionArc) {
            scene.add(intersectionArc);
            objectsMap['intersectionArc'] = { name: 'intersectionArc', mesh: intersectionArc, method: 'arcByThreePoints', delay: 0.3 };
        }
        
        // Draw lines from vertex to angle points to show the angle clearly
        const line1 = line(
            anglePoints.vertex,
            anglePoints.point1,
            {
                color: 0x0000ff,  // Blue - matches plane 1
                radius: 0.02,
                opacity: 0.8
            }
        );
        scene.add(line1);
        objectsMap['line1'] = { name: 'line1', mesh: line1, method: 'line', delay: 0.2 };
        
        const line2 = line(
            anglePoints.vertex,
            anglePoints.point2,
            {
                color: 0xff0000,  // Red - matches plane 2
                radius: 0.02,
                opacity: 0.8
            }
        );
        scene.add(line2);
        objectsMap['line2'] = { name: 'line2', mesh: line2, method: 'line', delay: 0.2 };
        
        // Add angle label at the midpoint of the arc
        const midPoint = {
            x: (anglePoints.point1.x + anglePoints.point2.x) / 2,
            y: (anglePoints.point1.y + anglePoints.point2.y) / 2,
            z: (anglePoints.point1.z + anglePoints.point2.z) / 2
        };
        
        // Calculate direction from vertex to midpoint and extend it slightly
        const dirToMid = {
            x: midPoint.x - anglePoints.vertex.x,
            y: midPoint.y - anglePoints.vertex.y,
            z: midPoint.z - anglePoints.vertex.z
        };
        const normalizedDir = normalize(dirToMid);
        
        const labelPosition = {
            x: anglePoints.vertex.x + normalizedDir.x * 2,
            y: anglePoints.vertex.y + normalizedDir.y * 2,
            z: anglePoints.vertex.z + normalizedDir.z * 2
        };
        
        const angleLabel = label(`θ = ${angleDegrees}°`, labelPosition, {
            color: '#00ff00'  // Green
        });
        if (angleLabel) {
            scene.add(angleLabel);
            objectsMap['angleLabel1'] = { name: 'angleLabel1', mesh: angleLabel, method: 'label', delay: 0.2 };
        }
    }
    
    // For better visualization, let's find a common point near the intersection
    // The intersection line of these two planes can be found by solving:
    // x + y + z = 3 and z = 2, which gives x + y = 1
    // Let's use x = 0, y = 1, z = 2 as a point on the intersection
    const intersectionPoint = { x: 0, y: 1, z: 2 };
    
    // Scale normals for visibility (length of 3 units)
    const normalLength = 3;
    
    // Normal vector 1 from a point on plane 1
    const normal1End = {
        x: intersectionPoint.x + normalizedNormal1.x * normalLength,
        y: intersectionPoint.y + normalizedNormal1.y * normalLength,
        z: intersectionPoint.z + normalizedNormal1.z * normalLength
    };
    
    // Normal vector 2 from the same intersection point
    const normal2End = {
        x: intersectionPoint.x + normalizedNormal2.x * normalLength,
        y: intersectionPoint.y + normalizedNormal2.y * normalLength,
        z: intersectionPoint.z + normalizedNormal2.z * normalLength
    };
    
    // Create normal vector 1 (blue arrow) from intersection point
    const normal1Vector = vector(intersectionPoint, normal1End, {
        color: 0x0000ff  // Blue
    });
    scene.add(normal1Vector);
    objectsMap['normal1Vector'] = { name: 'normal1Vector', mesh: normal1Vector, method: 'vector', delay: 0.3 };
    
    // Create normal vector 2 (red arrow) from intersection point
    const normal2Vector = vector(intersectionPoint, normal2End, {
        color: 0xff0000  // Red
    });
    scene.add(normal2Vector);
    objectsMap['normal2Vector'] = { name: 'normal2Vector', mesh: normal2Vector, method: 'vector', delay: 0.3 };
    
    // Draw angle arc between the normal vectors at the intersection point
    const normalArc = arcByThreePoints(
        normal1End,
        intersectionPoint,
        normal2End,
        {
            color: 0x00ff00  // Green for angle
        }
    );
    if (normalArc) {
        scene.add(normalArc);
        objectsMap['normalArc'] = { name: 'normalArc', mesh: normalArc, method: 'arcByThreePoints', delay: 0.3 };
    }
    
    // Add angle label near the arc between normals
    const arcMidpoint = {
        x: (normal1End.x + normal2End.x) / 2,
        y: (normal1End.y + normal2End.y) / 2,
        z: (normal1End.z + normal2End.z) / 2
    };
    
    // Direction from intersection point to arc midpoint
    const toArcMid = {
        x: arcMidpoint.x - intersectionPoint.x,
        y: arcMidpoint.y - intersectionPoint.y,
        z: arcMidpoint.z - intersectionPoint.z
    };
    const normalizedToArcMid = normalize(toArcMid);
    
    // Place label along this direction
    const angleLabelPos = {
        x: intersectionPoint.x + normalizedToArcMid.x * 1.5,
        y: intersectionPoint.y + normalizedToArcMid.y * 1.5,
        z: intersectionPoint.z + normalizedToArcMid.z * 1.5
    };
    
    const mainAngleLabel = label(`θ = ${angleDegrees}°`, angleLabelPos, {
        color: '#00ff00'  // Green
    });
    if (mainAngleLabel) {
        scene.add(mainAngleLabel);
        objectsMap['mainAngleLabel'] = { name: 'mainAngleLabel', mesh: mainAngleLabel, method: 'label', delay: 0.2 };
    }
    
    
    // Label for normal 1 - position slightly beyond the arrow head
    const n1LabelPos = {
        x: normal1End.x + normalizedNormal1.x * 0.3,
        y: normal1End.y + normalizedNormal1.y * 0.3,
        z: normal1End.z + normalizedNormal1.z * 0.3
    };
    const n1Label = label('n₁', n1LabelPos, {
        color: '#0000ff'  // Blue
    });
    if (n1Label) {
        scene.add(n1Label);
        objectsMap['n1Label'] = { name: 'n1Label', mesh: n1Label, method: 'label', delay: 0.2 };
    }
    
    // Label for normal 2 - position slightly beyond the arrow head
    const n2LabelPos = {
        x: normal2End.x + normalizedNormal2.x * 0.3,
        y: normal2End.y + normalizedNormal2.y * 0.3,
        z: normal2End.z + normalizedNormal2.z * 0.3
    };
    const n2Label = label('n₂', n2LabelPos, {
        color: '#ff0000'  // Red
    });
    if (n2Label) {
        scene.add(n2Label);
        objectsMap['n2Label'] = { name: 'n2Label', mesh: n2Label, method: 'label', delay: 0.2 };
    }
    
    // Build the animation sequence and create paginator controls
    const sequencedObjects = buildAnimationSequence(objectsMap);
    
    // Get educational step descriptions with the calculated angle
    const descriptions = getAllDescriptions(angleDegrees);
    
    createPaginator(sequencedObjects, descriptions);
}