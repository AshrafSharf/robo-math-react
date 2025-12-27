/**
 * Box type handler for foldable()
 *
 * Creates a square box net with:
 * - Base rectangle at center
 * - 4 foldable flaps (top, bottom, left, right)
 * - 4 cut corners
 *
 * Syntax: foldable(G, sheetSize, cutSize, "box")
 *
 * Sheet layout (example 12x12, cut 2):
 * ┌──┬────────┬──┐
 * │  │  TOP   │  │  <- cutSize x innerSize
 * ├──┼────────┼──┤
 * │ L│        │ R│  <- innerSize x innerSize (base)
 * │ E│  BASE  │ I│
 * │ F│        │ G│
 * │ T│        │ H│
 * │  │        │ T│
 * ├──┼────────┼──┤
 * │  │ BOTTOM │  │
 * └──┴────────┴──┘
 */
import * as THREE from 'three';
import { polygon as lhsPolygon } from '../lhs_polygon.js';
import { Face3D } from './Face3D.js';

/**
 * Create box net geometry
 * @param {number} sheetSize - Square sheet dimension
 * @param {number} cutSize - Corner cut size (becomes box height)
 * @param {Object} options - Styling options
 * @returns {Object} { group, base, faces, cuts, volume }
 */
export function createBoxNet(sheetSize, cutSize, options = {}) {
    const {
        color = 0x4488ff,
        opacity = 0.8,
        cutColor = 0xffb3ba,
        cutOpacity = 0.5,
        showEdges = true,
        edgeColor = 0x000000
    } = options;

    // Calculate dimensions
    const innerSize = sheetSize - 2 * cutSize;  // Base dimension
    const halfInner = innerSize / 2;
    const halfSheet = sheetSize / 2;

    // Create main group
    const group = new THREE.Group();

    // Create base rectangle (center, fixed)
    const baseVertices = [
        { x: -halfInner, y: -halfInner, z: 0 },
        { x: halfInner, y: -halfInner, z: 0 },
        { x: halfInner, y: halfInner, z: 0 },
        { x: -halfInner, y: halfInner, z: 0 }
    ];
    const baseMesh = lhsPolygon(baseVertices, {
        color, opacity, showEdges, edgeColor
    });
    group.add(baseMesh);

    // Create faces - each at its actual position, no group nesting
    const faces = [];

    // Top face
    const topVertices = [
        { x: -halfInner, y: halfInner, z: 0 },
        { x: halfInner, y: halfInner, z: 0 },
        { x: halfInner, y: halfInner + cutSize, z: 0 },
        { x: -halfInner, y: halfInner + cutSize, z: 0 }
    ];
    const topMesh = lhsPolygon(topVertices, { color, opacity, showEdges, edgeColor });
    group.add(topMesh);

    const topFace = new Face3D(
        topMesh,
        {
            start: { x: -halfInner, y: halfInner, z: 0 },
            end: { x: halfInner, y: halfInner, z: 0 }
        },
        'top',
        null
    );
    topFace.setVertices(topVertices);
    faces.push(topFace);

    // Bottom face
    const bottomVertices = [
        { x: -halfInner, y: -halfInner - cutSize, z: 0 },
        { x: halfInner, y: -halfInner - cutSize, z: 0 },
        { x: halfInner, y: -halfInner, z: 0 },
        { x: -halfInner, y: -halfInner, z: 0 }
    ];
    const bottomMesh = lhsPolygon(bottomVertices, { color, opacity, showEdges, edgeColor });
    group.add(bottomMesh);

    const bottomFace = new Face3D(
        bottomMesh,
        {
            start: { x: -halfInner, y: -halfInner, z: 0 },
            end: { x: halfInner, y: -halfInner, z: 0 }
        },
        'bottom',
        null
    );
    bottomFace.setVertices(bottomVertices);
    faces.push(bottomFace);

    // Left face
    const leftVertices = [
        { x: -halfInner - cutSize, y: -halfInner, z: 0 },
        { x: -halfInner, y: -halfInner, z: 0 },
        { x: -halfInner, y: halfInner, z: 0 },
        { x: -halfInner - cutSize, y: halfInner, z: 0 }
    ];
    const leftMesh = lhsPolygon(leftVertices, { color, opacity, showEdges, edgeColor });
    group.add(leftMesh);

    const leftFace = new Face3D(
        leftMesh,
        {
            start: { x: -halfInner, y: -halfInner, z: 0 },
            end: { x: -halfInner, y: halfInner, z: 0 }
        },
        'left',
        null
    );
    leftFace.setVertices(leftVertices);
    faces.push(leftFace);

    // Right face
    const rightVertices = [
        { x: halfInner, y: -halfInner, z: 0 },
        { x: halfInner + cutSize, y: -halfInner, z: 0 },
        { x: halfInner + cutSize, y: halfInner, z: 0 },
        { x: halfInner, y: halfInner, z: 0 }
    ];
    const rightMesh = lhsPolygon(rightVertices, { color, opacity, showEdges, edgeColor });
    group.add(rightMesh);

    const rightFace = new Face3D(
        rightMesh,
        {
            start: { x: halfInner, y: -halfInner, z: 0 },
            end: { x: halfInner, y: halfInner, z: 0 }
        },
        'right',
        null
    );
    rightFace.setVertices(rightVertices);
    faces.push(rightFace);

    // Create cut corners (visual only, not foldable)
    const cuts = [];
    const cutPositions = [
        { x: -halfSheet + cutSize / 2, y: halfSheet - cutSize / 2 },   // top-left
        { x: halfSheet - cutSize / 2, y: halfSheet - cutSize / 2 },    // top-right
        { x: -halfSheet + cutSize / 2, y: -halfSheet + cutSize / 2 },  // bottom-left
        { x: halfSheet - cutSize / 2, y: -halfSheet + cutSize / 2 }    // bottom-right
    ];

    for (const pos of cutPositions) {
        const cutVertices = [
            { x: pos.x - cutSize / 2, y: pos.y - cutSize / 2, z: 0.01 },
            { x: pos.x + cutSize / 2, y: pos.y - cutSize / 2, z: 0.01 },
            { x: pos.x + cutSize / 2, y: pos.y + cutSize / 2, z: 0.01 },
            { x: pos.x - cutSize / 2, y: pos.y + cutSize / 2, z: 0.01 }
        ];
        const cutMesh = lhsPolygon(cutVertices, {
            color: cutColor,
            opacity: cutOpacity,
            showEdges: false
        });
        group.add(cutMesh);
        cuts.push(cutMesh);
    }

    // Calculate volume when fully folded
    // V = cutSize * innerSize * innerSize
    const volume = cutSize * innerSize * innerSize;

    // Set parent reference on all faces
    const result = {
        group,
        base: baseMesh,
        faces,
        cuts,
        volume,
        sheetSize,
        cutSize,
        innerSize,
        type: 'box'
    };

    for (const face of faces) {
        face.parent = result;
    }

    return result;
}

/**
 * Get face names for box type
 */
export function getFaceNames() {
    return ['top', 'bottom', 'left', 'right'];
}

/**
 * Compute volume for box with given parameters
 */
export function computeVolume(sheetSize, cutSize) {
    const innerSize = sheetSize - 2 * cutSize;
    return cutSize * innerSize * innerSize;
}

/**
 * Get optimal cut size for maximum volume
 */
export function getOptimalCutSize(sheetSize) {
    return sheetSize / 6;
}

/**
 * Get maximum possible volume for sheet size
 */
export function getMaxVolume(sheetSize) {
    const optCut = sheetSize / 6;
    return computeVolume(sheetSize, optCut);
}
