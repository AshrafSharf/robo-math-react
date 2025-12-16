/**
 * HideExpression - Hides one or more shapes instantly
 *
 * Syntax:
 *   hide(A)           - hide single shape
 *   hide(A, B, C)     - hide multiple shapes
 */
import { BaseVisibilityExpression } from './BaseVisibilityExpression.js';
import { HideCommand } from '../../../commands/visibility/HideCommand.js';

export class HideExpression extends BaseVisibilityExpression {
    static NAME = 'hide';

    getCommandClass() {
        return HideCommand;
    }

    canPlay() {
        return false;
    }
}
