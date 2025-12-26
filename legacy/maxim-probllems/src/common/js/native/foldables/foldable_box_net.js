import * as THREE from 'three';
import { createFlatSheet, addCutCorners, createFlaps } from './box_sheet.js';
import { createFoldingToggle } from './box_folding.js';

/**
 * Creates a complete foldable box net with animation capabilities
 * This is a high-level API that combines sheet creation, cutting, and folding
 * 
 * @param {Object} config - Configuration for the foldable box
 * @param {number} config.sheetSize - Size of the square sheet (default: 12)
 * @param {number} config.cutSize - Size of corner cuts, determines box height (default: 2)
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
export function createFoldableBoxNet(config = {}) {
    // Default configuration
    const defaultConfig = {
        sheetSize: 12,
        cutSize: 2,
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
    
    // Validate parameters
    if (cfg.cutSize <= 0 || cfg.cutSize >= cfg.sheetSize / 2) {
        console.warn('Invalid cut size. Must be > 0 and < sheetSize/2');
        cfg.cutSize = Math.min(Math.max(cfg.cutSize, 0.1), cfg.sheetSize / 2 - 0.1);
    }
    
    // Create the flat sheet
    const sheetGroup = createFlatSheet(cfg.sheetSize, cfg.sheetSize, {
        color: cfg.colors.sheet,
        opacity: cfg.opacity.sheet,
        showOutline: cfg.showOutlines,  // Pass showOutlines setting to sheet creation
        position: cfg.position,
        orientation: 'horizontal'
    });
    
    // Add cut corners
    const cuts = addCutCorners(sheetGroup, cfg.cutSize, {
        cutColor: cfg.colors.cuts,
        cutOpacity: cfg.opacity.cuts,
        showCutOutlines: cfg.showOutlines
    });
    
    // Fold lines feature not currently implemented
    let foldLines = null;
    
    // Create flaps for animation
    const flaps = createFlaps(sheetGroup, {
        flapColor: cfg.colors.flaps || cfg.colors.sheet,
        flapOpacity: cfg.opacity.flaps,
        showFlapOutlines: cfg.showOutlines
    });
    
    // Create folding controller
    const foldingController = createFoldingToggle(flaps, cfg.animation.duration, {
        easing: cfg.animation.easing,
        stagger: cfg.animation.stagger
    });
    
    // Calculate box dimensions when folded
    const boxDimensions = {
        width: cfg.sheetSize - 2 * cfg.cutSize,
        height: cfg.cutSize,
        depth: cfg.sheetSize - 2 * cfg.cutSize
    };
    
    // Return the complete foldable box net object
    return {
        // Three.js objects
        group: sheetGroup,
        flaps: flaps,
        cuts: cuts,
        foldLines: null, // Not implemented
        
        // Configuration
        config: cfg,
        
        // Calculated properties
        dimensions: {
            sheetSize: cfg.sheetSize,
            cutSize: cfg.cutSize,
            boxWhenFolded: boxDimensions,
            volume: boxDimensions.width * boxDimensions.height * boxDimensions.depth
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
            console.warn('Updating cut size requires recreating the net. Use createFoldableBoxNet with new parameters instead.');
        },
        
        getVolume: () => {
            const dims = boxDimensions;
            return dims.width * dims.height * dims.depth;
        },
        
        getMaxVolume: () => {
            // For a square sheet, max volume occurs when cut = sheetSize/6
            const optimalCut = cfg.sheetSize / 6;
            const optimalWidth = cfg.sheetSize - 2 * optimalCut;
            return optimalWidth * optimalWidth * optimalCut;
        },
        
        isAtMaxVolume: () => {
            const optimalCut = cfg.sheetSize / 6;
            return Math.abs(cfg.cutSize - optimalCut) < 0.01;
        }
    };
}

/**
 * Creates multiple foldable box nets with different cut sizes for comparison
 * Useful for optimization problems and educational demonstrations
 * 
 * @param {Array<number>} cutSizes - Array of cut sizes to create
 * @param {Object} commonConfig - Common configuration for all nets
 * @param {number} commonConfig.sheetSize - Size of square sheets (default: 12)
 * @param {number} commonConfig.spacing - Spacing between nets (default: sheetSize + 2)
 * @param {string} commonConfig.arrangement - 'row', 'column', or 'grid' (default: 'row')
 * @returns {Array<Object>} Array of foldable box net objects
 */
export function createMultipleFoldableNets(cutSizes, commonConfig = {}) {
    const {
        sheetSize = 12,
        spacing = 14,
        arrangement = 'row',
        ...otherConfig
    } = commonConfig;
    
    const nets = [];
    
    cutSizes.forEach((cutSize, index) => {
        let position;
        
        if (arrangement === 'row') {
            position = { x: index * spacing, y: 0, z: 0 };
        } else if (arrangement === 'column') {
            position = { x: 0, y: 0, z: index * spacing };
        } else if (arrangement === 'grid') {
            const cols = Math.ceil(Math.sqrt(cutSizes.length));
            const row = Math.floor(index / cols);
            const col = index % cols;
            position = { x: col * spacing, y: 0, z: row * spacing };
        }
        
        const net = createFoldableBoxNet({
            sheetSize,
            cutSize,
            position,
            ...otherConfig
        });
        
        nets.push(net);
    });
    
    return nets;
}

/**
 * Creates an animated sequence showing box folding optimization
 * This demonstrates how volume changes with different cut sizes
 * 
 * @param {THREE.Scene} scene - The Three.js scene to add objects to
 * @param {Object} options - Configuration options
 * @param {number} options.sheetSize - Size of the square sheet (default: 12)
 * @param {number} options.minCut - Minimum cut size (default: 0.5)
 * @param {number} options.maxCut - Maximum cut size (default: sheetSize/2 - 0.5)
 * @param {number} options.steps - Number of steps in the sequence (default: 5)
 * @param {Function} options.onVolumeChange - Callback with (cutSize, volume, isMax)
 * @returns {Object} Controller for the optimization sequence
 */
export function createOptimizationSequence(scene, options = {}) {
    const {
        sheetSize = 12,
        minCut = 0.5,
        maxCut = 5.5,
        steps = 5,
        onVolumeChange = null
    } = options;
    
    let currentNet = null;
    let currentIndex = 0;
    
    // Calculate cut sizes including the optimal one
    const optimalCut = sheetSize / 6;
    const cutSizes = [];
    
    // Create a range that includes the optimal cut
    for (let i = 0; i < steps; i++) {
        const cut = minCut + (maxCut - minCut) * i / (steps - 1);
        cutSizes.push(cut);
    }
    
    // Ensure optimal cut is included if within range
    if (optimalCut >= minCut && optimalCut <= maxCut) {
        // Find closest cut size and replace it with optimal
        let closestIndex = 0;
        let closestDiff = Math.abs(cutSizes[0] - optimalCut);
        
        for (let i = 1; i < cutSizes.length; i++) {
            const diff = Math.abs(cutSizes[i] - optimalCut);
            if (diff < closestDiff) {
                closestDiff = diff;
                closestIndex = i;
            }
        }
        
        cutSizes[closestIndex] = optimalCut;
    }
    
    // Sort cut sizes
    cutSizes.sort((a, b) => a - b);
    
    function createNet(cutSize) {
        // Remove previous net if exists
        if (currentNet) {
            scene.remove(currentNet.group);
            currentNet.stop();
        }
        
        // Create new net
        currentNet = createFoldableBoxNet({
            sheetSize,
            cutSize,
            position: { x: 0, y: 0, z: 0 }
        });
        
        scene.add(currentNet.group);
        
        // Calculate volume and check if optimal
        const volume = currentNet.getVolume();
        const isOptimal = currentNet.isAtMaxVolume();
        
        if (onVolumeChange) {
            onVolumeChange(cutSize, volume, isOptimal);
        }
        
        return currentNet;
    }
    
    // Create initial net
    createNet(cutSizes[0]);
    
    return {
        next: () => {
            currentIndex = (currentIndex + 1) % cutSizes.length;
            return createNet(cutSizes[currentIndex]);
        },
        
        previous: () => {
            currentIndex = (currentIndex - 1 + cutSizes.length) % cutSizes.length;
            return createNet(cutSizes[currentIndex]);
        },
        
        goToOptimal: () => {
            const optimalIndex = cutSizes.findIndex(cut => Math.abs(cut - optimalCut) < 0.01);
            if (optimalIndex !== -1) {
                currentIndex = optimalIndex;
                return createNet(cutSizes[currentIndex]);
            }
            return currentNet;
        },
        
        getCurrentNet: () => currentNet,
        
        getCutSizes: () => cutSizes,
        
        getCurrentIndex: () => currentIndex,
        
        cleanup: () => {
            if (currentNet) {
                scene.remove(currentNet.group);
                currentNet.stop();
                currentNet = null;
            }
        }
    };
}