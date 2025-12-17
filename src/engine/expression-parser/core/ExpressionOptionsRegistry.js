/**
 * ExpressionOptionsRegistry - Central registry for expression options
 *
 * Supports two levels of options:
 * 1. Type-based defaults - default options for each expression type (line, point, etc.)
 * 2. Instance-based options - options for specific command editor items (by ID)
 *
 * Usage:
 *   // Get type defaults
 *   const { styleOptions } = ExpressionOptionsRegistry.get('line');
 *   // Returns { styleOptions: { strokeWidth: 2, color: 'black' } }
 *
 *   // Set instance options (by command editor item ID)
 *   ExpressionOptionsRegistry.setById('item-123', { color: '#FF0000', strokeWidth: 3 });
 *
 *   // Get instance options (merged with type defaults)
 *   const options = ExpressionOptionsRegistry.getById('item-123', 'line');
 *   // Returns { styleOptions: { strokeWidth: 3, color: '#FF0000' } }
 */

const defaults = {
    // 3D shapes
    line3d: {
        styleOptions: {
            strokeWidth: 0.06,
            color: 0x000000
        }
    },
    point3d: {
        styleOptions: {
            radius: 0.12,
            color: 0xff0000
        }
    },
    vector3d: {
        styleOptions: {
            strokeWidth: 0.05,
            headLength: 0.3,
            headRadius: 0.12,
            color: 0x0000ff
        }
    },
    plane3d: {
        styleOptions: {
            opacity: 0.5,
            color: 0x00ffff
        }
    },
    sphere: {
        styleOptions: {
            color: 0x4444ff,
            opacity: 1.0
        }
    },
    cylinder: {
        styleOptions: {
            color: 0x44ff44,
            opacity: 1.0
        }
    },
    cube: {
        styleOptions: {
            color: 0xff4444,
            opacity: 1.0
        }
    },
    cone: {
        styleOptions: {
            color: 0x44ff44,
            opacity: 1.0
        }
    },
    torus: {
        styleOptions: {
            color: 0xffaa00,
            opacity: 1.0
        }
    },
    prism: {
        styleOptions: {
            color: 0x44ff88,
            opacity: 1.0
        }
    },
    frustum: {
        styleOptions: {
            color: 0xff8844,
            opacity: 1.0
        }
    },
    pyramid: {
        styleOptions: {
            color: 0xffaa44,
            opacity: 1.0
        }
    },

    // 2D shapes
    line: {
        styleOptions: {
            strokeWidth: 2,
            color: 'black'
        }
    },
    point: {
        styleOptions: {
            radius: 5,
            color: 'red'
        }
    },
    vector: {
        styleOptions: {
            strokeWidth: 2,
            color: 'blue'
        }
    },
    circle: {
        styleOptions: {
            strokeWidth: 2,
            color: 'black'
        }
    },
    polygon: {
        styleOptions: {
            strokeWidth: 2,
            color: 'black',
            fillOpacity: 0.1
        }
    },
    arc: {
        styleOptions: {
            strokeWidth: 2,
            color: 'black'
        }
    },
    angle: {
        styleOptions: {
            strokeWidth: 1.5,
            color: 'orange',
            radius: 0.5
        }
    },

    // Labels
    label: {
        styleOptions: {
            fontSize: 24,
            color: 'black'
        }
    },
    label3d: {
        styleOptions: {
            fontSize: 32,
            scale: 0.04,
            color: 0x000000
        }
    }
};

// Type-level overrides (can be set at runtime)
const typeOverrides = {};

// Instance-level options keyed by command editor item ID
// Structure: { itemId: { color: '#FF0000', strokeWidth: 3, expressionOptions: { line: {...} } } }
const instanceOptions = {};

export const ExpressionOptionsRegistry = {
    // ============================================
    // Type-based options (defaults for expression types)
    // ============================================

    /**
     * Get options for an expression type
     * @param {string} expressionName - e.g., 'line3d', 'point', 'vector'
     * @returns {Object} Options object with defaults
     */
    get(expressionName) {
        const key = expressionName.toLowerCase();
        const defaultOpts = defaults[key] || {};
        const overrideOpts = typeOverrides[key] || {};
        return { ...defaultOpts, ...overrideOpts };
    },

    /**
     * Set override options for an expression type
     * @param {string} expressionName
     * @param {Object} options
     */
    set(expressionName, options) {
        const key = expressionName.toLowerCase();
        typeOverrides[key] = { ...(typeOverrides[key] || {}), ...options };
    },

    /**
     * Reset overrides for an expression type (back to defaults)
     * @param {string} expressionName
     */
    reset(expressionName) {
        const key = expressionName.toLowerCase();
        delete typeOverrides[key];
    },

    /**
     * Reset all type overrides
     */
    resetAll() {
        Object.keys(typeOverrides).forEach(key => delete typeOverrides[key]);
    },

    /**
     * Get the default options (without overrides)
     * @param {string} expressionName
     * @returns {Object}
     */
    getDefaults(expressionName) {
        const key = expressionName.toLowerCase();
        return { ...(defaults[key] || {}) };
    },

    // ============================================
    // Instance-based options (per command editor item ID)
    // ============================================

    /**
     * Get options for a specific command editor item
     * Merges: type defaults < type overrides < instance options
     * @param {string} itemId - Command editor item ID
     * @param {string} expressionType - Expression type (optional, for merging with type defaults)
     * @returns {Object} Merged options
     */
    getById(itemId, expressionType = null) {
        const instance = instanceOptions[itemId] || {};
        console.log('📦 getById - itemId:', itemId, 'type:', expressionType, 'instance:', JSON.stringify(instance));

        if (!expressionType) {
            return { ...instance };
        }

        // Get type-level options
        const typeKey = expressionType.toLowerCase();
        const typeDefaults = defaults[typeKey]?.styleOptions || {};
        const typeOverride = typeOverrides[typeKey]?.styleOptions || {};

        // Get expression-specific options from instance
        const expressionOpts = instance.expressionOptions?.[typeKey] || {};
        console.log('📦 getById - expressionOpts:', JSON.stringify(expressionOpts));

        // Merge: type defaults < type overrides < instance base < instance expression-specific
        return {
            ...typeDefaults,
            ...typeOverride,
            color: instance.color,
            ...expressionOpts
        };
    },

    /**
     * Set options for a specific command editor item
     * @param {string} itemId - Command editor item ID
     * @param {Object} options - Options to set (color, expressionOptions, etc.)
     */
    setById(itemId, options) {
        instanceOptions[itemId] = { ...(instanceOptions[itemId] || {}), ...options };
    },

    /**
     * Update expression-specific options for an item
     * @param {string} itemId - Command editor item ID
     * @param {string} expressionType - Expression type (e.g., 'line', 'circle')
     * @param {Object} options - Expression-specific options
     */
    setExpressionOptions(itemId, expressionType, options) {
        console.log('📦 setExpressionOptions - itemId:', itemId, 'type:', expressionType, 'options:', options);
        if (!instanceOptions[itemId]) {
            instanceOptions[itemId] = {};
        }
        if (!instanceOptions[itemId].expressionOptions) {
            instanceOptions[itemId].expressionOptions = {};
        }
        const typeKey = expressionType.toLowerCase();
        instanceOptions[itemId].expressionOptions[typeKey] = {
            ...(instanceOptions[itemId].expressionOptions[typeKey] || {}),
            ...options
        };
        console.log('📦 After set - instanceOptions[itemId]:', JSON.stringify(instanceOptions[itemId]));
    },

    /**
     * Get all options for an item (raw, without merging)
     * @param {string} itemId - Command editor item ID
     * @returns {Object} Raw instance options
     */
    getRawById(itemId) {
        return instanceOptions[itemId] || {};
    },

    /**
     * Remove options for a specific command editor item
     * @param {string} itemId - Command editor item ID
     */
    removeById(itemId) {
        delete instanceOptions[itemId];
    },

    /**
     * Clear all instance options
     */
    clearAllInstances() {
        Object.keys(instanceOptions).forEach(key => delete instanceOptions[key]);
    },

    /**
     * Check if an item has instance options
     * @param {string} itemId - Command editor item ID
     * @returns {boolean}
     */
    hasById(itemId) {
        return itemId in instanceOptions;
    },

    /**
     * Get all instance IDs that have options
     * @returns {string[]}
     */
    getAllInstanceIds() {
        return Object.keys(instanceOptions);
    }
};
