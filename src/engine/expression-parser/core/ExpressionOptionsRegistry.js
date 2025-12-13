/**
 * ExpressionOptionsRegistry - Central registry for expression-type default style options
 *
 * Usage:
 *   const { styleOptions } = ExpressionOptionsRegistry.get('line3d');
 *   // Returns { styleOptions: { strokeWidth: 0.06, color: 0x000000, ... } }
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

// Instance overrides (can be set at runtime)
const overrides = {};

export const ExpressionOptionsRegistry = {
    /**
     * Get options for an expression type
     * @param {string} expressionName - e.g., 'line3d', 'point', 'vector'
     * @returns {Object} Options object with defaults
     */
    get(expressionName) {
        const key = expressionName.toLowerCase();
        const defaultOpts = defaults[key] || {};
        const overrideOpts = overrides[key] || {};
        return { ...defaultOpts, ...overrideOpts };
    },

    /**
     * Set override options for an expression type
     * @param {string} expressionName
     * @param {Object} options
     */
    set(expressionName, options) {
        const key = expressionName.toLowerCase();
        overrides[key] = { ...(overrides[key] || {}), ...options };
    },

    /**
     * Reset overrides for an expression type (back to defaults)
     * @param {string} expressionName
     */
    reset(expressionName) {
        const key = expressionName.toLowerCase();
        delete overrides[key];
    },

    /**
     * Reset all overrides
     */
    resetAll() {
        Object.keys(overrides).forEach(key => delete overrides[key]);
    },

    /**
     * Get the default options (without overrides)
     * @param {string} expressionName
     * @returns {Object}
     */
    getDefaults(expressionName) {
        const key = expressionName.toLowerCase();
        return { ...(defaults[key] || {}) };
    }
};
