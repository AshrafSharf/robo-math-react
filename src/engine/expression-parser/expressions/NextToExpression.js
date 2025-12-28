/**
 * NextToExpression - Position an item relative to another item's bounds
 *
 * Syntax: nextto(reference, position, dx?, dy?)
 *
 * Arguments:
 *   - reference: Variable reference to an existing item
 *   - position: Position shorthand (tl, tr, bl, br, mt, mb, ml, mr, c)
 *   - dx: Optional horizontal offset in pixels (default: 10)
 *   - dy: Optional vertical offset in pixels (default: 10)
 *
 * Returns: Logical coordinates {row, col} for positioning
 *
 * Note: This expression uses deferred evaluation because the referenced
 * item's bounds are only available after its command has been executed.
 * The actual position is computed in evaluate() which is called by
 * consuming commands at init time.
 *
 * Example:
 *   M = mtext(5, 3, "x^2")
 *   N = mtext(nextto(M, mr, 10, 0), "= y")  // Positioned to the right of M
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { CanvasBoundsAdapter, POSITION_MAP } from '../../../adapters/canvas-bounds-adapter.js';

export class NextToExpression extends AbstractNonArithmeticExpression {
    static NAME = 'nextto';

    // Marker to identify this as a position expression
    static isPositionExpression = true;

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;

        // Stored during resolve()
        this.referenceExpr = null;      // The variable reference expression
        this.referenceName = null;      // Variable name (e.g., 'M')
        this.position = 'mr';           // Position shorthand
        this.dx = 10;                   // Horizontal offset
        this.dy = 10;                   // Vertical offset

        // Computed during evaluate() - deferred
        this.row = null;
        this.col = null;
        this.isEvaluated = false;
    }

    resolve(context) {
        // Need at least 2 args: reference, position
        if (this.subExpressions.length < 2) {
            this.dispatchError('nextto() requires at least 2 arguments: nextto(reference, position)');
        }

        // First arg: variable reference
        this.referenceExpr = this.subExpressions[0];
        this.referenceExpr.resolve(context);

        // Get the variable name for lookup in shapeRegistry
        if (this.referenceExpr.getName() === 'variable') {
            this.referenceName = this.referenceExpr.getVariableName();
        } else {
            // Could be a direct expression that has a label
            const resolvedExpr = this._getResolvedExpression(context, this.referenceExpr);
            if (resolvedExpr && resolvedExpr.getLabel) {
                this.referenceName = resolvedExpr.getLabel();
            }
        }

        if (!this.referenceName) {
            this.dispatchError('nextto() first argument must be a variable reference');
        }

        // Second arg: position (as variable name like mr, tl, etc.)
        const positionExpr = this.subExpressions[1];
        positionExpr.resolve(context);

        if (positionExpr.getName() === 'variable') {
            this.position = positionExpr.getVariableName();
        } else {
            // Could be a quoted string
            if (typeof positionExpr.getStringValue === 'function') {
                this.position = positionExpr.getStringValue();
            }
        }

        // Validate position
        if (!POSITION_MAP[this.position]) {
            this.dispatchError(
                `nextto() invalid position "${this.position}". ` +
                `Valid: tl, tr, bl, br, mt, mb, ml, mr, c`
            );
        }

        // Third arg: dx (optional)
        if (this.subExpressions.length >= 3) {
            const dxExpr = this.subExpressions[2];
            dxExpr.resolve(context);
            const dxValues = dxExpr.getVariableAtomicValues();
            if (dxValues.length > 0 && typeof dxValues[0] === 'number') {
                this.dx = dxValues[0];
            }
        }

        // Fourth arg: dy (optional)
        if (this.subExpressions.length >= 4) {
            const dyExpr = this.subExpressions[3];
            dyExpr.resolve(context);
            const dyValues = dyExpr.getVariableAtomicValues();
            if (dyValues.length > 0 && typeof dyValues[0] === 'number') {
                this.dy = dyValues[0];
            }
        }
    }

    /**
     * Evaluate and return canvas/pixel position.
     * Called by consuming commands at init time when shapeRegistry is available.
     * Returns raw canvas coordinates - the command converts to its coordinate system.
     *
     * @param {CommandContext} commandContext - Has shapeRegistry
     * @returns {{x: number, y: number}} Canvas/pixel coordinates
     */
    evaluate(commandContext) {
        const shapeRegistry = commandContext.shapeRegistry;

        if (!shapeRegistry) {
            throw new Error('nextto() requires commandContext with shapeRegistry');
        }

        // Look up the referenced item in shapeRegistry
        const item = shapeRegistry[this.referenceName];
        if (!item) {
            throw new Error(`nextto(): Referenced item "${this.referenceName}" not found in shapeRegistry`);
        }

        // Get bounds via adapter
        const adapter = CanvasBoundsAdapter.for(item);
        const bounds = adapter.getBounds();

        if (!bounds || bounds.isEmpty()) {
            throw new Error(`nextto(): Could not get bounds for "${this.referenceName}"`);
        }

        // Get position point from bounds
        const methodName = POSITION_MAP[this.position];
        const point = bounds[methodName];

        if (!point) {
            throw new Error(`nextto(): Could not get position "${this.position}" from bounds`);
        }

        // Apply offset and return canvas coordinates
        return {
            x: point.x + this.dx,
            y: point.y + this.dy
        };
    }

    getName() {
        return NextToExpression.NAME;
    }

    /**
     * Returns row and col if already evaluated.
     * Note: This may return empty if not yet evaluated (deferred).
     * Commands should use evaluate() instead.
     */
    getVariableAtomicValues() {
        if (this.isEvaluated) {
            return [this.row, this.col];
        }
        // Return empty - consuming expression should check for NextToExpression
        return [];
    }

    /**
     * Check if this is a position expression that requires deferred evaluation
     */
    isNextToExpression() {
        return true;
    }

    getReferenceName() {
        return this.referenceName;
    }

    getPosition() {
        return this.position;
    }

    getDx() {
        return this.dx;
    }

    getDy() {
        return this.dy;
    }

    toCommand() {
        // nextto doesn't create a command directly - it's used as an argument
        return null;
    }

    canPlay() {
        return false;
    }
}
