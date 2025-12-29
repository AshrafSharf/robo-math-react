/**
 * BaseTableExpression - Base class for tablep and tablew expressions
 *
 * Creates dynamic math tables where each cell displays the result of
 * evaluating a formula with mathjs for each value in a range.
 *
 * Syntax:
 *   tablep(row, col, "formula1", "formula2", ..., range(start, end, step))
 *   tablew(row, col, "formula1", "formula2", ..., range(start, end, step))
 *
 * With headers:
 *   tablep(row, col, header("n", "n^2", "sin(n)"), "n", "n^2", "sin(n)", range(1, 10, 1))
 *
 * Example:
 *   T = tablep(0, 0, "x", "x^2", "sin(x)", range(1, 10, 1))
 *   // Creates a table with 3 columns and 10 rows
 *   // Column 1: x values (1, 2, 3, ..., 10)
 *   // Column 2: x^2 values (1, 4, 9, ..., 100)
 *   // Column 3: sin(x) values
 *
 * Table size is determined dynamically by content.
 * Access cells via item(T, row, col).
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { BaseTableCommand } from '../../commands/BaseTableCommand.js';
import { RangeExpression } from './RangeExpression.js';
import { QuotedStringExpression } from './QuotedStringExpression.js';
import { VariableReferenceExpression } from './VariableReferenceExpression.js';
import { HeaderExpression } from './HeaderExpression.js';
import * as mathjs from 'mathjs';

// Constants that should not be treated as user variables
const MATH_CONSTANTS = new Set([
    'pi', 'e', 'i', 'Infinity', 'NaN', 'true', 'false', 'null',
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
    'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
    'sqrt', 'cbrt', 'exp', 'log', 'log10', 'log2',
    'abs', 'ceil', 'floor', 'round', 'sign',
    'min', 'max', 'mean', 'median', 'std', 'variance',
    'pow', 'mod', 'gcd', 'lcm', 'factorial'
]);

/**
 * Unwrap a variable reference to get the underlying expression
 */
function unwrapExpression(expr) {
    if (expr instanceof VariableReferenceExpression) {
        return expr.variableValueExpression;
    }
    return expr;
}

export class BaseTableExpression extends AbstractNonArithmeticExpression {
    static NAME = 'table';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;

        // Position (top-left corner in logical coordinates)
        this.row = 0;
        this.col = 0;

        // Formulas for each column
        this.formulas = [];

        // Header labels (optional)
        this.headerLabels = null;

        // Range expression for row values
        this.rangeExpression = null;

        // Auto-detected variable name (e.g., 'x', 'n', 'i')
        this.variableName = 'x';

        // Computed row data: [{varValue: 1, values: [1, 1, 0.84]}, ...]
        this.rowData = [];

        // Reference to created table (set by command after init)
        this.table = null;

        // Style options
        this.fontSize = null;
        this.color = null;
        this.precision = 2;  // Default: 2 decimal places
    }

    /**
     * Get the cell type for this table (override in subclasses)
     * @returns {string} 'katex' or 'mathtext'
     */
    getCellType() {
        throw new Error('BaseTableExpression.getCellType() must be overridden');
    }

    resolve(context) {
        if (this.subExpressions.length < 4) {
            this.dispatchError(`${this.getName()}() requires at least 4 arguments: row, col, "formula", range(...)`);
        }

        // Resolve first 2 args for position
        for (let i = 0; i < 2; i++) {
            const expr = this.subExpressions[i];
            expr.resolve(context);
            const values = expr.getVariableAtomicValues();
            if (values.length > 0 && typeof values[0] === 'number') {
                if (i === 0) this.row = values[0];
                else this.col = values[0];
            } else {
                this.dispatchError(`${this.getName()}() argument ${i + 1} must be a number`);
            }
        }

        // Collect formulas and find range expression
        // Format: tablep(row, col, [header(...)], "f1", "f2", ..., range(...), [styles...])
        for (let i = 2; i < this.subExpressions.length; i++) {
            const exprRaw = this.subExpressions[i];
            exprRaw.resolve(context);
            const expr = unwrapExpression(exprRaw);

            if (expr instanceof HeaderExpression) {
                // It's a header expression
                this.headerLabels = expr.getLabels();
            } else if (expr instanceof QuotedStringExpression) {
                // It's a formula string
                this.formulas.push(expr.getStringValue());
            } else if (expr instanceof RangeExpression) {
                // It's the range expression
                this.rangeExpression = expr;
                // After range, remaining args are style expressions
                this._parseStylesFrom(i + 1, context);
                break;
            }
        }

        if (this.formulas.length === 0) {
            this.dispatchError(`${this.getName()}() requires at least one formula string`);
        }

        if (!this.rangeExpression) {
            this.dispatchError(`${this.getName()}() requires a range(...) expression`);
        }

        // Auto-detect variable name from formulas
        this.variableName = this._extractVariable(this.formulas);

        // Compute row data by evaluating formulas
        this._computeRowData();
    }

    /**
     * Parse style expressions from the given index
     */
    _parseStylesFrom(startIndex, context) {
        for (let i = startIndex; i < this.subExpressions.length; i++) {
            const exprRaw = this.subExpressions[i];
            exprRaw.resolve(context);
            const expr = unwrapExpression(exprRaw);

            // Check for header expression (can appear after range)
            if (expr instanceof HeaderExpression) {
                this.headerLabels = expr.getLabels();
                continue;
            }

            // Check for style expressions (c, f, p, etc.)
            const styleName = expr.getName?.();
            if (styleName === 'c') {
                this.color = expr.getColor?.();
            } else if (styleName === 'f') {
                this.fontSize = expr.getValue?.();
            } else if (styleName === 'p') {
                this.precision = expr.getValue?.();
            }
        }
    }

    /**
     * Auto-detect the variable name from formulas using mathjs.parse()
     * @param {string[]} formulas - Array of formula strings
     * @returns {string} The detected variable name (or 'x' as default)
     */
    _extractVariable(formulas) {
        const variables = new Set();

        for (const formula of formulas) {
            try {
                const node = mathjs.parse(formula);
                node.traverse((n) => {
                    if (n.isSymbolNode && !MATH_CONSTANTS.has(n.name)) {
                        variables.add(n.name);
                    }
                });
            } catch (e) {
                // If parsing fails, continue with other formulas
                console.warn(`Failed to parse formula for variable detection: ${formula}`, e);
            }
        }

        // Return first variable found, or 'x' as default
        const varArray = [...variables];
        return varArray.length > 0 ? varArray[0] : 'x';
    }

    /**
     * Compute row data by evaluating each formula for each range value
     */
    _computeRowData() {
        const rangeValues = this._getRangeValues();
        this.rowData = [];

        for (const varValue of rangeValues) {
            const scope = { [this.variableName]: varValue };
            const values = [];

            for (const formula of this.formulas) {
                try {
                    const result = mathjs.evaluate(formula, scope);
                    values.push(this._formatValue(result));
                } catch (e) {
                    console.warn(`Failed to evaluate formula "${formula}" with ${this.variableName}=${varValue}:`, e);
                    values.push('?');
                }
            }

            this.rowData.push({
                varValue,
                values
            });
        }
    }

    /**
     * Get the array of values from the range expression
     * @returns {number[]}
     */
    _getRangeValues() {
        const range = this.rangeExpression.getRange();
        const step = this.rangeExpression.getStep() || 1;
        const [min, max] = range;

        const values = [];
        for (let v = min; v <= max; v += step) {
            values.push(v);
        }

        return values;
    }

    /**
     * Format a computed value for display
     * @param {number} value
     * @returns {string}
     */
    _formatValue(value) {
        if (typeof value !== 'number') {
            return String(value);
        }

        // Round to avoid floating point noise
        const rounded = Math.round(value * 1e10) / 1e10;

        // Check if it's close to an integer
        if (Math.abs(rounded - Math.round(rounded)) < 1e-9) {
            return String(Math.round(rounded));
        }

        // Format with specified precision (default 2 decimal places)
        return rounded.toFixed(this.precision);
    }

    getName() {
        return BaseTableExpression.NAME;
    }

    /**
     * Get the table (set by command after init)
     */
    getTable() {
        return this.table;
    }

    /**
     * Set the table (called by command after init)
     */
    setTable(table) {
        this.table = table;
    }

    getVariableAtomicValues() {
        // Table doesn't contribute coordinates - it's a container
        return [];
    }

    toCommand(options = {}) {
        return new BaseTableCommand(
            this.row,
            this.col,
            {
                cellType: this.getCellType(),
                formulas: this.formulas,
                headerLabels: this.headerLabels,
                rowData: this.rowData,
                variableName: this.variableName,
                fontSize: this.fontSize,
                color: this.color
            },
            this
        );
    }
}
