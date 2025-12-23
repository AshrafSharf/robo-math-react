/**
 * Para3DExpression - represents a 3D parametric surface (u, v) → (x, y, z)
 * Syntax:
 *   para3d(graph, "xExpr", "yExpr", "zExpr", uMin, uMax, vMin, vMax)
 *   para3d(graph, xDef, yDef, zDef, uMin, uMax, vMin, vMax)
 *
 * All paths compile at resolve time (late binding).
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Para3DCommand } from '../../../commands/Para3DCommand.js';
import { FunctionDefinitionExpression } from '../FunctionDefinitionExpression.js';
import { MathFunctionCompiler } from '../../utils/MathFunctionCompiler.js';

export class Para3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'para3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.graphExpression = null;
        this.xEquation = '';
        this.yEquation = '';
        this.zEquation = '';
        this.uMin = 0;
        this.uMax = 2 * Math.PI;
        this.vMin = 0;
        this.vMax = Math.PI;
        this.scope = {};
        this.xFunctionDef = null;
        this.yFunctionDef = null;
        this.zFunctionDef = null;
        this.compiledXFunction = null;
        this.compiledYFunction = null;
        this.compiledZFunction = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 8) {
            this.dispatchError('para3d() requires 8 arguments: graph, xExpr, yExpr, zExpr, uMin, uMax, vMin, vMax');
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
            ['u', 'v'],
            context,
            this
        );

        // Resolve u and v ranges (args 4, 5, 6, 7)
        this.subExpressions[4].resolve(context);
        this.subExpressions[5].resolve(context);
        this.subExpressions[6].resolve(context);
        this.subExpressions[7].resolve(context);

        // Register dependencies for range variables (for change expression support)
        this._registerVariableDependency(this.subExpressions[4], context);
        this._registerVariableDependency(this.subExpressions[5], context);
        this._registerVariableDependency(this.subExpressions[6], context);
        this._registerVariableDependency(this.subExpressions[7], context);

        const uMinValues = this.subExpressions[4].getVariableAtomicValues();
        const uMaxValues = this.subExpressions[5].getVariableAtomicValues();
        const vMinValues = this.subExpressions[6].getVariableAtomicValues();
        const vMaxValues = this.subExpressions[7].getVariableAtomicValues();

        if (uMinValues.length > 0) this.uMin = uMinValues[0];
        if (uMaxValues.length > 0) this.uMax = uMaxValues[0];
        if (vMinValues.length > 0) this.vMin = vMinValues[0];
        if (vMaxValues.length > 0) this.vMax = vMaxValues[0];
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
                        // Note: para3d uses 2 params (u, v)
                        compiled: MathFunctionCompiler.compile(ref.getBodyString(), ['u', 'v'], this.scope)
                    };
                }
            }
        }

        // Fall back to string extraction
        const equation = this._extractEquationString(expr);
        return {
            equation,
            funcDef: null,
            compiled: equation ? MathFunctionCompiler.compile(equation, ['u', 'v'], this.scope) : null
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
        return Para3DExpression.NAME;
    }

    getGeometryType() {
        return 'para3d';
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

    getURange() {
        return { min: this.uMin, max: this.uMax };
    }

    getVRange() {
        return { min: this.vMin, max: this.vMax };
    }

    getVariableAtomicValues() {
        return [this.xEquation, this.yEquation, this.zEquation, this.uMin, this.uMax, this.vMin, this.vMax];
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
        return new Para3DCommand(
            this.graphExpression,
            this.compiledXFunction,
            this.compiledYFunction,
            this.compiledZFunction,
            { uMin: this.uMin, uMax: this.uMax },
            { vMin: this.vMin, vMax: this.vMax },
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
