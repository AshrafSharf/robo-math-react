/**
 * Plot expression - represents a function plot
 * Syntax:
 *   plot(graph, "equation")                    - String equation
 *   plot(graph, "equation", domainMin, domainMax)
 *   plot(graph, funcDef)                       - Function definition (from def())
 *   plot(graph, funcDef, domainMin, domainMax)
 *
 * Both string and function definition paths compile at resolve time (late binding).
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { PlotCommand } from '../../commands/PlotCommand.js';
import { FunctionDefinitionExpression } from './FunctionDefinitionExpression.js';
import { MathFunctionCompiler } from '../utils/MathFunctionCompiler.js';

export class PlotExpression extends AbstractNonArithmeticExpression {
    static NAME = 'plot';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.graphExpression = null;
        this.equation = '';
        this.domainMin = null;
        this.domainMax = null;
        this.scope = {};  // Variable scope for math.js evaluation
        this.functionDefinition = null;  // FunctionDefinitionExpression if using def()
        this.compiledFunction = null;    // Compiled function (for both string and def)
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('plot() requires at least 2 arguments: graph, equation');
        }

        // First arg is graph reference - resolve and store the actual expression
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        // Second arg is equation (string or function definition)
        this.subExpressions[1].resolve(context);
        const equationExpr = this.subExpressions[1];

        // LATE BINDING: Get current scope at resolve time
        this.scope = context.getReferencesCopyAsPrimitiveValues();

        // Check if it's a function definition reference first
        let isFunctionDef = false;
        if (typeof equationExpr.getVariableName === 'function') {
            const varName = equationExpr.getVariableName();
            if (varName) {
                const ref = context.getReference(varName);
                if (ref instanceof FunctionDefinitionExpression) {
                    this.functionDefinition = ref;
                    this.equation = ref.getBodyString();
                    // Compile NOW with current scope (late binding)
                    this.compiledFunction = ref.compileWithScope(this.scope);
                    isFunctionDef = true;
                }
            }
        }

        // Fall back to string extraction if not a function def
        if (!isFunctionDef) {
            // Get the equation string - could be from various expression types
            if (typeof equationExpr.getStringValue === 'function') {
                // QuotedStringExpression - e.g., plot(g, "x^2")
                this.equation = equationExpr.getStringValue();
            } else if (typeof equationExpr.getEquation === 'function') {
                this.equation = equationExpr.getEquation();
            } else if (typeof equationExpr.getValue === 'function') {
                this.equation = equationExpr.getValue();
            } else {
                // Try to get it from atomic values or variable name
                const atomicValues = equationExpr.getVariableAtomicValues();
                if (atomicValues.length > 0) {
                    this.equation = String(atomicValues[0]);
                }
            }

            // Compile string-based equation with current scope
            if (this.equation) {
                this.compiledFunction = MathFunctionCompiler.compile(this.equation, ['x'], this.scope);
            }
        }

        // Register as dependent of user variables in the equation (for fromTo support)
        MathFunctionCompiler.registerDependencies(this.equation, ['x'], context, this);

        // Optional domain and styling arguments
        const styleExprs = [];
        for (let i = 2; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const expr = this.subExpressions[i];

            if (this._isStyleExpression(expr)) {
                styleExprs.push(expr);
            } else {
                const values = expr.getVariableAtomicValues();
                if (values.length > 0) {
                    if (this.domainMin === null) {
                        this.domainMin = values[0];
                    } else if (this.domainMax === null) {
                        this.domainMax = values[0];
                    }
                }
            }
        }

        this._parseStyleExpressions(styleExprs);
    }

    // getGrapher() inherited from AbstractNonArithmeticExpression

    getName() {
        return PlotExpression.NAME;
    }

    /**
     * Get geometry type for transformations
     * @returns {string}
     */
    getGeometryType() {
        return 'plot';
    }

    getEquation() {
        return this.equation;
    }

    getDomain() {
        return { min: this.domainMin, max: this.domainMax };
    }

    getVariableAtomicValues() {
        return [this.equation, this.domainMin, this.domainMax];
    }

    /**
     * Get the variable scope for math.js evaluation
     * @returns {Object} Scope with variable values like {a: 10, b: 5}
     */
    getScope() {
        return this.scope;
    }

    /**
     * Get the compiled function (compiled at resolve time with current scope)
     * @returns {Function} Compiled function f(x) => y
     */
    getCompiledFunction() {
        return this.compiledFunction;
    }

    /**
     * Check if this plot uses a function definition
     * @returns {boolean}
     */
    hasFunctionDefinition() {
        return this.functionDefinition !== null;
    }

    /**
     * Create a PlotCommand from this expression
     * @param {Object} options - Command options {strokeWidth}
     * @returns {PlotCommand}
     */
    toCommand(options = {}) {
        // Always pass compiled function - both string and def() paths compile at resolve time
        return new PlotCommand(
            this.graphExpression,
            this.compiledFunction,   // Pre-compiled function
            this.domainMin,
            this.domainMax,
            this.equation,           // Keep equation string for display/debugging
            options
        );
    }

    /**
     * Plots can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }
}
