import * as THREE from 'three';

/**
 * Creates a cuboid (rectangular box) from two diagonal corner points
 * @param {Object} corner1 - First corner point in Three.js coordinates {x, y, z}
 * @param {Object} corner2 - Opposite diagonal corner in Three.js coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of the cuboid faces (default: 0x4488ff blue)
 * @param {number} options.opacity - Opacity of faces (default: 0.2)
 * @param {boolean} options.transparent - Whether faces are transparent (default: true)
 * @param {boolean} options.showEdges - Show cuboid edges (default: true)
 * @param {number} options.edgeColor - Color of edges (default: 0x0000ff darker blue)
 * @param {number} options.edgeOpacity - Opacity of edges (default: 0.8)
 * @param {number} options.linewidth - Width of edge lines (default: 1)
 * @param {boolean} options.wireframe - Show only wireframe (default: false)
 * @returns {THREE.Group} Group containing the cuboid mesh and optional edges
 */
export function cuboid(corner1, corner2, options = {}) {
    const {
        color = 0x4488ff,
        opacity = 0.2,
        transparent = true,
        showEdges = true,
        edgeColor = 0x0000ff,
        edgeOpacity = 0.8,
        linewidth = 1,
        wireframe = false
    } = options;
    
    // Create group to hold cuboid and edges
    const cuboidGroup = new THREE.Group();
    
    // Get min and max coordinates for each axis
    const minX = Math.min(corner1.x, corner2.x);
    const maxX = Math.max(corner1.x, corner2.x);
    const minY = Math.min(corner1.y, corner2.y);
    const maxY = Math.max(corner1.y, corner2.y);
    const minZ = Math.min(corner1.z, corner2.z);
    const maxZ = Math.max(corner1.z, corner2.z);
    
    // Define all 8 vertices of the cuboid in Three.js coordinates
    const vertices = [
        { x: minX, y: minY, z: minZ },  // 0: bottom-left-back
        { x: maxX, y: minY, z: minZ },  // 1: bottom-right-back
        { x: maxX, y: maxY, z: minZ },  // 2: bottom-right-front
        { x: minX, y: maxY, z: minZ },  // 3: bottom-left-front
        { x: minX, y: minY, z: maxZ },  // 4: top-left-back
        { x: maxX, y: minY, z: maxZ },  // 5: top-right-back
        { x: maxX, y: maxY, z: maxZ },  // 6: top-right-front
        { x: minX, y: maxY, z: maxZ }   // 7: top-left-front
    ];
    
    // Use Three.js coordinates directly
    const threeVertices = vertices.map(v => new THREE.Vector3(v.x, v.y, v.z));
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    
    // Flatten vertices for buffer attribute
    const positions = [];
    threeVertices.forEach(v => {
        positions.push(v.x, v.y, v.z);
    });
    
    // Define faces (two triangles per face)
    const indices = [
        // Bottom face (z = minZ)
        0, 1, 2,  0, 2, 3,
        // Top face (z = maxZ)
        4, 7, 6,  4, 6, 5,
        // Front face (y = maxY)
        3, 2, 6,  3, 6, 7,
        // Back face (y = minY)
        0, 4, 5,  0, 5, 1,
        // Left face (x = minX)
        0, 3, 7,  0, 7, 4,
        // Right face (x = maxX)
        1, 5, 6,  1, 6, 2
    ];
    
    // Set geometry attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    // Create material
    let material;
    if (wireframe) {
        material = new THREE.MeshBasicMaterial({
            color: color,
            wireframe: true,
            opacity: opacity,
            transparent: transparent
        });
    } else {
        material = new THREE.MeshBasicMaterial({
            color: color,
            opacity: opacity,
            transparent: transparent,
            side: THREE.DoubleSide
        });
    }
    
    // Create mesh
    const cuboidMesh = new THREE.Mesh(geometry, material);
    cuboidGroup.add(cuboidMesh);
    
    // Add edges if requested
    if (showEdges && !wireframe) {
        const edges = new THREE.EdgesGeometry(geometry);
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: edgeColor,
            opacity: edgeOpacity,
            transparent: edgeOpacity < 1.0,
            linewidth: linewidth
        });
        const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
        cuboidGroup.add(edgeLines);
    }
    
    return cuboidGroup;
}

/**
 * Creates a wireframe cuboid (edges only) from two diagonal corner points
 * @param {Object} corner1 - First corner point in Three.js coordinates {x, y, z}
 * @param {Object} corner2 - Opposite diagonal corner in Three.js coordinates {x, y, z}
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of the edges (default: 0x000000 black)
 * @param {number} options.opacity - Opacity of edges (default: 1.0)
 * @param {number} options.linewidth - Width of edge lines (default: 2)
 * @returns {THREE.LineSegments} The wireframe cuboid
 */
export function wireframeCuboid(corner1, corner2, options = {}) {
    const {
        color = 0x000000,
        opacity = 1.0,
        linewidth = 2
    } = options;
    
    // Get min and max coordinates
    const minX = Math.min(corner1.x, corner2.x);
    const maxX = Math.max(corner1.x, corner2.x);
    const minY = Math.min(corner1.y, corner2.y);
    const maxY = Math.max(corner1.y, corner2.y);
    const minZ = Math.min(corner1.z, corner2.z);
    const maxZ = Math.max(corner1.z, corner2.z);
    
    // Define vertices in Three.js coordinates
    const vertices = [
        { x: minX, y: minY, z: minZ },
        { x: maxX, y: minY, z: minZ },
        { x: maxX, y: maxY, z: minZ },
        { x: minX, y: maxY, z: minZ },
        { x: minX, y: minY, z: maxZ },
        { x: maxX, y: minY, z: maxZ },
        { x: maxX, y: maxY, z: maxZ },
        { x: minX, y: maxY, z: maxZ }
    ];
    
    // Use Three.js coordinates directly
    const threeVertices = vertices.map(v => new THREE.Vector3(v.x, v.y, v.z));
    
    // Define edges (pairs of vertex indices)
    const edgeIndices = [
        // Bottom face edges
        0, 1,  1, 2,  2, 3,  3, 0,
        // Top face edges
        4, 5,  5, 6,  6, 7,  7, 4,
        // Vertical edges
        0, 4,  1, 5,  2, 6,  3, 7
    ];
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    
    // Create positions array for edges
    const positions = [];
    for (let i = 0; i < edgeIndices.length; i += 2) {
        const v1 = threeVertices[edgeIndices[i]];
        const v2 = threeVertices[edgeIndices[i + 1]];
        positions.push(v1.x, v1.y, v1.z);
        positions.push(v2.x, v2.y, v2.z);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    // Create material
    const material = new THREE.LineBasicMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0,
        linewidth: linewidth
    });
    
    // Create line segments
    const wireframe = new THREE.LineSegments(geometry, material);
    
    return wireframe;
}

/**
 * Creates a bounding box cuboid around a set of points
 * @param {Array<Object>} points - Array of points in Three.js coordinates [{x, y, z}, ...]
 * @param {Object} options - Configuration options (same as cuboid)
 * @returns {THREE.Group} Group containing the bounding box cuboid
 */
export function boundingBoxCuboid(points, options = {}) {
    if (!points || points.length === 0) {
        console.warn('No points provided for bounding box');
        return new THREE.Group();
    }
    
    // Find min and max coordinates
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    points.forEach(point => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        minZ = Math.min(minZ, point.z);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
        maxZ = Math.max(maxZ, point.z);
    });
    
    // Create cuboid from the bounding corners
    return cuboid(
        { x: minX, y: minY, z: minZ },
        { x: maxX, y: maxY, z: maxZ },
        options
    );
}

/**
 * Creates an open box (cuboid without top face)
 * @param {Object} dimensions - Box dimensions {width, height, depth} in Three.js coordinates
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of box faces (default: 0x4488ff blue)
 * @param {number} options.opacity - Opacity of faces (default: 0.8)
 * @param {boolean} options.transparent - Whether faces are transparent (default: true)
 * @param {boolean} options.showEdges - Show box edges (default: true)
 * @param {number} options.edgeColor - Color of edges (default: 0x000000 black)
 * @param {number} options.linewidth - Width of edge lines (default: 2)
 * @param {Object} options.position - Position of box center {x, y, z} (default: {x: 0, y: 0, z: 0})
 * @returns {THREE.Group} Group containing the open box
 */
export function createOpenBox(dimensions, options = {}) {
    const {
        color = 0x4488ff,
        opacity = 0.8,
        transparent = true,
        showEdges = true,
        edgeColor = 0x000000,
        linewidth = 2,
        position = { x: 0, y: 0, z: 0 }
    } = options;
    
    const { width, height, depth } = dimensions;
    const boxGroup = new THREE.Group();
    
    // Material for faces
    const faceMaterial = new THREE.MeshPhongMaterial({
        color: color,
        transparent: transparent,
        opacity: opacity,
        side: THREE.DoubleSide,
        shininess: 30,
        specular: 0x444444
    });
    
    // Bottom face
    const bottomGeometry = new THREE.PlaneGeometry(width, depth);
    const bottom = new THREE.Mesh(bottomGeometry, faceMaterial);
    bottom.rotation.x = -Math.PI / 2;
    bottom.position.y = -height / 2;
    boxGroup.add(bottom);
    
    // Front face
    const frontGeometry = new THREE.PlaneGeometry(width, height);
    const front = new THREE.Mesh(frontGeometry, faceMaterial);
    front.position.z = depth / 2;
    boxGroup.add(front);
    
    // Back face
    const back = new THREE.Mesh(frontGeometry, faceMaterial);
    back.position.z = -depth / 2;
    back.rotation.y = Math.PI;
    boxGroup.add(back);
    
    // Left face
    const sideGeometry = new THREE.PlaneGeometry(depth, height);
    const left = new THREE.Mesh(sideGeometry, faceMaterial);
    left.position.x = -width / 2;
    left.rotation.y = -Math.PI / 2;
    boxGroup.add(left);
    
    // Right face
    const right = new THREE.Mesh(sideGeometry, faceMaterial);
    right.position.x = width / 2;
    right.rotation.y = Math.PI / 2;
    boxGroup.add(right);
    
    // Add edges if requested
    if (showEdges) {
        // Create edge lines
        const edgePoints = [];
        
        // Bottom edges
        edgePoints.push(
            new THREE.Vector3(-width/2, -height/2, -depth/2),
            new THREE.Vector3(width/2, -height/2, -depth/2),
            new THREE.Vector3(width/2, -height/2, -depth/2),
            new THREE.Vector3(width/2, -height/2, depth/2),
            new THREE.Vector3(width/2, -height/2, depth/2),
            new THREE.Vector3(-width/2, -height/2, depth/2),
            new THREE.Vector3(-width/2, -height/2, depth/2),
            new THREE.Vector3(-width/2, -height/2, -depth/2)
        );
        
        // Vertical edges
        edgePoints.push(
            new THREE.Vector3(-width/2, -height/2, -depth/2),
            new THREE.Vector3(-width/2, height/2, -depth/2),
            new THREE.Vector3(width/2, -height/2, -depth/2),
            new THREE.Vector3(width/2, height/2, -depth/2),
            new THREE.Vector3(width/2, -height/2, depth/2),
            new THREE.Vector3(width/2, height/2, depth/2),
            new THREE.Vector3(-width/2, -height/2, depth/2),
            new THREE.Vector3(-width/2, height/2, depth/2)
        );
        
        // Top edges (open box, so top rim)
        edgePoints.push(
            new THREE.Vector3(-width/2, height/2, -depth/2),
            new THREE.Vector3(width/2, height/2, -depth/2),
            new THREE.Vector3(width/2, height/2, -depth/2),
            new THREE.Vector3(width/2, height/2, depth/2),
            new THREE.Vector3(width/2, height/2, depth/2),
            new THREE.Vector3(-width/2, height/2, depth/2),
            new THREE.Vector3(-width/2, height/2, depth/2),
            new THREE.Vector3(-width/2, height/2, -depth/2)
        );
        
        const edgeGeometry = new THREE.BufferGeometry();
        const positions = [];
        edgePoints.forEach(point => {
            positions.push(point.x, point.y, point.z);
        });
        edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: edgeColor,
            linewidth: linewidth
        });
        
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        boxGroup.add(edges);
    }
    
    // Position the group
    boxGroup.position.set(position.x, position.y, position.z);
    
    // Store metadata
    boxGroup.userData = {
        type: 'openBox',
        dimensions: dimensions
    };
    
    return boxGroup;
}

/**
 * Adds dimension labels to a box or cuboid
 * @param {THREE.Group} boxGroup - The box group to add labels to
 * @param {Object} labels - Labels for dimensions {width: 'text', height: 'text', depth: 'text'}
 * @param {Object} options - Configuration options
 * @param {number} options.fontSize - Font size for labels (default: 20)
 * @param {string} options.fontColor - Color of labels (default: '#000000' black)
 * @param {number} options.offset - Distance from box edges (default: 0.5)
 * @returns {Array<THREE.Object3D>} Array of label objects
 */
export function addBoxLabels(boxGroup, labels, options = {}) {
    const {
        fontSize = 20,
        fontColor = '#000000',
        offset = 0.5
    } = options;
    
    const labelObjects = [];
    
    if (!boxGroup.userData || !boxGroup.userData.dimensions) {
        console.warn('Box group must have dimensions in userData');
        return labelObjects;
    }
    
    const { width, height, depth } = boxGroup.userData.dimensions;
    
    // Note: This would integrate with the label.js API
    // For now, we'll create placeholder objects
    
    if (labels.width) {
        // Width label - place below front face
        const widthLabel = new THREE.Group();
        widthLabel.position.set(0, -height/2 - offset, depth/2 + offset);
        widthLabel.userData = { text: labels.width, type: 'widthLabel' };
        boxGroup.add(widthLabel);
        labelObjects.push(widthLabel);
    }
    
    if (labels.height) {
        // Height label - place on right side
        const heightLabel = new THREE.Group();
        heightLabel.position.set(width/2 + offset, 0, depth/2 + offset);
        heightLabel.userData = { text: labels.height, type: 'heightLabel' };
        boxGroup.add(heightLabel);
        labelObjects.push(heightLabel);
    }
    
    if (labels.depth) {
        // Depth label - place on right side, bottom
        const depthLabel = new THREE.Group();
        depthLabel.position.set(width/2 + offset, -height/2 - offset, 0);
        depthLabel.userData = { text: labels.depth, type: 'depthLabel' };
        boxGroup.add(depthLabel);
        labelObjects.push(depthLabel);
    }
    
    return labelObjects;
}

/**
 * Creates a box with cut corners visualization
 * @param {Object} dimensions - Original box dimensions {width, height, depth}
 * @param {number} cutSize - Size of corner cuts
 * @param {Object} options - Configuration options
 * @returns {THREE.Group} Group containing the box with cut corners
 */
export function createBoxWithCuts(dimensions, cutSize, options = {}) {
    const {
        boxColor = 0x4488ff,
        cutColor = 0xffb3ba,
        showCuts = true
    } = options;
    
    const { width, height, depth } = dimensions;
    const group = new THREE.Group();
    
    // Calculate reduced dimensions
    const innerWidth = width - 2 * cutSize;
    const innerHeight = height;
    const innerDepth = depth - 2 * cutSize;
    
    // Create main box with reduced dimensions
    const mainBox = createOpenBox(
        { width: innerWidth, height: innerHeight, depth: innerDepth },
        { color: boxColor, ...options }
    );
    group.add(mainBox);
    
    // Add cut corner indicators if requested
    if (showCuts && cutSize > 0) {
        const cutMaterial = new THREE.MeshBasicMaterial({
            color: cutColor,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        // Create cut indicators at corners
        const cutGeometry = new THREE.PlaneGeometry(cutSize, cutSize);
        
        const cornerPositions = [
            { x: -innerWidth/2 - cutSize/2, z: innerDepth/2 + cutSize/2 },
            { x: innerWidth/2 + cutSize/2, z: innerDepth/2 + cutSize/2 },
            { x: -innerWidth/2 - cutSize/2, z: -innerDepth/2 - cutSize/2 },
            { x: innerWidth/2 + cutSize/2, z: -innerDepth/2 - cutSize/2 }
        ];
        
        cornerPositions.forEach(pos => {
            const cut = new THREE.Mesh(cutGeometry, cutMaterial);
            cut.rotation.x = -Math.PI / 2;
            cut.position.set(pos.x, -innerHeight/2, pos.z);
            group.add(cut);
        });
    }
    
    group.userData = {
        type: 'boxWithCuts',
        originalDimensions: dimensions,
        cutSize: cutSize,
        reducedDimensions: { width: innerWidth, height: innerHeight, depth: innerDepth }
    };
    
    return group;
}