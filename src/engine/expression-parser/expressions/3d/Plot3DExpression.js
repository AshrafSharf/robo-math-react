/**
 * Plot3DExpression - represents a 3D surface plot z = f(x, y)
 * Syntax:
 *   plot3d(graph, "equation")                           - String equation, domain from g3d
 *   plot3d(graph, "equation", xMin, xMax, yMin, yMax)   - Explicit domain
 *   plot3d(graph, funcDef)                              - Function definition (from def())
 *   plot3d(graph, funcDef, xMin, xMax, yMin, yMax)
 *
 * Both string and function definition paths compile at resolve time (late binding).
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Plot3DCommand } from '../../../commands/Plot3DCommand.js';
import { FunctionDefinitionExpression } from '../FunctionDefinitionExpression.js';
import { MathFunctionCompiler } from '../../utils/MathFunctionCompiler.js';

export class Plot3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'plot3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.graphExpression = null;
        this.equation = '';
        this.xMin = null;
        this.xMax = null;
        this.yMin = null;
        this.yMax = null;
        this.scope = {};  // Variable scope for math.js evaluation
        this.functionDefinition = null;  // FunctionDefinitionExpression if using def()
        this.compiledFunction = null;    // Compiled function (for both string and def)
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('plot3d() requires at least 2 arguments: graph, equation');
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
                    // Note: For 3D plots, function should accept 2 params (x, y)
                    this.compiledFunction = MathFunctionCompiler.compile(this.equation, ['x', 'y'], this.scope);
                    isFunctionDef = true;
                }
            }
        }

        // Fall back to string extraction if not a function def
        if (!isFunctionDef) {
            // Get the equation string - could be from various expression types
            if (typeof equationExpr.getStringValue === 'function') {
                // QuotedStringExpression - e.g., plot3d(g, "x^2 + y^2")
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
                this.compiledFunction = MathFunctionCompiler.compile(this.equation, ['x', 'y'], this.scope);
            }
        }

        // Register as dependent of user variables in the equation (for fromTo support)
        MathFunctionCompiler.registerDependencies(this.equation, ['x', 'y'], context, this);

        // Optional domain arguments (xMin, xMax, yMin, yMax)
        if (this.subExpressions.length >= 6) {
            this.subExpressions[2].resolve(context);
            this.subExpressions[3].resolve(context);
            this.subExpressions[4].resolve(context);
            this.subExpressions[5].resolve(context);

            // Register dependencies for domain variables (for change expression support)
            this._registerVariableDependency(this.subExpressions[2], context);
            this._registerVariableDependency(this.subExpressions[3], context);
            this._registerVariableDependency(this.subExpressions[4], context);
            this._registerVariableDependency(this.subExpressions[5], context);

            const xMinValues = this.subExpressions[2].getVariableAtomicValues();
            const xMaxValues = this.subExpressions[3].getVariableAtomicValues();
            const yMinValues = this.subExpressions[4].getVariableAtomicValues();
            const yMaxValues = this.subExpressions[5].getVariableAtomicValues();

            if (xMinValues.length > 0) this.xMin = xMinValues[0];
            if (xMaxValues.length > 0) this.xMax = xMaxValues[0];
            if (yMinValues.length > 0) this.yMin = yMinValues[0];
            if (yMaxValues.length > 0) this.yMax = yMaxValues[0];
        }

        // If domain not provided, use ranges from g3d
        if (this.xMin === null && this.graphExpression) {
            const xRange = this.graphExpression.xRange;
            const yRange = this.graphExpression.yRange;
            if (xRange) {
                this.xMin = xRange[0];
                this.xMax = xRange[1];
            }
            if (yRange) {
                this.yMin = yRange[0];
                this.yMax = yRange[1];
            }
        }
    }

    /**
     * Register this expression as dependent on a variable if the subExpression is a variable reference
     * @param {Object} subExpr - The subexpression to check
     * @param {Object} context - Expression context
     */
    _registerVariableDependency(subExpr, context) {
        if (typeof subExpr.getVariableName === 'function') {
            const varName = subExpr.getVariableName();
            if (varName && context.hasReference(varName)) {
                context.addDependent(varName, this);
            }
        }
    }

    getName() {
        return Plot3DExpression.NAME;
    }

    /**
     * Get geometry type for transformations
     * @returns {string}
     */
    getGeometryType() {
        return 'plot3d';
    }

    getEquation() {
        return this.equation;
    }

    getDomain() {
        return {
            xMin: this.xMin,
            xMax: this.xMax,
            yMin: this.yMin,
            yMax: this.yMax
        };
    }

    getVariableAtomicValues() {
        return [this.equation, this.xMin, this.xMax, this.yMin, this.yMax];
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
     * @returns {Function} Compiled function f(x, y) => z
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
     * Create a Plot3DCommand from this expression
     * @param {Object} options - Command options {strokeWidth, color, wireframe, etc.}
     * @returns {Plot3DCommand}
     */
    toCommand(options = {}) {
        return new Plot3DCommand(
            this.graphExpression,
            this.compiledFunction,
            { xMin: this.xMin, xMax: this.xMax },
            { yMin: this.yMin, yMax: this.yMax },
            this.equation,
            options
        );
    }

    /**
     * 3D plots can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }
}
