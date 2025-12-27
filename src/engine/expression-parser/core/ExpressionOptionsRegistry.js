/**
 * ExpressionOptionsRegistry - Registry for expression-specific options
 *
 * Note: Style options (color, strokeWidth, fontSize) are set via expression syntax:
 *   c(green), s(2), f(24)
 *
 * This registry only handles non-style options like:
 * - 3D shape geometry (radius, headLength, size, opacity for 3D)
 * - Grid options (showGrid, xRange, yRange)
 * - Table options (rows, cols, cells)
 * - Ref content
 */

const defaults = {
    // 3D shapes - geometry options only
    point3d: {
        radius: 0.12
    },
    vector3d: {
        headLength: 0.3,
        headRadius: 0.12
    },
    plane3d: {
        opacity: 0.5,
        size: 12,
        sweepDirection: 'r'  // 'h', 'v', 'd', 'r'
    },
    polygon3d: {
        opacity: 0.7,
        showEdges: false
    },
    sphere: {
        opacity: 1.0
    },
    cylinder: {
        opacity: 1.0
    },
    cube: {
        opacity: 1.0
    },
    cone: {
        opacity: 1.0
    },
    torus: {
        opacity: 1.0
    },
    prism: {
        opacity: 1.0
    },
    frustum: {
        opacity: 1.0
    },
    pyramid: {
        opacity: 1.0
    },
    label3d: {
        scale: 0.04
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

        if (!expressionType) {
            return { ...instance };
        }

        // Get type-level options
        const typeKey = expressionType.toLowerCase();
        const typeDefaults = defaults[typeKey] || {};
        const typeOverride = typeOverrides[typeKey] || {};

        // Get expression-specific options from instance
        const expressionOpts = instance.expressionOptions?.[typeKey] || {};

        // Merge: type defaults < type overrides < instance expression-specific
        return {
            ...typeDefaults,
            ...typeOverride,
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
