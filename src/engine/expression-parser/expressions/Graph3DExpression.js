/**
 * Graph3DExpression - creates a 3D graph container using logical coordinate bounds
 *
 * Syntax: g3d(row1, col1, row2, col2, [xMin, xMax, yMin, yMax, zMin, zMax, showGrid, coordinateSystem])
 *
 * coordinateSystem can be:
 *   - 'lhs' (default): Left-Hand System - X right, Y forward, Z up
 *   - 'rhs': Right-Hand System - native Three.js coordinates (X right, Y up, Z towards viewer)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { Create3DGraphCommand } from '../../commands/Create3DGraphCommand.js';

export class Graph3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'g3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        // Resolved values - bounds-based
        this.row1 = 0;
        this.col1 = 0;
        this.row2 = 10;
        this.col2 = 8;
        this.xRange = [-10, 10];
        this.yRange = [-10, 10];
        this.zRange = [-10, 10];
        this.showGrid = true;
        this.coordinateSystem = 'lhs'; // Default to LHS coordinate system
        // Reference to created grapher (set by command after init)
        this.grapher = null;
    }

    resolve(context) {
        // Extract all numeric values from subExpressions
        const values = [];
        let coordinateSystemArg = null;

        for (const expr of this.subExpressions) {
            expr.resolve(context);
            // Check if this is a string expression (for coordinate system)
            if (expr.stringValue !== undefined) {
                coordinateSystemArg = expr.stringValue;
            } else {
                values.push(...expr.getVariableAtomicValues());
            }
        }

        // Required: row1, col1, row2, col2
        if (values.length < 4) {
            this.dispatchError('g3d() requires at least 4 arguments: row1, col1, row2, col2');
        }

        this.row1 = values[0];
        this.col1 = values[1];
        this.row2 = values[2];
        this.col2 = values[3];

        // Validate that end bounds are greater than start bounds
        if (this.row2 <= this.row1) {
            this.dispatchError(`g3d() end row (${this.row2}) must be greater than start row (${this.row1})`);
        }
        if (this.col2 <= this.col1) {
            this.dispatchError(`g3d() end col (${this.col2}) must be greater than start col (${this.col1})`);
        }

        // Optional: xMin, xMax (indices 4, 5)
        if (values.length >= 6) {
            this.xRange = [values[4], values[5]];
        }

        // Optional: yMin, yMax (indices 6, 7)
        if (values.length >= 8) {
            this.yRange = [values[6], values[7]];
        }

        // Optional: zMin, zMax (indices 8, 9)
        if (values.length >= 10) {
            this.zRange = [values[8], values[9]];
        }

        // Optional: showGrid (index 10, 0=false, non-zero=true)
        if (values.length >= 11) {
            this.showGrid = values[10] !== 0;
        }

        // Optional: coordinateSystem (string argument)
        if (coordinateSystemArg) {
            const cs = coordinateSystemArg.toLowerCase();
            if (cs === 'lhs' || cs === 'rhs') {
                this.coordinateSystem = cs;
            }
        }
    }

    getName() {
        return Graph3DExpression.NAME;
    }

    getGrapher() {
        return this.grapher;
    }

    setGrapher(grapher) {
        this.grapher = grapher;
    }

    getVariableAtomicValues() {
        // Graph doesn't contribute coordinates - it's a container, not a geometric value
        return [];
    }

    toCommand(options = {}) {
        return new Create3DGraphCommand(
            this.row1, this.col1, this.row2, this.col2,
            {
                xRange: this.xRange,
                yRange: this.yRange,
                zRange: this.zRange,
                showGrid: this.showGrid,
                coordinateSystem: this.coordinateSystem
            },
            this  // Pass expression reference so command can set grapher
        );
    }
}
