/**
 * Strategy Registry - maps expression types to their change strategies
 */
import { ScalarStrategy } from './ScalarStrategy.js';
import { PointStrategy } from './PointStrategy.js';
import { LineStrategy } from './LineStrategy.js';
import { VectorStrategy } from './VectorStrategy.js';

const strategies = {
    'number': new ScalarStrategy(),
    'point': new PointStrategy(),
    'point3d': new PointStrategy(),
    'line': new LineStrategy(),
    'line3d': new LineStrategy(),
    'vector': new VectorStrategy(),
    'vector3d': new VectorStrategy(),
};

export const strategyRegistry = {
    /**
     * Get the appropriate strategy for an expression type
     * @param {Expression} expr - Expression to get strategy for
     * @returns {ChangeStrategy} Strategy instance
     * @throws {Error} if no strategy exists for the type
     */
    getStrategy(expr) {
        const name = expr.getName();
        const strategy = strategies[name];
        if (!strategy) {
            throw new Error(`change() is not supported for type: ${name}`);
        }
        return strategy;
    }
};
