/**
 * lhs_foldable.js - Main foldable geometry builder
 *
 * Dispatches to type-specific handlers based on the "type" parameter.
 * Currently supports: "box", "rectbox", "cube"
 */
import { createBoxNet, getFaceNames as getBoxFaceNames, computeVolume as boxVolume } from './foldable_types/box.js';

// Type handler registry
const TYPE_HANDLERS = {
    'box': {
        create: createBoxNet,
        getFaceNames: getBoxFaceNames,
        computeVolume: boxVolume,
        parseParams: (params) => {
            // foldable(G, sheetSize, cutSize, "box")
            if (params.length < 2) {
                throw new Error('box type requires sheetSize and cutSize');
            }
            return {
                sheetSize: params[0],
                cutSize: params[1]
            };
        }
    }
    // Future: 'rectbox', 'cube' handlers
};

/**
 * Create a foldable shape
 * @param {string} type - Type of foldable ("box", "rectbox", "cube")
 * @param {Array} params - Type-specific parameters
 * @param {Object} options - Styling options
 * @returns {Object} Foldable object with group, faces, etc.
 */
export function createFoldable(type, params, options = {}) {
    const handler = TYPE_HANDLERS[type];

    if (!handler) {
        const supported = Object.keys(TYPE_HANDLERS).join(', ');
        throw new Error(`Unknown foldable type: "${type}". Supported: ${supported}`);
    }

    // Parse type-specific params
    const parsedParams = handler.parseParams(params);

    // Create the foldable
    let result;
    if (type === 'box') {
        result = handler.create(parsedParams.sheetSize, parsedParams.cutSize, options);
    }

    // Add type info and helper methods
    result.type = type;
    result._isFoldable = true;

    // Add face access methods
    result.getFace = (nameOrIndex) => {
        if (typeof nameOrIndex === 'number') {
            return result.faces[nameOrIndex] || null;
        }
        return result.faces.find(f => f.name === nameOrIndex) || null;
    };

    result.getFaces = () => result.faces;

    result.getFaceNames = () => handler.getFaceNames();

    result.getVolume = () => result.volume;

    result.isFullyFolded = () => result.faces.every(f => f.isFolded());

    result.isFlat = () => result.faces.every(f => f.isFlat());

    return result;
}

/**
 * Check if an object is a foldable
 */
export function isFoldable(obj) {
    return obj && obj._isFoldable === true;
}

/**
 * Get supported foldable types
 */
export function getSupportedTypes() {
    return Object.keys(TYPE_HANDLERS);
}
