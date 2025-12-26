import * as THREE from 'three';

/**
 * Creates a flat rectangular sheet in 3D space
 * @param {number} width - Width of the sheet
 * @param {number} height - Height of the sheet
 * @param {Object} options - Configuration options
 * @param {number} options.color - Color of the sheet (default: 0x4488ff blue)
 * @param {number} options.opacity - Opacity of the sheet (default: 0.9)
 * @param {boolean} options.showOutline - Show outline edges (default: true)
 * @param {number} options.outlineColor - Color of outline (default: 0x000000 black)
 * @param {number} options.outlineWidth - Width of outline (default: 2)
 * @param {Object} options.position - Position of sheet center {x, y, z} (default: {x: 0, y: 0, z: 0})
 * @param {string} options.orientation - Orientation: 'horizontal' or 'vertical' (default: 'horizontal')
 * @returns {THREE.Group} Group containing the sheet mesh and optional outline
 */
export function createFlatSheet(width, height, options = {}) {
    const {
        color = 0x4488ff,
        opacity = 0.9,
        showOutline = true,
        outlineColor = 0x000000,
        outlineWidth = 2,
        position = { x: 0, y: 0, z: 0 },
        orientation = 'horizontal'
    } = options;
    
    const sheetGroup = new THREE.Group();
    
    // Create sheet geometry
    const geometry = new THREE.PlaneGeometry(width, height, 1, 1);  // Explicitly set segments to 1x1
    const material = new THREE.MeshPhongMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: opacity < 1,
        opacity: opacity
    });
    
    const sheet = new THREE.Mesh(geometry, material);
    
    // Apply orientation
    if (orientation === 'horizontal') {
        sheet.rotation.x = -Math.PI / 2;
    }
    
    sheetGroup.add(sheet);
    
    // Outlines removed - no lines will be shown
    
    // Position the group
    sheetGroup.position.set(position.x, position.y, position.z);
    
    // Store metadata for later use
    sheetGroup.userData = {
        type: 'flatSheet',
        width: width,
        height: height,
        orientation: orientation
    };
    
    return sheetGroup;
}

/**
 * Adds cut corners to a flat sheet for box folding
 * @param {THREE.Group} sheetGroup - The sheet group created by createFlatSheet
 * @param {number} cutSize - Size of the square cuts at corners
 * @param {Object} options - Configuration options
 * @param {number} options.cutColor - Color of cut areas (default: 0xffb3ba light pink)
 * @param {number} options.cutOpacity - Opacity of cuts (default: 0.8)
 * @param {boolean} options.showCutOutlines - Show outlines around cuts (default: true)
 * @returns {Array<THREE.Mesh>} Array of cut square meshes
 */
export function addCutCorners(sheetGroup, cutSize, options = {}) {
    const {
        cutColor = 0xffb3ba,
        cutOpacity = 0.8,
        showCutOutlines = true
    } = options;
    
    if (!sheetGroup.userData || sheetGroup.userData.type !== 'flatSheet') {
        console.warn('addCutCorners requires a sheet created by createFlatSheet');
        return [];
    }
    
    const { width, height, orientation } = sheetGroup.userData;
    const cuts = [];
    
    // Calculate corner positions
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const halfCut = cutSize / 2;
    
    const cornerPositions = [
        { x: -halfWidth + halfCut, z: halfHeight - halfCut },   // Top-left
        { x: halfWidth - halfCut, z: halfHeight - halfCut },    // Top-right
        { x: -halfWidth + halfCut, z: -halfHeight + halfCut },  // Bottom-left
        { x: halfWidth - halfCut, z: -halfHeight + halfCut }    // Bottom-right
    ];
    
    cornerPositions.forEach(pos => {
        // Create cut square
        const cutGeometry = new THREE.PlaneGeometry(cutSize, cutSize);
        const cutMaterial = new THREE.MeshBasicMaterial({
            color: cutColor,
            side: THREE.DoubleSide,
            transparent: cutOpacity < 1,
            opacity: cutOpacity
        });
        
        const cutMesh = new THREE.Mesh(cutGeometry, cutMaterial);
        
        if (orientation === 'horizontal') {
            cutMesh.rotation.x = -Math.PI / 2;
            cutMesh.position.set(pos.x, 0.01, pos.z); // Raised to avoid z-fighting
        } else {
            cutMesh.position.set(pos.x, pos.z, 0.01);
        }
        
        sheetGroup.add(cutMesh);
        cuts.push(cutMesh);
    });
    
    // Store cut information
    sheetGroup.userData.cuts = cuts;
    sheetGroup.userData.cutSize = cutSize;
    
    return cuts;
}

// Note: createFoldLines functionality has been removed as it was not implemented

/**
 * Creates flaps on a sheet that can be animated to fold
 * @param {THREE.Group} sheetGroup - The sheet group
 * @param {Object} options - Configuration options
 * @param {number} options.flapColor - Color of flaps (default: same as sheet)
 * @param {number} options.flapOpacity - Opacity of flaps (default: 0.9)
 * @param {boolean} options.showFlapOutlines - Show flap outlines (default: true)
 * @returns {Array<Object>} Array of flap objects with animation data
 */
export function createFlaps(sheetGroup, options = {}) {
    const {
        flapColor = null,
        flapOpacity = 0.9,
        showFlapOutlines = true
    } = options;
    
    if (!sheetGroup.userData || sheetGroup.userData.type !== 'flatSheet') {
        console.warn('createFlaps requires a sheet created by createFlatSheet');
        return [];
    }
    
    const { width, height, cutSize = 0, orientation } = sheetGroup.userData;
    
    if (cutSize <= 0) {
        console.warn('No cuts defined, cannot create flaps');
        return [];
    }
    
    const innerSize = width - 2 * cutSize;
    const flapWidth = innerSize;
    const flapHeight = cutSize;
    
    // Use sheet color if not specified
    const color = flapColor || 0x4488ff;
    
    const flaps = [];
    
    // Define flap configurations
    const flapConfigs = [
        {
            name: 'top',
            position: { x: 0, y: 0.01, z: innerSize/2 },
            size: { width: flapWidth, height: flapHeight },
            rotationAxis: 'x',
            rotationSign: -1,
            offset: { x: 0, y: 0, z: flapHeight/2 }
        },
        {
            name: 'right',
            position: { x: innerSize/2, y: 0.01, z: 0 },
            size: { width: flapHeight, height: flapWidth },
            rotationAxis: 'z',
            rotationSign: 1,
            offset: { x: flapHeight/2, y: 0, z: 0 }
        },
        {
            name: 'bottom',
            position: { x: 0, y: 0.01, z: -innerSize/2 },
            size: { width: flapWidth, height: flapHeight },
            rotationAxis: 'x',
            rotationSign: 1,
            offset: { x: 0, y: 0, z: -flapHeight/2 }
        },
        {
            name: 'left',
            position: { x: -innerSize/2, y: 0.01, z: 0 },
            size: { width: flapHeight, height: flapWidth },
            rotationAxis: 'z',
            rotationSign: -1,
            offset: { x: -flapHeight/2, y: 0, z: 0 }
        }
    ];
    
    flapConfigs.forEach(config => {
        const flapGroup = new THREE.Group();
        
        // Create flap geometry
        const geometry = new THREE.PlaneGeometry(config.size.width, config.size.height);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            side: THREE.DoubleSide,
            transparent: flapOpacity < 1,
            opacity: flapOpacity
        });
        
        const flapMesh = new THREE.Mesh(geometry, material);
        
        if (orientation === 'horizontal') {
            flapMesh.rotation.x = -Math.PI / 2;
        }
        
        // Position flap relative to its rotation point
        flapMesh.position.set(config.offset.x, config.offset.y, config.offset.z);
        flapGroup.add(flapMesh);
        
        // Position group at the edge
        flapGroup.position.set(config.position.x, config.position.y, config.position.z);
        sheetGroup.add(flapGroup);
        
        // Store animation data
        flaps.push({
            group: flapGroup,
            mesh: flapMesh,
            name: config.name,
            rotationAxis: config.rotationAxis,
            rotationSign: config.rotationSign,
            targetAngle: Math.PI / 2 // 90 degrees fold
        });
    });
    
    sheetGroup.userData.flaps = flaps;
    return flaps;
}

/**
 * Removes all cuts, fold lines, and flaps from a sheet
 * @param {THREE.Group} sheetGroup - The sheet group to clean
 */
export function cleanSheet(sheetGroup) {
    if (!sheetGroup.userData) return;
    
    // Remove cuts
    if (sheetGroup.userData.cuts) {
        sheetGroup.userData.cuts.forEach(cut => {
            if (cut.userData.outline) {
                sheetGroup.remove(cut.userData.outline);
            }
            sheetGroup.remove(cut);
        });
        delete sheetGroup.userData.cuts;
    }
    
    // Remove fold lines
    if (sheetGroup.userData.foldLines) {
        sheetGroup.remove(sheetGroup.userData.foldLines);
        delete sheetGroup.userData.foldLines;
    }
    
    // Remove flaps
    if (sheetGroup.userData.flaps) {
        sheetGroup.userData.flaps.forEach(flap => {
            sheetGroup.remove(flap.group);
        });
        delete sheetGroup.userData.flaps;
    }
}