/**
 * RangeExpression - Axis range configuration
 *
 * Syntax: range(min, max), range(min, max, step), range(min, max, step, "scale")
 *
 * Scale types (as strings):
 *   - "linear" (default)
 *   - "trig"   - trigonometric scale with π labels
 *   - "log"    - logarithmic scale base 10
 *   - "ln"     - natural logarithmic scale (base e)
 *   - "im"     - imaginary scale with i labels (for complex plane y-axis)
 *
 * Example: range(-2*pi, 2*pi, pi/4, "trig")
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';

export class RangeExpression extends AbstractNonArithmeticExpression {
    static NAME = 'range';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.min = null;
        this.max = null;
        this.step = null;
        this.scale = 'linear';
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('range() requires at least min and max: range(-10, 10)');
        }

        // Resolve min
        const minExpr = this.subExpressions[0];
        minExpr.resolve(context);
        const minValues = minExpr.getVariableAtomicValues();
        if (minValues.length > 0 && typeof minValues[0] === 'number') {
            this.min = minValues[0];
        } else {
            this.dispatchError('range() min must be a number');
        }

        // Resolve max
        const maxExpr = this.subExpressions[1];
        maxExpr.resolve(context);
        const maxValues = maxExpr.getVariableAtomicValues();
        if (maxValues.length > 0 && typeof maxValues[0] === 'number') {
            this.max = maxValues[0];
        } else {
            this.dispatchError('range() max must be a number');
        }

        // Resolve step (optional)
        if (this.subExpressions.length >= 3) {
            const stepExpr = this.subExpressions[2];
            stepExpr.resolve(context);
            const stepValues = stepExpr.getVariableAtomicValues();
            if (stepValues.length > 0 && typeof stepValues[0] === 'number') {
                this.step = stepValues[0];
            }
        }

        // Resolve scale (optional) - as string: "trig", "log", "ln", "im"
        if (this.subExpressions.length >= 4) {
            const scaleExpr = this.subExpressions[3];
            scaleExpr.resolve(context);
            // String expressions have stringValue property or getStringValue() method
            if (scaleExpr.stringValue) {
                this.scale = scaleExpr.stringValue;
            } else if (typeof scaleExpr.getStringValue === 'function') {
                this.scale = scaleExpr.getStringValue();
            }
        }
    }

    getName() {
        return RangeExpression.NAME;
    }

    getMin() {
        return this.min;
    }

    getMax() {
        return this.max;
    }

    getStep() {
        return this.step;
    }

    getScale() {
        return this.scale;
    }

    getRange() {
        return [this.min, this.max];
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand() {
        return null;
    }

    canPlay() {
        return false;
    }
}
