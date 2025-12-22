// Area of Parallelogram in 3D using LHS modules
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { point } from '../common/js/lhs/lhs_point.js';
import { line } from '../common/js/lhs/lhs_line.js';
import { polygon } from '../common/js/lhs/lhs_polygon.js';
import { vector } from '../common/js/lhs/lhs_vector.js';
import { label } from '../common/js/lhs/lhs_label.js';
import { crossProduct, magnitude } from '../common/js/lhs/lhs_geometry_utils.js';
import { createPaginator } from '../common/js/lhs/lhs_paginator.js';
import { getAllDescriptions } from './step_descriptions.js';

/**
 * Build the animation sequence order for the parallelogram area visualization
 * @param {Object} objectsMap - Map of all created objects with their metadata
 * @returns {Array} Ordered array of objects for animation sequence
 */
function buildAnimationSequence(objectsMap) {
    const sequencedObjects = [];
    
    // Step 1: Label the points and compute vectors AB and AD
    // Show all vertices first
    if (objectsMap['pointA']) sequencedObjects.push(objectsMap['pointA']);
    if (objectsMap['labelA']) sequencedObjects.push(objectsMap['labelA']);
    if (objectsMap['pointB']) sequencedObjects.push(objectsMap['pointB']);
    if (objectsMap['labelB']) sequencedObjects.push(objectsMap['labelB']);
    if (objectsMap['pointC']) sequencedObjects.push(objectsMap['pointC']);
    if (objectsMap['labelC']) sequencedObjects.push(objectsMap['labelC']);
    if (objectsMap['pointD']) sequencedObjects.push(objectsMap['pointD']);
    if (objectsMap['labelD']) sequencedObjects.push(objectsMap['labelD']);
    
    // Show vectors AB and AD
    if (objectsMap['vectorAB']) sequencedObjects.push(objectsMap['vectorAB']);
    if (objectsMap['labelAB']) sequencedObjects.push(objectsMap['labelAB']);
    if (objectsMap['vectorAD']) sequencedObjects.push(objectsMap['vectorAD']);
    if (objectsMap['labelAD']) sequencedObjects.push(objectsMap['labelAD']);
    
    // Step 2-3: Show the parallelogram (edges demonstrate opposite sides are parallel)
    if (objectsMap['edgeAB']) sequencedObjects.push(objectsMap['edgeAB']);
    if (objectsMap['edgeBC']) sequencedObjects.push(objectsMap['edgeBC']);
    if (objectsMap['edgeCD']) sequencedObjects.push(objectsMap['edgeCD']);
    if (objectsMap['edgeDA']) sequencedObjects.push(objectsMap['edgeDA']);
    if (objectsMap['parallelogram']) sequencedObjects.push(objectsMap['parallelogram']);
    
    // Step 4-5: Show the area (calculated from cross product magnitude)
    if (objectsMap['areaLabel']) sequencedObjects.push(objectsMap['areaLabel']);
    
    return sequencedObjects;
}

export async function render(scene) {
    // Store objects by name for sequencing
    const objectsMap = {};
    
    // Setup 3D coordinate system with enhanced lighting
    await setupCoordinateSystem(scene, {
        showAxes: true,
        axesRange: 10,
        axesTickStep: 2,
        showGrid: true,
        enableInteraction: true,
        cameraPosition: { x: -15, y: 12, z: -15 },
        cameraTarget: { x: 0, y: 0, z: 0 },
        lightingProfile: 'phong',
        viewSize: 15  
    });
    
    // Define parallelogram vertices
    const vertices = {
        A: { x: 5, y: 2, z: 0 },
        B: { x: 2, y: 6, z: 1 },
        C: { x: 2, y: 4, z: 7 },
        D: { x: 5, y: 0, z: 6 }
    };
    
    // Create vertices (points) with their labels
    const pointA = point(vertices.A, {
        color: 0x0000ff,  // Blue
        radius: 0.15
    });
    scene.add(pointA);
    objectsMap['pointA'] = { name: 'pointA', mesh: pointA, method: 'point', delay: 0.3 };
    
    const labelA = label('A', {
        x: vertices.A.x + 0.3,
        y: vertices.A.y + 0.3,
        z: vertices.A.z
    }, {
        color: '#0000ff'
    });
    if (labelA) {
        scene.add(labelA);
        objectsMap['labelA'] = { name: 'labelA', mesh: labelA, method: 'label', delay: 0.1 };
    }
    
    const pointB = point(vertices.B, {
        color: 0x0000ff,  // Blue
        radius: 0.15
    });
    scene.add(pointB);
    objectsMap['pointB'] = { name: 'pointB', mesh: pointB, method: 'point', delay: 0.3 };
    
    const labelB = label('B', {
        x: vertices.B.x + 0.3,
        y: vertices.B.y + 0.3,
        z: vertices.B.z
    }, {
        color: '#0000ff'
    });
    if (labelB) {
        scene.add(labelB);
        objectsMap['labelB'] = { name: 'labelB', mesh: labelB, method: 'label', delay: 0.1 };
    }
    
    const pointC = point(vertices.C, {
        color: 0x0000ff,  // Blue
        radius: 0.15
    });
    scene.add(pointC);
    objectsMap['pointC'] = { name: 'pointC', mesh: pointC, method: 'point', delay: 0.3 };
    
    const labelC = label('C', {
        x: vertices.C.x + 0.3,
        y: vertices.C.y + 0.3,
        z: vertices.C.z
    }, {
        color: '#0000ff'
    });
    if (labelC) {
        scene.add(labelC);
        objectsMap['labelC'] = { name: 'labelC', mesh: labelC, method: 'label', delay: 0.1 };
    }
    
    const pointD = point(vertices.D, {
        color: 0x0000ff,  // Blue
        radius: 0.15
    });
    scene.add(pointD);
    objectsMap['pointD'] = { name: 'pointD', mesh: pointD, method: 'point', delay: 0.3 };
    
    const labelD = label('D', {
        x: vertices.D.x + 0.3,
        y: vertices.D.y + 0.3,
        z: vertices.D.z
    }, {
        color: '#0000ff'
    });
    if (labelD) {
        scene.add(labelD);
        objectsMap['labelD'] = { name: 'labelD', mesh: labelD, method: 'label', delay: 0.1 };
    }
    
    // Create edges
    const edgeAB = line(vertices.A, vertices.B, {
        color: 0x000000,  // Black
        radius: 0.02
    });
    scene.add(edgeAB);
    objectsMap['edgeAB'] = { name: 'edgeAB', mesh: edgeAB, method: 'line', delay: 0.3 };
    
    const edgeBC = line(vertices.B, vertices.C, {
        color: 0x000000,  // Black
        radius: 0.02
    });
    scene.add(edgeBC);
    objectsMap['edgeBC'] = { name: 'edgeBC', mesh: edgeBC, method: 'line', delay: 0.3 };
    
    const edgeCD = line(vertices.C, vertices.D, {
        color: 0x000000,  // Black
        radius: 0.02
    });
    scene.add(edgeCD);
    objectsMap['edgeCD'] = { name: 'edgeCD', mesh: edgeCD, method: 'line', delay: 0.3 };
    
    const edgeDA = line(vertices.D, vertices.A, {
        color: 0x000000,  // Black
        radius: 0.02
    });
    scene.add(edgeDA);
    objectsMap['edgeDA'] = { name: 'edgeDA', mesh: edgeDA, method: 'line', delay: 0.3 };
    
    // Create filled parallelogram
    const parallelogramMesh = polygon([vertices.A, vertices.B, vertices.C, vertices.D], {
        color: 0xffc0cb,  // Pink
        opacity: 0.7,
        showEdges: false
    });
    scene.add(parallelogramMesh);
    objectsMap['parallelogram'] = { name: 'parallelogram', mesh: parallelogramMesh, method: 'polygon', delay: 0.5 };
    
    // Create vectors for cross product calculation
    const vectorAB = vector(vertices.A, vertices.B, {
        color: 0xff0000  // Red
    });
    scene.add(vectorAB);
    objectsMap['vectorAB'] = { name: 'vectorAB', mesh: vectorAB, method: 'vector', delay: 0.3 };
    
    const labelAB = label('AB', {
        x: (vertices.A.x + vertices.B.x) / 2 + 0.3,
        y: (vertices.A.y + vertices.B.y) / 2 + 0.3,
        z: (vertices.A.z + vertices.B.z) / 2
    }, {
        color: '#ff0000'
    });
    if (labelAB) {
        scene.add(labelAB);
        objectsMap['labelAB'] = { name: 'labelAB', mesh: labelAB, method: 'label', delay: 0.1 };
    }
    
    const vectorAD = vector(vertices.A, vertices.D, {
        color: 0x00ff00  // Green
    });
    scene.add(vectorAD);
    objectsMap['vectorAD'] = { name: 'vectorAD', mesh: vectorAD, method: 'vector', delay: 0.3 };
    
    const labelAD = label('AD', {
        x: (vertices.A.x + vertices.D.x) / 2 + 0.3,
        y: (vertices.A.y + vertices.D.y) / 2 + 0.3,
        z: (vertices.A.z + vertices.D.z) / 2
    }, {
        color: '#00ff00'
    });
    if (labelAD) {
        scene.add(labelAD);
        objectsMap['labelAD'] = { name: 'labelAD', mesh: labelAD, method: 'label', delay: 0.1 };
    }
    
    // Calculate cross product for area
    const AB = {
        x: vertices.B.x - vertices.A.x,
        y: vertices.B.y - vertices.A.y,
        z: vertices.B.z - vertices.A.z
    };
    
    const AD = {
        x: vertices.D.x - vertices.A.x,
        y: vertices.D.y - vertices.A.y,
        z: vertices.D.z - vertices.A.z
    };
    
    const crossProd = crossProduct(AB, AD);
    const area = magnitude(crossProd);
    
    // Add area label at the center of the parallelogram
    const center = {
        x: (vertices.A.x + vertices.B.x + vertices.C.x + vertices.D.x) / 4,
        y: (vertices.A.y + vertices.B.y + vertices.C.y + vertices.D.y) / 4,
        z: (vertices.A.z + vertices.B.z + vertices.C.z + vertices.D.z) / 4
    };
    
    const areaLabelMesh = label(`Area = ${area.toFixed(2)}`, center, {
        color: '#ff00ff'
    });
    if (areaLabelMesh) {
        scene.add(areaLabelMesh);
        objectsMap['areaLabel'] = { name: 'areaLabel', mesh: areaLabelMesh, method: 'label', delay: 0.3 };
    }
    
    // Build the animation sequence and create paginator controls
    const sequencedObjects = buildAnimationSequence(objectsMap);
    
    // Get educational step descriptions with the calculated area
    const descriptions = getAllDescriptions(area.toFixed(2));
    
    createPaginator(sequencedObjects, descriptions);
}