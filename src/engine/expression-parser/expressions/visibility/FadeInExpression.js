/**
 * FadeInExpression - Fades in one or more shapes with animation
 *
 * Syntax:
 *   fadein(A)           - fade in single shape
 *   fadein(A, B, C)     - fade in multiple shapes
 */
import { BaseVisibilityExpression } from './BaseVisibilityExpression.js';
import { FadeInCommand } from '../../../commands/visibility/FadeInCommand.js';

export class FadeInExpression extends BaseVisibilityExpression {
    static NAME = 'fadein';

    getCommandClass() {
        return FadeInCommand;
    }
}
