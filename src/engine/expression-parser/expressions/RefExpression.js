/**
 * RefExpression - Reference expression that executes content from Settings panel
 *
 * Usage: A = ref()
 * The actual expression content comes from the Settings panel's Ref tab.
 * This expression defers all work to RefCommand which parses and executes the content.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { RefCommand } from '../../commands/RefCommand.js';

export class RefExpression extends AbstractNonArithmeticExpression {
    static NAME = 'ref';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
    }

    /**
     * No-op: Resolution happens in RefCommand.doInit() with actual content
     */
    resolve(context) {
        // Intentionally empty - RefCommand handles resolution
    }

    getName() {
        return RefExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    /**
     * Create RefCommand with content from options
     * @param {Object} options - Options from ExpressionOptionsRegistry (includes content)
     * @returns {RefCommand}
     */
    toCommand(options = {}) {
        return new RefCommand(options.content || '', options);
    }

    canPlay() {
        return true;
    }
}
