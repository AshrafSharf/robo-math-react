/**
 * Space3DExpression - creates a pure Three.js 3D space container
 *
 * Syntax: s3d(row1, col1, row2, col2)
 *
 * Features:
 *   - No coordinate transforms (direct Three.js Y-up system)
 *   - No grid, no axes helpers
 *   - Supports group nesting via group() expression
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { CreateSpace3DCommand } from '../../commands/CreateSpace3DCommand.js';

export class Space3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 's3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        // Resolved values - bounds-based
        this.row1 = 0;
        this.col1 = 0;
        this.row2 = 10;
        this.col2 = 8;
        // Reference to created space3d (set by command after init)
        this.space3d = null;
    }

    resolve(context) {
        // Extract all numeric values from subExpressions
        const values = [];

        for (const expr of this.subExpressions) {
            expr.resolve(context);
            values.push(...expr.getVariableAtomicValues());
        }

        // Required: row1, col1, row2, col2
        if (values.length < 4) {
            this.dispatchError('s3d() requires 4 arguments: row1, col1, row2, col2');
        }

        this.row1 = values[0];
        this.col1 = values[1];
        this.row2 = values[2];
        this.col2 = values[3];

        // Validate that end bounds are greater than start bounds
        if (this.row2 <= this.row1) {
            this.dispatchError(`s3d() end row (${this.row2}) must be greater than start row (${this.row1})`);
        }
        if (this.col2 <= this.col1) {
            this.dispatchError(`s3d() end col (${this.col2}) must be greater than start col (${this.col1})`);
        }
    }

    getName() {
        return Space3DExpression.NAME;
    }

    /**
     * Check if this is an s3d expression
     */
    isSpace3D() {
        return true;
    }

    /**
     * Get the Space3D container
     */
    getSpace3D() {
        return this.space3d;
    }

    /**
     * Set the Space3D container (called by command after init)
     */
    setSpace3D(space3d) {
        this.space3d = space3d;
    }

    /**
     * Get the scene for adding shapes
     */
    getScene() {
        return this.space3d?.scene || null;
    }

    /**
     * Get the diagram for shape creation
     */
    getDiagram() {
        return this.space3d?.diagram || null;
    }

    getVariableAtomicValues() {
        // Space doesn't contribute coordinates - it's a container
        return [];
    }

    toCommand(options = {}) {
        return new CreateSpace3DCommand(
            this.row1, this.col1, this.row2, this.col2,
            this  // Pass expression reference so command can set space3d
        );
    }

    canPlay() {
        return true;
    }
}
