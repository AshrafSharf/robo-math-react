/**
 * Chain3DExpression - positions vector B so its tail is at vector A's tip (tail-to-tip)
 *
 * Syntax:
 *   chain3d(vecA, vecB)       - place vecB's tail at vecA's tip
 *
 * Returns a copy of vecB positioned with its start at vecA's end.
 * Useful for vector addition visualization (tip-to-tail method).
 * Animates vecB sliding to the new position.
 *
 * Examples:
 *   g = g3d(0, 0, 20, 20)
 *   A = vector3d(g, 0, 0, 0, 3, 0, 0)   // horizontal vector
 *   B = vector3d(g, 0, 0, 0, 0, 2, 0)   // vertical vector
 *   chain3d(A, B)                       // B positioned at tip of A: (3,0,0) -> (3,2,0)
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Chain3DCommand } from '../../../commands/3d/Chain3DCommand.js';
import { ExpressionOptionsRegistry } from '../../core/ExpressionOptionsRegistry.js';

export class Chain3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'chain3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, z1, x2, y2, z2] - final position
        this.graphExpression = null;
        this.originalShapeVarName = null;  // Vector B's variable name
        this.vecBExpression = null;
        this.inputType = 'vector3d'; // 'vector3d' or 'line3d'

        // For animation
        this.vecBStart = null;
        this.vecBEnd = null;
        this.chainedStart = null;
        this.chainedEnd = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('chain3d() requires: chain3d(vecA, vecB)');
        }

        // Resolve all subexpressions
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg is vector A (target - where we want to attach B)
        const vecAExpr = this._getResolvedExpression(context, this.subExpressions[0]);
        const aType = vecAExpr.getGeometryType?.() || vecAExpr.getName();

        if (aType !== 'vector3d' && aType !== 'line3d') {
            this.dispatchError(`chain3d() requires vector3d or line3d as first argument, got: ${aType}`);
        }

        this.graphExpression = vecAExpr.graphExpression;

        const aCoords = vecAExpr.getVariableAtomicValues();
        const aEnd = { x: aCoords[3], y: aCoords[4], z: aCoords[5] };

        // Second arg is vector B (source - the one we're moving)
        this.vecBExpression = this._getResolvedExpression(context, this.subExpressions[1]);
        const bType = this.vecBExpression.getGeometryType?.() || this.vecBExpression.getName();

        if (bType !== 'vector3d' && bType !== 'line3d') {
            this.dispatchError(`chain3d() requires vector3d or line3d as second argument, got: ${bType}`);
        }

        this.inputType = bType;
        this.originalShapeVarName = this.subExpressions[1].variableName || this.vecBExpression.variableName;

        const bCoords = this.vecBExpression.getVariableAtomicValues();
        this.vecBStart = { x: bCoords[0], y: bCoords[1], z: bCoords[2] };
        this.vecBEnd = { x: bCoords[3], y: bCoords[4], z: bCoords[5] };

        // Vector B as displacement
        const bDisplacement = {
            x: this.vecBEnd.x - this.vecBStart.x,
            y: this.vecBEnd.y - this.vecBStart.y,
            z: this.vecBEnd.z - this.vecBStart.z
        };

        // Chained position: B's tail at A's tip
        this.chainedStart = { ...aEnd };
        this.chainedEnd = {
            x: aEnd.x + bDisplacement.x,
            y: aEnd.y + bDisplacement.y,
            z: aEnd.z + bDisplacement.z
        };

        this.coordinates = [
            this.chainedStart.x, this.chainedStart.y, this.chainedStart.z,
            this.chainedEnd.x, this.chainedEnd.y, this.chainedEnd.z
        ];
    }

    getName() {
        return Chain3DExpression.NAME;
    }

    getGeometryType() {
        return this.inputType;
    }

    getVariableAtomicValues() {
        return this.coordinates.slice();
    }

    getVectorPoints() {
        return [
            { x: this.coordinates[0], y: this.coordinates[1], z: this.coordinates[2] },
            { x: this.coordinates[3], y: this.coordinates[4], z: this.coordinates[5] }
        ];
    }

    getVector() {
        return {
            start: { x: this.coordinates[0], y: this.coordinates[1], z: this.coordinates[2] },
            end: { x: this.coordinates[3], y: this.coordinates[4], z: this.coordinates[5] }
        };
    }

    getLinePoints() {
        return this.getVectorPoints();
    }

    getLine() {
        return this.getVector();
    }

    getStartValue() {
        return [this.coordinates[0], this.coordinates[1], this.coordinates[2]];
    }

    getEndValue() {
        return [this.coordinates[3], this.coordinates[4], this.coordinates[5]];
    }

    getFriendlyToStr() {
        const pts = this.getVectorPoints();
        return `chain3d[(${pts[0].x.toFixed(2)}, ${pts[0].y.toFixed(2)}, ${pts[0].z.toFixed(2)}) -> (${pts[1].x.toFixed(2)}, ${pts[1].y.toFixed(2)}, ${pts[1].z.toFixed(2)})]`;
    }

    toCommand(options = {}) {
        const geomType = this.getGeometryType();
        const defaults = ExpressionOptionsRegistry.get(geomType);
        const mergedOpts = {
            styleOptions: {
                ...defaults.styleOptions,
                ...this.getStyleOptions(),
                ...(options.styleOptions || {})
            }
        };

        return new Chain3DCommand(
            this.vecBExpression,
            this.originalShapeVarName,
            this.vecBStart,
            this.vecBEnd,
            this.chainedStart,
            this.chainedEnd,
            this.inputType,
            mergedOpts
        );
    }

    canPlay() {
        return true;
    }
}
