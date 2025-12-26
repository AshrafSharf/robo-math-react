import * as THREE from 'three';
import { createFlatSheet, addCutCorners, createFlaps } from './box_sheet.js';
import { createFoldingToggle } from './box_folding.js';

/**
 * Creates a complete foldable rectangular box net with animation capabilities
 * This is a high-level API that combines sheet creation, cutting, and folding for rectangular sheets
 * 
 * @param {Object} config - Configuration for the foldable box
 * @param {number} config.sheetLength - Length of the rectangular sheet (default: 45)
 * @param {number} config.sheetWidth - Width of the rectangular sheet (default: 24)
 * @param {number} config.cutSize - Size of corner cuts, determines box height (default: 5)
 * @param {Object} config.position - Position of the net {x, y, z} (default: {x: 0, y: 0, z: 0})
 * @param {Object} config.colors - Color configuration
 * @param {number} config.colors.sheet - Main sheet color (default: 0x4488ff blue)
 * @param {number} config.colors.cuts - Cut corners color (default: 0xffb3ba pink)
 * @param {number} config.colors.flaps - Flaps color (default: same as sheet)
 * @param {Object} config.opacity - Opacity configuration
 * @param {number} config.opacity.sheet - Sheet opacity (default: 0.9)
 * @param {number} config.opacity.cuts - Cuts opacity (default: 0.8)
 * @param {number} config.opacity.flaps - Flaps opacity (default: 0.9)
 * @param {Object} config.animation - Animation configuration
 * @param {number} config.animation.duration - Fold animation duration in ms (default: 2000)
 * @param {string} config.animation.easing - Easing type (default: 'easeInOut')
 * @param {boolean} config.animation.stagger - Stagger flap animations (default: true)
 * @param {boolean} config.showFoldLines - Show fold lines (default: true) - currently not implemented
 * @param {boolean} config.showOutlines - Show outlines (default: true)
 * @returns {Object} Complete foldable box net with methods and properties
 */
export function createFoldableRectangularBoxNet(config = {}) {
    // Default configuration
    const defaultConfig = {
        sheetLength: 45,
        sheetWidth: 24,
        cutSize: 5,
        position: { x: 0, y: 0, z: 0 },
        colors: {
            sheet: 0x4488ff,
            cuts: 0xffb3ba,
            flaps: null // Will use sheet color if not specified
        },
        opacity: {
            sheet: 0.9,
            cuts: 0.8,
            flaps: 0.9
        },
        animation: {
            duration: 2000,
            easing: 'easeInOut',
            stagger: true
        },
        showFoldLines: true,
        showOutlines: true
    };
    
    // Merge configurations
    const cfg = {
        ...defaultConfig,
        ...config,
        colors: { ...defaultConfig.colors, ...config.colors },
        opacity: { ...defaultConfig.opacity, ...config.opacity },
        animation: { ...defaultConfig.animation, ...config.animation }
    };
    
    // Validate parameters - cutSize must be less than half of the smaller dimension
    const maxCutSize = Math.min(cfg.sheetLength / 2, cfg.sheetWidth / 2);
    if (cfg.cutSize <= 0 || cfg.cutSize >= maxCutSize) {
        console.warn(`Invalid cut size. Must be > 0 and < ${maxCutSize}`);
        cfg.cutSize = Math.min(Math.max(cfg.cutSize, 0.1), maxCutSize - 0.1);
    }
    
    // Create the flat rectangular sheet
    const sheetGroup = createFlatSheet(cfg.sheetLength, cfg.sheetWidth, {
        color: cfg.colors.sheet,
        opacity: cfg.opacity.sheet,
        showOutline: cfg.showOutlines,  // Pass showOutlines setting to sheet creation
        position: cfg.position,
        orientation: 'horizontal'
    });
    
    // Store additional metadata for rectangular sheet
    sheetGroup.userData.sheetLength = cfg.sheetLength;
    sheetGroup.userData.sheetWidth = cfg.sheetWidth;
    sheetGroup.userData.cutSize = cfg.cutSize;
    
    // Add cut corners
    const cuts = addCutCorners(sheetGroup, cfg.cutSize, {
        cutColor: cfg.colors.cuts,
        cutOpacity: cfg.opacity.cuts,
        showCutOutlines: cfg.showOutlines
    });
    
    // Add fold lines (visual indicators)
    let foldLines = null;
    if (cfg.showFoldLines) {
        foldLines = addFoldLines(sheetGroup, cfg.cutSize, cfg.sheetLength, cfg.sheetWidth);
    }
    
    // Create flaps for animation
    // Note: createFlaps needs to handle rectangular dimensions
    const flaps = createRectangularFlaps(sheetGroup, {
        flapColor: cfg.colors.flaps || cfg.colors.sheet,
        flapOpacity: cfg.opacity.flaps,
        showFlapOutlines: cfg.showOutlines,
        sheetLength: cfg.sheetLength,
        sheetWidth: cfg.sheetWidth,
        cutSize: cfg.cutSize
    });
    
    // Create folding controller
    const foldingController = createFoldingToggle(flaps, cfg.animation.duration, {
        easing: cfg.animation.easing,
        stagger: cfg.animation.stagger
    });
    
    // Calculate box dimensions when folded
    const boxDimensions = {
        length: cfg.sheetLength - 2 * cfg.cutSize,
        width: cfg.sheetWidth - 2 * cfg.cutSize,
        height: cfg.cutSize
    };
    
    // Return the complete foldable box net object
    return {
        // Three.js objects
        group: sheetGroup,
        flaps: flaps,
        cuts: cuts,
        foldLines: foldLines,
        
        // Configuration
        config: cfg,
        
        // Calculated properties
        dimensions: {
            sheetLength: cfg.sheetLength,
            sheetWidth: cfg.sheetWidth,
            cutSize: cfg.cutSize,
            boxWhenFolded: boxDimensions,
            volume: boxDimensions.length * boxDimensions.width * boxDimensions.height
        },
        
        // Animation methods
        fold: (callback) => {
            return foldingController.fold(callback);
        },
        
        unfold: (callback) => {
            return foldingController.unfold(callback);
        },
        
        toggle: (callback) => {
            return foldingController.toggle(callback);
        },
        
        isFolded: () => {
            return foldingController.getState();
        },
        
        stop: () => {
            foldingController.stop();
        },
        
        // Utility methods
        updateCutSize: (newCutSize) => {
            // This would require recreating the flaps
            console.warn('Updating cut size requires recreating the net. Use createFoldableRectangularBoxNet with new parameters instead.');
        },
        
        getVolume: () => {
            const dims = boxDimensions;
            return dims.length * dims.width * dims.height;
        },
        
        getMaxVolume: () => {
            // For a rectangular sheet, the optimal cut needs calculus
            // This is problem-specific and should be provided externally
            console.warn('Max volume calculation for rectangular sheets is problem-specific');
            return null;
        },
        
        isAtMaxVolume: (optimalCut) => {
            // Check if current cut is at the provided optimal value
            if (!optimalCut) return false;
            return Math.abs(cfg.cutSize - optimalCut) < 0.01;
        }
    };
}

/**
 * Creates flaps for a rectangular sheet
 * @param {THREE.Group} sheetGroup - The sheet group
 * @param {Object} options - Configuration options
 * @returns {Array} Array of flap objects
 */
function createRectangularFlaps(sheetGroup, options) {
    const {
        flapColor = 0x4488ff,
        flapOpacity = 0.9,
        showFlapOutlines = true,
        sheetLength,
        sheetWidth,
        cutSize
    } = options;
    
    if (!sheetGroup.userData || !sheetGroup.userData.type) {
        console.warn('createRectangularFlaps requires a sheet created by createFlatSheet');
        return [];
    }
    
    const innerLength = sheetLength - 2 * cutSize;
    const innerWidth = sheetWidth - 2 * cutSize;
    const flaps = [];
    
    // Define flap configurations for rectangular sheet
    const flapConfigs = [
        {
            name: 'top',
            position: { x: 0, y: 0.01, z: innerWidth/2 },
            size: { width: innerLength, height: cutSize },
            rotationAxis: 'x',
            rotationSign: -1,
            offset: { x: 0, y: 0, z: cutSize/2 }
        },
        {
            name: 'right',
            position: { x: innerLength/2, y: 0.01, z: 0 },
            size: { width: cutSize, height: innerWidth },
            rotationAxis: 'z',
            rotationSign: 1,
            offset: { x: cutSize/2, y: 0, z: 0 }
        },
        {
            name: 'bottom',
            position: { x: 0, y: 0.01, z: -innerWidth/2 },
            size: { width: innerLength, height: cutSize },
            rotationAxis: 'x',
            rotationSign: 1,
            offset: { x: 0, y: 0, z: -cutSize/2 }
        },
        {
            name: 'left',
            position: { x: -innerLength/2, y: 0.01, z: 0 },
            size: { width: cutSize, height: innerWidth },
            rotationAxis: 'z',
            rotationSign: -1,
            offset: { x: -cutSize/2, y: 0, z: 0 }
        }
    ];
    
    flapConfigs.forEach(config => {
        const flapGroup = new THREE.Group();
        
        // Create flap geometry
        const geometry = new THREE.PlaneGeometry(config.size.width, config.size.height);
        const material = new THREE.MeshPhongMaterial({
            color: flapColor,
            side: THREE.DoubleSide,
            transparent: flapOpacity < 1,
            opacity: flapOpacity
        });
        
        const flapMesh = new THREE.Mesh(geometry, material);
        
        // Horizontal orientation
        flapMesh.rotation.x = -Math.PI / 2;
        
        // Position flap relative to its rotation point
        flapMesh.position.set(config.offset.x, config.offset.y, config.offset.z);
        flapGroup.add(flapMesh);
        
        // Add outline if requested
        if (showFlapOutlines) {
            const edges = new THREE.EdgesGeometry(geometry);
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x000000,
                linewidth: 2
            });
            const outline = new THREE.LineSegments(edges, lineMaterial);
            outline.rotation.x = -Math.PI / 2;
            outline.position.copy(flapMesh.position);
            flapGroup.add(outline);
        }
        
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
 * Adds fold lines to the rectangular sheet
 * @param {THREE.Group} sheetGroup - The sheet group
 * @param {number} cutSize - Size of corner cuts
 * @param {number} sheetLength - Length of the sheet
 * @param {number} sheetWidth - Width of the sheet
 * @returns {THREE.Group} Group containing fold lines
 */
function addFoldLines(sheetGroup, cutSize, sheetLength, sheetWidth) {
    const foldLinesGroup = new THREE.Group();
    
    const lineMaterial = new THREE.LineDashedMaterial({
        color: 0x666666,
        dashSize: 0.5,
        gapSize: 0.3,
        linewidth: 1
    });
    
    const innerLength = sheetLength - 2 * cutSize;
    const innerWidth = sheetWidth - 2 * cutSize;
    
    // Horizontal fold lines
    const hLineGeometry1 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-innerLength/2, 0.02, innerWidth/2),
        new THREE.Vector3(innerLength/2, 0.02, innerWidth/2)
    ]);
    const hLine1 = new THREE.Line(hLineGeometry1, lineMaterial);
    hLine1.computeLineDistances();
    foldLinesGroup.add(hLine1);
    
    const hLineGeometry2 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-innerLength/2, 0.02, -innerWidth/2),
        new THREE.Vector3(innerLength/2, 0.02, -innerWidth/2)
    ]);
    const hLine2 = new THREE.Line(hLineGeometry2, lineMaterial);
    hLine2.computeLineDistances();
    foldLinesGroup.add(hLine2);
    
    // Vertical fold lines
    const vLineGeometry1 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-innerLength/2, 0.02, -innerWidth/2),
        new THREE.Vector3(-innerLength/2, 0.02, innerWidth/2)
    ]);
    const vLine1 = new THREE.Line(vLineGeometry1, lineMaterial);
    vLine1.computeLineDistances();
    foldLinesGroup.add(vLine1);
    
    const vLineGeometry2 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(innerLength/2, 0.02, -innerWidth/2),
        new THREE.Vector3(innerLength/2, 0.02, innerWidth/2)
    ]);
    const vLine2 = new THREE.Line(vLineGeometry2, lineMaterial);
    vLine2.computeLineDistances();
    foldLinesGroup.add(vLine2);
    
    sheetGroup.add(foldLinesGroup);
    sheetGroup.userData.foldLines = foldLinesGroup;
    
    return foldLinesGroup;
}

/**
 * Export the function for use in other modules
 */
export default createFoldableRectangularBoxNet;