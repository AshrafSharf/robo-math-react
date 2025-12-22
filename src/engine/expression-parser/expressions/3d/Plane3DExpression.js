/**
 * Plane3D expression - represents a 3D plane
 *
 * Syntax options:
 *   plane3d(g, point, normal)       - point on plane + normal vector
 *   plane3d(g, p1, p2, p3)          - three points on the plane
 *   plane3d(g, a, b, c, d)          - equation coefficients ax + by + cz + d = 0 (numbers or variables)
 *   plane3d(g, v1, v2, point)       - two spanning vectors + point on plane
 *   plane3d(g, "x + 2y - z = 5")    - equation string (mathjs parsed, supports variables)
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Plane3DCommand } from '../../../commands/3d/Plane3DCommand.js';
import { plane3d_error_messages } from '../../core/ErrorMessages.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';
import { MathFunctionCompiler } from '../../utils/MathFunctionCompiler.js';
import { compile } from 'mathjs';

export class Plane3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'plane3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.center = { x: 0, y: 0, z: 0 };
        this.normal = { x: 0, y: 0, z: 1 };
        this.graphExpression = null;
        this.equationString = null;  // For dependency tracking
        this._context = null;        // Store context for dependency registration
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(plane3d_error_messages.MISSING_ARGS());
        }

        this._context = context;  // Store for dependency registration

        // First arg must be g3d graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g3d') {
            this.dispatchError(plane3d_error_messages.GRAPH_REQUIRED());
        }

        // Resolve remaining arguments
        const args = [];
        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            args.push(this._getResolvedExpression(context, this.subExpressions[i]));
        }

        // Detect syntax variant
        this._detectAndResolve(args, context);
    }

    _detectAndResolve(args, context) {
        // Check for string equation (first non-graph arg)
        if (args.length === 1 && typeof args[0].getStringValue === 'function') {
            const eqStr = args[0].getStringValue();
            this._fromEquationString(eqStr, context);
            return;
        }

        // Collect geometry types and atomic values
        const geomTypes = args.map(arg => {
            if (typeof arg.getGeometryType === 'function') {
                return arg.getGeometryType();
            }
            return 'numeric';
        });

        const numericArgs = args.filter(a => geomTypes[args.indexOf(a)] === 'numeric');

        // Case: 4 numbers → equation coefficients (a, b, c, d)
        if (args.length === 4 && geomTypes.every(t => t === 'numeric')) {
            const values = [];
            for (const arg of args) {
                const atomicVals = arg.getVariableAtomicValues();
                values.push(...atomicVals);
            }
            if (values.length === 4) {
                this._fromEquation(values[0], values[1], values[2], values[3]);
                return;
            }
        }

        // Case: point3d + vector3d → point + normal
        if (args.length === 2) {
            const t0 = geomTypes[0];
            const t1 = geomTypes[1];

            if (t0 === 'point3d' && t1 === 'vector3d') {
                this._fromPointAndNormal(args[0], args[1]);
                return;
            }
            if (t0 === 'vector3d' && t1 === 'point3d') {
                // normal, point (alternative order)
                this._fromPointAndNormal(args[1], args[0]);
                return;
            }
        }

        // Case: 3 point3d → three points
        if (args.length === 3 && geomTypes.every(t => t === 'point3d')) {
            this._fromThreePoints(args[0], args[1], args[2]);
            return;
        }

        // Case: vector3d, vector3d, point3d → two vectors + point
        if (args.length === 3) {
            const t0 = geomTypes[0];
            const t1 = geomTypes[1];
            const t2 = geomTypes[2];

            if (t0 === 'vector3d' && t1 === 'vector3d' && t2 === 'point3d') {
                this._fromTwoVectorsAndPoint(args[0], args[1], args[2]);
                return;
            }
        }

        // Case: 6 numbers → might be two points (x1,y1,z1, x2,y2,z2) - treat as line/plane?
        // For now, not supported - fall through to error

        this.dispatchError(plane3d_error_messages.INVALID_SYNTAX());
    }

    _fromEquationString(eqStr, context) {
        const trimmed = eqStr.trim();
        this.equationString = trimmed;

        // Math equation format: "x + 2y - z = 5" or "a*x + b*y + c*z = d"
        try {
            // Get current scope for variable resolution
            const scope = context.getReferencesCopyAsPrimitiveValues();
            const coeffs = this._parseEquationCoefficients(trimmed, scope);
            this._fromEquation(coeffs.a, coeffs.b, coeffs.c, coeffs.d);

            // Register dependencies for fromTo animation support
            MathFunctionCompiler.registerDependencies(trimmed, ['x', 'y', 'z'], context, this);
        } catch (e) {
            this.dispatchError(plane3d_error_messages.INVALID_EQUATION(eqStr));
        }
    }

    /**
     * Parse plane equation string using mathjs to extract coefficients
     * "x + 2y - z = 5" → { a: 1, b: 2, c: -1, d: -5 }
     * "a*x + b*y + c*z = d" → resolves a, b, c, d from scope
     * For ax + by + cz + d = 0 form
     */
    _parseEquationCoefficients(eqStr, scope = {}) {
        // Split on '='
        let lhs, rhs;
        if (eqStr.includes('=')) {
            [lhs, rhs] = eqStr.split('=').map(s => s.trim());
        } else {
            // Assume "... = 0" format
            lhs = eqStr;
            rhs = '0';
        }

        // Compile LHS and RHS
        const lhsCompiled = compile(lhs);
        const rhsCompiled = compile(rhs);

        // Evaluate at test points to extract coefficients (with scope for variables)
        const evalLHS = (x, y, z) => lhsCompiled.evaluate({ ...scope, x, y, z });
        const evalRHS = (x, y, z) => rhsCompiled.evaluate({ ...scope, x, y, z });

        // f(x,y,z) = LHS - RHS, we want ax + by + cz + d = 0
        const f = (x, y, z) => evalLHS(x, y, z) - evalRHS(x, y, z);

        // Extract coefficients using finite differences
        const d = f(0, 0, 0);                    // constant term
        const a = f(1, 0, 0) - d;                // coefficient of x
        const b = f(0, 1, 0) - d;                // coefficient of y
        const c = f(0, 0, 1) - d;                // coefficient of z

        return { a, b, c, d };
    }

    _fromEquation(a, b, c, d) {
        // Normal vector is (a, b, c)
        const normalLength = Math.sqrt(a * a + b * b + c * c);
        if (normalLength < 0.0001) {
            this.dispatchError(plane3d_error_messages.ZERO_NORMAL());
        }

        this.normal = { x: a, y: b, z: c };

        // Find a point on the plane: project origin onto plane
        // point = origin - ((a*0 + b*0 + c*0 + d) / (a² + b² + c²)) * normal
        const t = d / (a * a + b * b + c * c);
        this.center = {
            x: -t * a,
            y: -t * b,
            z: -t * c
        };
    }

    _fromPointAndNormal(pointExpr, vectorExpr) {
        // Get point coordinates
        const pt = pointExpr.getPoint();
        this.center = { x: pt.x, y: pt.y, z: pt.z };

        // Get normal from vector direction
        const vec = vectorExpr.asVector();
        const mag = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
        if (mag < 0.0001) {
            this.dispatchError(plane3d_error_messages.ZERO_NORMAL());
        }

        this.normal = { x: vec.x, y: vec.y, z: vec.z };
    }

    _fromThreePoints(p1Expr, p2Expr, p3Expr) {
        const p1 = p1Expr.getPoint();
        const p2 = p2Expr.getPoint();
        const p3 = p3Expr.getPoint();

        // Vectors from p1 to p2 and p1 to p3
        const v1 = {
            x: p2.x - p1.x,
            y: p2.y - p1.y,
            z: p2.z - p1.z
        };

        const v2 = {
            x: p3.x - p1.x,
            y: p3.y - p1.y,
            z: p3.z - p1.z
        };

        // Cross product v1 × v2 = normal
        const normal = {
            x: v1.y * v2.z - v1.z * v2.y,
            y: v1.z * v2.x - v1.x * v2.z,
            z: v1.x * v2.y - v1.y * v2.x
        };

        const normalLength = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
        if (normalLength < 0.0001) {
            this.dispatchError(plane3d_error_messages.COLLINEAR_POINTS());
        }

        this.normal = normal;

        // Center is centroid of three points
        this.center = {
            x: (p1.x + p2.x + p3.x) / 3,
            y: (p1.y + p2.y + p3.y) / 3,
            z: (p1.z + p2.z + p3.z) / 3
        };
    }

    _fromTwoVectorsAndPoint(v1Expr, v2Expr, pointExpr) {
        // Get spanning vectors
        const vec1 = v1Expr.asVector();
        const vec2 = v2Expr.asVector();

        // Cross product vec1 × vec2 = normal
        const normal = {
            x: vec1.y * vec2.z - vec1.z * vec2.y,
            y: vec1.z * vec2.x - vec1.x * vec2.z,
            z: vec1.x * vec2.y - vec1.y * vec2.x
        };

        const normalLength = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
        if (normalLength < 0.0001) {
            this.dispatchError(plane3d_error_messages.PARALLEL_VECTORS());
        }

        this.normal = normal;

        // Get point on plane
        const pt = pointExpr.getPoint();
        this.center = { x: pt.x, y: pt.y, z: pt.z };
    }

    getName() {
        return Plane3DExpression.NAME;
    }

    getGeometryType() {
        return 'plane3d';
    }

    getCenter() {
        return this.center;
    }

    getNormal() {
        return this.normal;
    }

    getVariableAtomicValues() {
        // Return center and normal as 6 values
        return [
            this.center.x, this.center.y, this.center.z,
            this.normal.x, this.normal.y, this.normal.z
        ];
    }

    getFriendlyToStr() {
        const c = this.center;
        const n = this.normal;
        return `Plane3D[center=(${c.x.toFixed(2)}, ${c.y.toFixed(2)}, ${c.z.toFixed(2)}), normal=(${n.x.toFixed(2)}, ${n.y.toFixed(2)}, ${n.z.toFixed(2)})]`;
    }

    toCommand(options = {}) {
        const defaults = ExpressionOptionsRegistry.get('plane3d');
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...(options.styleOptions || {})
            }
        };
        return new Plane3DCommand(
            this.graphExpression,
            { center: this.center, normal: this.normal },
            mergedOpts
        );
    }

    canPlay() {
        return true;
    }
}
