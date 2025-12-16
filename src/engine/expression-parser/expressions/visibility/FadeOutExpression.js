/**
 * FadeOutExpression - Fades out one or more shapes with animation
 *
 * Syntax:
 *   fadeout(A)           - fade out single shape
 *   fadeout(A, B, C)     - fade out multiple shapes
 */
import { BaseVisibilityExpression } from './BaseVisibilityExpression.js';
import { FadeOutCommand } from '../../../commands/visibility/FadeOutCommand.js';

export class FadeOutExpression extends BaseVisibilityExpression {
    static NAME = 'fadeout';

    getCommandClass() {
        return FadeOutCommand;
    }
}
