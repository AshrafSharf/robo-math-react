/**
 * Curve3DExpression - represents a 3D parametric curve t → (x, y, z)
 * Syntax:
 *   curve3d(graph, "xExpr", "yExpr", "zExpr", tMin, tMax)
 *   curve3d(graph, xDef, yDef, zDef, tMin, tMax)
 *
 * All paths compile at resolve time (late binding).
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Curve3DCommand } from '../../../commands/Curve3DCommand.js';
import { FunctionDefinitionExpression } from '../FunctionDefinitionExpression.js';
import { MathFunctionCompiler } from '../../utils/MathFunctionCompiler.js';

export class Curve3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'curve3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.graphExpression = null;
        this.xEquation = '';
        this.yEquation = '';
        this.zEquation = '';
        this.tMin = 0;
        this.tMax = 2 * Math.PI;
        this.scope = {};
        this.xFunctionDef = null;
        this.yFunctionDef = null;
        this.zFunctionDef = null;
        this.compiledXFunction = null;
        this.compiledYFunction = null;
        this.compiledZFunction = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 6) {
            this.dispatchError('curve3d() requires 6 arguments: graph, xExpr, yExpr, zExpr, tMin, tMax');
        }

        // First arg is graph reference
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        // LATE BINDING: Get current scope at resolve time
        this.scope = context.getReferencesCopyAsPrimitiveValues();

        // Resolve x, y, z equations (args 1, 2, 3)
        this.subExpressions[1].resolve(context);
        const xResult = this._resolveEquationOrFuncDef(this.subExpressions[1], context);
        this.xEquation = xResult.equation;
        this.xFunctionDef = xResult.funcDef;
        this.compiledXFunction = xResult.compiled;

        this.subExpressions[2].resolve(context);
        const yResult = this._resolveEquationOrFuncDef(this.subExpressions[2], context);
        this.yEquation = yResult.equation;
        this.yFunctionDef = yResult.funcDef;
        this.compiledYFunction = yResult.compiled;

        this.subExpressions[3].resolve(context);
        const zResult = this._resolveEquationOrFuncDef(this.subExpressions[3], context);
        this.zEquation = zResult.equation;
        this.zFunctionDef = zResult.funcDef;
        this.compiledZFunction = zResult.compiled;

        // Register dependencies for fromTo support
        MathFunctionCompiler.registerDependencies(
            [this.xEquation, this.yEquation, this.zEquation],
            ['t'],
            context,
            this
        );

        // Resolve t range (args 4, 5)
        this.subExpressions[4].resolve(context);
        this.subExpressions[5].resolve(context);

        // Register dependencies for range variables (for change expression support)
        this._registerVariableDependency(this.subExpressions[4], context);
        this._registerVariableDependency(this.subExpressions[5], context);

        const tMinValues = this.subExpressions[4].getVariableAtomicValues();
        const tMaxValues = this.subExpressions[5].getVariableAtomicValues();

        if (tMinValues.length > 0) this.tMin = tMinValues[0];
        if (tMaxValues.length > 0) this.tMax = tMaxValues[0];
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
                        // Note: curve3d uses 1 param (t)
                        compiled: MathFunctionCompiler.compile(ref.getBodyString(), ['t'], this.scope)
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
     */
    _extractEquationString(expr) {
        if (typeof expr.getStringValue === 'function') {
            return expr.getStringValue();
        } else if (typeof expr.getEquation === 'function') {
            return expr.getEquation();
        } else if (typeof expr.getValue === 'function') {
            return expr.getValue();
        } else {
            const atomicValues = expr.getVariableAtomicValues();
            if (atomicValues.length > 0) {
                return String(atomicValues[0]);
            }
        }
        return '';
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
        return Curve3DExpression.NAME;
    }

    getGeometryType() {
        return 'curve3d';
    }

    getXEquation() {
        return this.xEquation;
    }

    getYEquation() {
        return this.yEquation;
    }

    getZEquation() {
        return this.zEquation;
    }

    getTRange() {
        return { min: this.tMin, max: this.tMax };
    }

    getVariableAtomicValues() {
        return [this.xEquation, this.yEquation, this.zEquation, this.tMin, this.tMax];
    }

    getScope() {
        return this.scope;
    }

    getCompiledXFunction() {
        return this.compiledXFunction;
    }

    getCompiledYFunction() {
        return this.compiledYFunction;
    }

    getCompiledZFunction() {
        return this.compiledZFunction;
    }

    toCommand(options = {}) {
        return new Curve3DCommand(
            this.graphExpression,
            this.compiledXFunction,
            this.compiledYFunction,
            this.compiledZFunction,
            { tMin: this.tMin, tMax: this.tMax },
            {
                xEquation: this.xEquation,
                yEquation: this.yEquation,
                zEquation: this.zEquation
            },
            options
        );
    }

    canPlay() {
        return true;
    }
}
