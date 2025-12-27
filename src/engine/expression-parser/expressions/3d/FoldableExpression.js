/**
 * FoldableExpression - Generic foldable shape expression
 *
 * Syntax:
 *   foldable(g, sheetSize, cutSize, "box")          - square box net
 *   foldable(g, length, width, cutSize, "rectbox")  - rectangular box net
 *   foldable(g, size, "cube")                       - cube net
 *
 * The type string must be the last non-style argument.
 * Returns a foldable object with accessible faces via face() and faces().
 *
 * Example:
 *   F = foldable(G, 12, 2, "box", c(blue))
 *   rotate3d(face(F, "top"), 90)
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { FoldableCommand } from '../../../commands/3d/FoldableCommand.js';

// Supported foldable types and their parameter counts (excluding graph and type string)
const TYPE_PARAM_COUNTS = {
    'box': 2,       // sheetSize, cutSize
    'rectbox': 3,   // length, width, cutSize
    'cube': 1       // size
};

export class FoldableExpression extends AbstractNonArithmeticExpression {
    static NAME = 'foldable';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.graphExpression = null;
        this.type = null;
        this.params = [];
        this.foldableResult = null;  // Set after command execution
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('foldable() requires at least 3 arguments: graph, params, "type"');
        }

        // First arg must be g3d graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g3d') {
            this.dispatchError('foldable() first argument must be a g3d graph container');
        }

        // Find the type string (last string argument before any style expressions)
        // Also collect style expressions and numeric params
        const styleExprs = [];
        const numericArgs = [];
        let typeString = null;

        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const arg = this._getResolvedExpression(context, this.subExpressions[i]);

            // Check for style expression
            if (this._isStyleExpression(arg)) {
                styleExprs.push(arg);
                continue;
            }

            // Check for string (type)
            if (arg.getName() === 'quotedstring') {
                typeString = arg.getStringValue();
                continue;
            }

            // Collect numeric value
            const values = arg.getVariableAtomicValues();
            if (values.length > 0) {
                numericArgs.push(values[0]);
            }
        }

        // Parse styles
        this._parseStyleExpressions(styleExprs);

        // Validate type
        if (!typeString) {
            this.dispatchError('foldable() requires a type string (e.g., "box", "cube")');
        }

        this.type = typeString.toLowerCase();

        if (!TYPE_PARAM_COUNTS[this.type]) {
            const supported = Object.keys(TYPE_PARAM_COUNTS).join(', ');
            this.dispatchError(`Unknown foldable type: "${this.type}". Supported: ${supported}`);
        }

        // Validate param count
        const expectedParams = TYPE_PARAM_COUNTS[this.type];
        if (numericArgs.length < expectedParams) {
            this.dispatchError(`foldable("${this.type}") requires ${expectedParams} numeric parameters, got ${numericArgs.length}`);
        }

        this.params = numericArgs.slice(0, expectedParams);
    }

    getName() {
        return FoldableExpression.NAME;
    }

    getGeometryType() {
        return 'foldable';
    }

    getType() {
        return this.type;
    }

    getParams() {
        return this.params;
    }

    /**
     * Set the foldable result after command execution
     * This allows face() and other accessors to work
     */
    setFoldableResult(result) {
        this.foldableResult = result;
    }

    /**
     * Get the foldable result (used by face() accessor)
     */
    getFoldableResult() {
        return this.foldableResult;
    }

    /**
     * Get face by name or index (used by FaceExpression)
     */
    getFace(nameOrIndex) {
        if (!this.foldableResult) {
            return null;
        }
        return this.foldableResult.getFace(nameOrIndex);
    }

    /**
     * Get all faces (used by FacesExpression)
     */
    getFaces() {
        if (!this.foldableResult) {
            return [];
        }
        return this.foldableResult.getFaces();
    }

    /**
     * Get volume (used by VolumeExpression)
     */
    getVolume() {
        if (!this.foldableResult) {
            // Compute theoretical volume from params
            if (this.type === 'box') {
                const sheetSize = this.params[0];
                const cutSize = this.params[1];
                const innerSize = sheetSize - 2 * cutSize;
                return cutSize * innerSize * innerSize;
            }
            return 0;
        }
        return this.foldableResult.getVolume();
    }

    getVariableAtomicValues() {
        // Return params as atomic values
        return this.params.slice();
    }

    getFriendlyToStr() {
        return `foldable(${this.type}, ${this.params.join(', ')})`;
    }

    toCommand(options = {}) {
        const styleOptions = {
            color: this.color,
            strokeWidth: this.strokeWidth,
            ...(options.styleOptions || {})
        };

        return new FoldableCommand(
            this.graphExpression,
            this.type,
            this.params,
            this,  // Pass expression reference for setFoldableResult callback
            { styleOptions }
        );
    }

    canPlay() {
        return true;
    }
}
