import { NumericExpression } from '../expressions/NumericExpression.js';
import { PointExpression } from '../expressions/PointExpression.js';
import { Point3DExpression } from '../expressions/3d/Point3DExpression.js';

/**
 * System constants - predefined numeric variables available in all expressions
 */
const SYSTEM_CONSTANTS = {
    pi: Math.PI,
    e: Math.E
};

/**
 * Create a pre-resolved origin point (0, 0)
 */
function createOrigin() {
    const origin = new PointExpression([]);
    origin.point = { x: 0, y: 0 };
    return origin;
}

/**
 * Create a pre-resolved origin3d point (0, 0, 0)
 */
function createOrigin3D() {
    const origin3d = new Point3DExpression([]);
    origin3d.point = { x: 0, y: 0, z: 0 };
    return origin3d;
}

/**
 * Context for expression evaluation - stores variable references and state
 * Also tracks dependencies between expressions for reactive updates (fromTo)
 */
export class ExpressionContext {
    constructor() {
        this.references = {};
        this.dependents = {};       // variableName → Set<expression>
        this.currentCaller = null;  // expression currently being resolved

        // For copy expression support
        this.pages = [];              // All lesson pages
        this.currentPageIndex = 0;    // Index of current page
        this.pipelineService = null;  // Pipeline service for reuse

        // Initialize system constants
        this.initSystemConstants();
    }

    /**
     * Initialize predefined system constants (pi, e, origin, origin3d)
     */
    initSystemConstants() {
        // Numeric constants
        for (const [name, value] of Object.entries(SYSTEM_CONSTANTS)) {
            this.references[name] = new NumericExpression(value);
        }

        // Point constants
        this.references['origin'] = createOrigin();
        this.references['origin3d'] = createOrigin3D();
    }

    // Dependency tracking: set/get current caller
    setCaller(expression) {
        this.currentCaller = expression;
    }

    getCaller() {
        return this.currentCaller;
    }

    addReference(key, value) {
        this.references[key] = value;
    }

    updateReference(key, value) {
        this.references[key] = value;
    }

    hasReference(key) {
        return this.references[key] !== undefined;
    }

    // Auto-register dependency when variable is accessed
    getReference(key) {
        const value = this.references[key];

        // Register caller as dependent of this variable
        if (this.currentCaller && value !== undefined) {
            this.addDependent(key, this.currentCaller);
        }

        return value;
    }

    // Dependency tracking: add/get dependents
    addDependent(variableName, expression) {
        if (!this.dependents[variableName]) {
            this.dependents[variableName] = new Set();
        }
        this.dependents[variableName].add(expression);
    }

    getDependents(variableName) {
        return this.dependents[variableName] || new Set();
    }

    getAllDependents() {
        return this.dependents;
    }

    getReferencesCopy() {
        const copyReferences = {};
        for (const key in this.references) {
            copyReferences[key] = this.references[key];
        }
        return copyReferences;
    }

    getReferencesCopyAsPrimitiveValues() {
        const copyReferences = {};
        for (const key in this.references) {
            const retVal = this.references[key];
            if (retVal && retVal.value !== undefined) {
                copyReferences[key] = retVal.value; // Numeric Expression values
            }
            if (retVal && retVal.quotedComment !== undefined) {
                copyReferences[key] = retVal.quotedComment; // String values
            }
        }
        return copyReferences;
    }
}
