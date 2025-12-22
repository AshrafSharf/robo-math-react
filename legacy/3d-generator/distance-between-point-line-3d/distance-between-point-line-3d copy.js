// Distance Between Point and Line in 3D using LHS modules
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { point } from '../common/js/lhs/lhs_point.js';
import { line, dashedThickLine } from '../common/js/lhs/lhs_line.js';
import { vector } from '../common/js/lhs/lhs_vector.js';
import { label } from '../common/js/lhs/lhs_label.js';
import { rightAngle } from '../common/js/lhs/lhs_right_angle.js';
import { normalize, crossProduct, magnitude, subtractVectors, dotProduct, scaleVector, addVectors, getRightAnglePoints } from '../common/js/lhs/lhs_geometry_utils.js';
import { createPaginator } from '../common/js/lhs/lhs_paginator.js';
import { getAllDescriptions } from './step_descriptions.js';

/**
 * Build the animation sequence order for the distance visualization
 * @param {Object} objectsMap - Map of all created objects with their metadata
 * @returns {Array} Ordered array of objects for animation sequence
 */
function buildAnimationSequence(objectsMap) {
    const sequencedObjects = [];
    
    // Step 1: Show the line and point P on the line
    if (objectsMap['lineSegment']) sequencedObjects.push(objectsMap['lineSegment']);
    if (objectsMap['pointP']) sequencedObjects.push(objectsMap['pointP']);
    if (objectsMap['pLabel']) sequencedObjects.push(objectsMap['pLabel']);
    
    // Step 2: Show point Q (external point)
    if (objectsMap['pointQ']) sequencedObjects.push(objectsMap['pointQ']);
    if (objectsMap['qLabel']) sequencedObjects.push(objectsMap['qLabel']);
    
    // Step 3: Show vector PQ
    if (objectsMap['vectorPQ']) sequencedObjects.push(objectsMap['vectorPQ']);
    if (objectsMap['pqLabel']) sequencedObjects.push(objectsMap['pqLabel']);
    
    // Step 4: Show direction vector
    if (objectsMap['directionVector']) sequencedObjects.push(objectsMap['directionVector']);
    if (objectsMap['uLabel']) sequencedObjects.push(objectsMap['uLabel']);
    
    // Step 5: Show closest point and perpendicular distance
    if (objectsMap['closestPoint']) sequencedObjects.push(objectsMap['closestPoint']);
    if (objectsMap['closestLabel']) sequencedObjects.push(objectsMap['closestLabel']);
    if (objectsMap['distanceLine']) sequencedObjects.push(objectsMap['distanceLine']);
    if (objectsMap['dLabel']) sequencedObjects.push(objectsMap['dLabel']);
    if (objectsMap['rightAngleMarker']) sequencedObjects.push(objectsMap['rightAngleMarker']);
    
    return sequencedObjects;
}

export function render(scene, _panelInstance, config) {
    // Store objects by name for sequencing
    const objectsMap = {};
    
    // Setup 3D coordinate system with enhanced Phong lighting
    setupCoordinateSystem(scene, {
        showAxes: true,
        axesRange: 8,
        axesTickStep: 2,
        showGrid: false,
        enableInteraction: true,
        cameraPosition: { x: 12, y: 10, z: -15 },
        cameraTarget: { x: 0, y: 0, z: 0 },
        lightingProfile: 'phong'  // Enhanced lighting for better visualization
    });
    
    // Initialize from config if provided, otherwise use defaults
    let pointQ = { x: 3, y: -1, z: 4 };
    let linePoint = { x: -2, y: 0, z: 1 };  // Point P when t=0
    let lineDirection = { x: 3, y: -2, z: 4 };  // Direction vector
    
    if (config?.initialValues) {
        if (config.initialValues.pointQ) {
            pointQ = { ...config.initialValues.pointQ };
        }
        if (config.initialValues.linePoint) {
            linePoint = { ...config.initialValues.linePoint };
        }
        if (config.initialValues.lineDirection) {
            lineDirection = { ...config.initialValues.lineDirection };
        }
    }
    
    // Calculate two points on the line for visualization
    const t1 = -3, t2 = 3;
    const lineStart = {
        x: linePoint.x + lineDirection.x * t1,
        y: linePoint.y + lineDirection.y * t1,
        z: linePoint.z + lineDirection.z * t1
    };
    const lineEnd = {
        x: linePoint.x + lineDirection.x * t2,
        y: linePoint.y + lineDirection.y * t2,
        z: linePoint.z + lineDirection.z * t2
    };
    
    // Create the line
    const lineSegment = line(lineStart, lineEnd, {
        color: 0x0000ff,  // Blue
        radius: 0.04
    });
    scene.add(lineSegment);
    objectsMap['lineSegment'] = { name: 'lineSegment', mesh: lineSegment, method: 'line', delay: 0.3 };
    
    // Create Point P on the line
    const pointPMesh = point(linePoint, {
        color: 0xffff00,  // Yellow
        radius: 0.15
    });
    scene.add(pointPMesh);
    objectsMap['pointP'] = { name: 'pointP', mesh: pointPMesh, method: 'point', delay: 0.3 };
    
    // Label for point P with offset
    const pLabelPos = {
        x: linePoint.x - 0.3,
        y: linePoint.y + 0.3,
        z: linePoint.z
    };
    const pLabel = label('P', pLabelPos, {
        color: '#000000'  // Black for visibility
    });
    if (pLabel) {
        scene.add(pLabel);
        objectsMap['pLabel'] = { name: 'pLabel', mesh: pLabel, method: 'label', delay: 0.2 };
    }
    
    // Create Point Q (external point)
    const pointQMesh = point(pointQ, {
        color: 0xff0000,  // Red
        radius: 0.12
    });
    scene.add(pointQMesh);
    objectsMap['pointQ'] = { name: 'pointQ', mesh: pointQMesh, method: 'point', delay: 0.3 };
    
    // Label for point Q with offset
    const qLabelPos = {
        x: pointQ.x + 0.3,
        y: pointQ.y + 0.3,
        z: pointQ.z
    };
    const qLabel = label('Q', qLabelPos, {
        color: '#000000'  // Black for visibility
    });
    if (qLabel) {
        scene.add(qLabel);
        objectsMap['qLabel'] = { name: 'qLabel', mesh: qLabel, method: 'label', delay: 0.2 };
    }
    
    // Calculate vector PQ
    const PQ = subtractVectors(pointQ, linePoint);
    
    // Create vector PQ visualization
    const vectorPQMesh = vector(linePoint, pointQ, {
        color: 0x0080ff  // Light blue
    });
    scene.add(vectorPQMesh);
    objectsMap['vectorPQ'] = { name: 'vectorPQ', mesh: vectorPQMesh, method: 'vector', delay: 0.3 };
    
    // Label for vector PQ at midpoint with offset
    const pqMidpoint = {
        x: (linePoint.x + pointQ.x) / 2,
        y: (linePoint.y + pointQ.y) / 2,
        z: (linePoint.z + pointQ.z) / 2
    };
    const pqLabelPos = {
        x: pqMidpoint.x - 0.5,
        y: pqMidpoint.y + 0.3,
        z: pqMidpoint.z
    };
    const pqLabel = label('PQ', pqLabelPos, {
        color: '#000000'
    });
    if (pqLabel) {
        scene.add(pqLabel);
        objectsMap['pqLabel'] = { name: 'pqLabel', mesh: pqLabel, method: 'label', delay: 0.2 };
    }
    
    // Show direction vector from P
    const directionEnd = addVectors(linePoint, scaleVector(normalize(lineDirection), 2));
    const directionVectorMesh = vector(linePoint, directionEnd, {
        color: 0x00ff00  // Green
    });
    scene.add(directionVectorMesh);
    objectsMap['directionVector'] = { name: 'directionVector', mesh: directionVectorMesh, method: 'vector', delay: 0.3 };
    
    // Label for direction vector with offset
    const uLabelPos = {
        x: directionEnd.x + 0.2,
        y: directionEnd.y + 0.3,
        z: directionEnd.z + 0.2
    };
    const uLabel = label('u', uLabelPos, {
        color: '#000000'
    });
    if (uLabel) {
        scene.add(uLabel);
        objectsMap['uLabel'] = { name: 'uLabel', mesh: uLabel, method: 'label', delay: 0.2 };
    }
    
    // Calculate closest point on line and distance
    const dirMag = magnitude(lineDirection);
    
    if (dirMag > 0.001) {
        // Project PQ onto direction vector to find t
        const t = dotProduct(PQ, lineDirection) / dotProduct(lineDirection, lineDirection);
        
        // Closest point on line
        const closestPoint = addVectors(linePoint, scaleVector(lineDirection, t));
        
        // Calculate distance using cross product formula
        const cross = crossProduct(PQ, lineDirection);
        const crossMag = magnitude(cross);
        const distance = crossMag / dirMag;
        
        // Create closest point
        const closestPointMesh = point(closestPoint, {
            color: 0x00ff00,  // Green
            radius: 0.08
        });
        scene.add(closestPointMesh);
        objectsMap['closestPoint'] = { name: 'closestPoint', mesh: closestPointMesh, method: 'point', delay: 0.3 };
        
        // Label for closest point with offset
        const closestLabelPos = {
            x: closestPoint.x + 0.3,
            y: closestPoint.y - 0.3,
            z: closestPoint.z
        };
        const closestLabel = label('C', closestLabelPos, {
            color: '#000000'
        });
        if (closestLabel) {
            scene.add(closestLabel);
            objectsMap['closestLabel'] = { name: 'closestLabel', mesh: closestLabel, method: 'label', delay: 0.2 };
        }
        
        // Create dashed distance line
        if (distance > 0.01) {
            const distanceLineMesh = dashedThickLine(pointQ, closestPoint, {
                color: 0xff1493,  // Deep pink
                dashSize: 0.2,
                gapSize: 0.1,
                radius: 0.025
            });
            scene.add(distanceLineMesh);
            objectsMap['distanceLine'] = { name: 'distanceLine', mesh: distanceLineMesh, method: 'dashedThickLine', delay: 0.3 };
            
            // Add distance label at midpoint with offset
            const midpoint = {
                x: (pointQ.x + closestPoint.x) / 2,
                y: (pointQ.y + closestPoint.y) / 2,
                z: (pointQ.z + closestPoint.z) / 2
            };
            const dLabelPos = {
                x: midpoint.x + 0.3,
                y: midpoint.y + 0.3,
                z: midpoint.z
            };
            const dLabel = label('D', dLabelPos, {
                color: '#000000'
            });
            if (dLabel) {
                scene.add(dLabel);
                objectsMap['dLabel'] = { name: 'dLabel', mesh: dLabel, method: 'label', delay: 0.2 };
            }
            
            // Create right angle marker at closest point using the utility function
            const rightAnglePoints = getRightAnglePoints(
                closestPoint,
                subtractVectors(pointQ, closestPoint),  // Vector towards Q
                lineDirection,                           // Vector along line
                0.5
            );
            
            // Create the right angle marker with the generated points
            const rightAngleMarker = rightAngle(
                rightAnglePoints.point1,
                rightAnglePoints.vertex,
                rightAnglePoints.point2,
                {
                    size: 0.3,
                    color: 0x666666,  // Gray
                    filled: true,
                    fillOpacity: 0.3
                }
            );
            
            scene.add(rightAngleMarker);
            objectsMap['rightAngleMarker'] = { name: 'rightAngleMarker', mesh: rightAngleMarker, method: 'rightAngle', delay: 0.2 };
        }
        
        // Build the animation sequence and create paginator controls
        const sequencedObjects = buildAnimationSequence(objectsMap);
        
        // Get educational step descriptions with the calculated distance
        const descriptions = getAllDescriptions(distance.toFixed(3));
        
        createPaginator(sequencedObjects, descriptions);
    }
}

export function reset() {
    // Reset functionality can be added if needed
    // Since we're using paginator, reset might not be necessary
}