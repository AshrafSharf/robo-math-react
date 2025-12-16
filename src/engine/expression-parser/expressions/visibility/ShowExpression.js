/**
 * ShowExpression - Shows one or more shapes instantly
 *
 * Syntax:
 *   show(A)           - show single shape
 *   show(A, B, C)     - show multiple shapes
 */
import { BaseVisibilityExpression } from './BaseVisibilityExpression.js';
import { ShowCommand } from '../../../commands/visibility/ShowCommand.js';

export class ShowExpression extends BaseVisibilityExpression {
    static NAME = 'show';

    getCommandClass() {
        return ShowCommand;
    }

    canPlay() {
        return false;
    }
}
