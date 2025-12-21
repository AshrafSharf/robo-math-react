/**
 * ParametricPlotExpression - represents a parametric function plot
 * Syntax:
 *   paraplot(graph, "xExpr", "yExpr")                    - String equations
 *   paraplot(graph, "xExpr", "yExpr", tMin, tMax)
 *   paraplot(graph, xFuncDef, yFuncDef)                  - Function definitions (from def())
 *   paraplot(graph, xFuncDef, yFuncDef, tMin, tMax)
 *
 * Both string and function definition paths compile at resolve time (late binding).
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { ParametricPlotCommand } from '../../commands/ParametricPlotCommand.js';
import { FunctionDefinitionExpression } from './FunctionDefinitionExpression.js';
import { MathFunctionCompiler } from '../utils/MathFunctionCompiler.js';

export class ParametricPlotExpression extends AbstractNonArithmeticExpression {
    static NAME = 'paraplot';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.graphExpression = null;
        this.xEquation = '';  // x(t) expression string
        this.yEquation = '';  // y(t) expression string
        this.tMin = 0;
        this.tMax = 2 * Math.PI;
        this.scope = {};  // Variable scope for math.js evaluation
        this.xFunctionDef = null;  // FunctionDefinitionExpression if using def() for x
        this.yFunctionDef = null;  // FunctionDefinitionExpression if using def() for y
        this.compiledXFunction = null;  // Compiled x(t) function
        this.compiledYFunction = null;  // Compiled y(t) function
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('paraplot() requires at least 3 arguments: graph, xExpr, yExpr');
        }

        // First arg is graph reference - resolve and store the actual expression
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        // LATE BINDING: Get current scope at resolve time
        this.scope = context.getReferencesCopyAsPrimitiveValues();

        // Second arg is x equation (string or function definition)
        this.subExpressions[1].resolve(context);
        const xExpr = this.subExpressions[1];
        const xResult = this._resolveEquationOrFuncDef(xExpr, context);
        this.xEquation = xResult.equation;
        this.xFunctionDef = xResult.funcDef;
        this.compiledXFunction = xResult.compiled;

        // Third arg is y equation (string or function definition)
        this.subExpressions[2].resolve(context);
        const yExpr = this.subExpressions[2];
        const yResult = this._resolveEquationOrFuncDef(yExpr, context);
        this.yEquation = yResult.equation;
        this.yFunctionDef = yResult.funcDef;
        this.compiledYFunction = yResult.compiled;

        // Register as dependent of user variables in both equations (for fromTo support)
        MathFunctionCompiler.registerDependencies(
            [this.xEquation, this.yEquation],
            ['t'],
            context,
            this
        );

        // Optional t range arguments (tMin, tMax)
        if (this.subExpressions.length >= 5) {
            this.subExpressions[3].resolve(context);
            this.subExpressions[4].resolve(context);

            const minValues = this.subExpressions[3].getVariableAtomicValues();
            const maxValues = this.subExpressions[4].getVariableAtomicValues();

            if (minValues.length > 0) this.tMin = minValues[0];
            if (maxValues.length > 0) this.tMax = maxValues[0];
        }
    }

    /**
     * Resolve an equation expression - either string or function definition
     * @param {Object} expr - The expression to resolve
     * @param {Object} context - Expression context
     * @returns {Object} { equation: string, funcDef: FunctionDefinitionExpression|null, compiled: Function }
     */
    _resolveEquationOrFuncDef(expr, context) {
        // Check if it's a function definition reference
        if (typeof expr.getVariableName === 'function') {
            const varName = expr.getVariableName();
            if (varName) {
                const ref = context.getReference(varName);
                if (ref instanceof FunctionDefinitionExpression) {
                    return {
                        equation: ref.getBodyString(),
                        funcDef: ref,
                        compiled: ref.compileWithScope(this.scope)
                    };
                }
            }
        }

        // Fall back to string extraction
        const equation = this._extractEquationString(expr);
        return {
            equation,
            funcDef: null,
            compiled: equation ? MathFunctionCompiler.compile(equation, ['t'], this.scope) : null
        };
    }

    /**
     * Extract equation string from various expression types
     * @param {Object} expr - Expression object
     * @returns {string} Equation string
     */
    _extractEquationString(expr) {
        if (typeof expr.getStringValue === 'function') {
            // QuotedStringExpression - e.g., "cos(t)"
            return expr.getStringValue();
        } else if (typeof expr.getEquation === 'function') {
            return expr.getEquation();
        } else if (typeof expr.getValue === 'function') {
            return expr.getValue();
        } else {
            // Try to get it from atomic values
            const atomicValues = expr.getVariableAtomicValues();
            if (atomicValues.length > 0) {
                return String(atomicValues[0]);
            }
        }
        return '';
    }

    getName() {
        return ParametricPlotExpression.NAME;
    }

    getXEquation() {
        return this.xEquation;
    }

    getYEquation() {
        return this.yEquation;
    }

    getTRange() {
        return { min: this.tMin, max: this.tMax };
    }

    getVariableAtomicValues() {
        return [this.xEquation, this.yEquation, this.tMin, this.tMax];
    }

    /**
     * Get the variable scope for math.js evaluation
     * @returns {Object} Scope with variable values like {a: 10, b: 5}
     */
    getScope() {
        return this.scope;
    }

    /**
     * Get compiled x(t) function
     * @returns {Function}
     */
    getCompiledXFunction() {
        return this.compiledXFunction;
    }

    /**
     * Get compiled y(t) function
     * @returns {Function}
     */
    getCompiledYFunction() {
        return this.compiledYFunction;
    }

    /**
     * Create a ParametricPlotCommand from this expression
     * @param {Object} options - Command options {strokeWidth}
     * @returns {ParametricPlotCommand}
     */
    toCommand(options = {}) {
        // Always pass compiled functions - both string and def() paths compile at resolve time
        return new ParametricPlotCommand(
            this.graphExpression,
            this.compiledXFunction,  // Pre-compiled x(t) function
            this.compiledYFunction,  // Pre-compiled y(t) function
            this.tMin,
            this.tMax,
            this.xEquation,          // Keep for display/debugging
            this.yEquation,          // Keep for display/debugging
            options
        );
    }

    /**
     * Parametric plots can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }
}
