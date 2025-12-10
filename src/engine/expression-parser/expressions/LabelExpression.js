/**
 * LabelExpression - renders a MathTextComponent label on a grapher with pen animation
 *
 * Syntax options:
 *   label(graph, "latex string", x, y)     - using separate x and y coordinates
 *   label(graph, "latex string", point)    - using a point expression
 *
 * Examples:
 *   label(G, "A", 3.2, 4.2)                // label at coordinates
 *   label(G, "x^2 + y^2 = r^2", A)         // label at point A
 *   label(G, "Origin", point(G, 0, 0))     // label at origin
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { LabelCommand } from '../../commands/LabelCommand.js';
import { label_error_messages } from '../core/ErrorMessages.js';

export class LabelExpression extends AbstractNonArithmeticExpression {
    static NAME = 'label';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.graphExpression = null;
        this.latexString = '';
        this.position = { x: 0, y: 0 };
    }

    resolve(context) {
        // Need at least 3 args: graph, string, and position (point or x,y)
        if (this.subExpressions.length < 3) {
            this.dispatchError(label_error_messages.MISSING_ARGS());
        }

        // First arg must be graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError(label_error_messages.GRAPH_REQUIRED());
        }

        // Second arg must be a quoted string
        this.subExpressions[1].resolve(context);
        const stringExpression = this._getResolvedExpression(context, this.subExpressions[1]);

        if (!stringExpression || stringExpression.getName() !== 'quotedstring') {
            this.dispatchError(label_error_messages.STRING_REQUIRED());
        }

        this.latexString = stringExpression.getStringValue();

        // Remaining args: collect coordinates
        // - label(g, "text", x, y) - separate numeric values
        // - label(g, "text", point) - expression returning 2 values
        const coordinates = [];
        for (let i = 2; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const resultExpression = this._getResolvedExpression(context, this.subExpressions[i]);
            const atomicValues = resultExpression.getVariableAtomicValues();

            for (let j = 0; j < atomicValues.length; j++) {
                coordinates.push(atomicValues[j]);
            }
        }

        if (coordinates.length !== 2) {
            this.dispatchError(label_error_messages.WRONG_COORD_COUNT(coordinates.length));
        }

        this.position = { x: coordinates[0], y: coordinates[1] };
    }

    getName() {
        return LabelExpression.NAME;
    }

    /**
     * Get the latex string
     * @returns {string}
     */
    getLatexString() {
        return this.latexString;
    }

    /**
     * Get the position
     * @returns {{x: number, y: number}}
     */
    getPosition() {
        return this.position;
    }

    /**
     * Labels don't have numeric atomic values
     * @returns {Array}
     */
    getVariableAtomicValues() {
        return [];
    }

    getFriendlyToStr() {
        return `label("${this.latexString}", ${this.position.x}, ${this.position.y})`;
    }

    /**
     * Create a LabelCommand from this expression
     * @param {Object} options - Command options
     * @returns {LabelCommand}
     */
    toCommand(options = {}) {
        return new LabelCommand(this.graphExpression, this.latexString, this.position, options);
    }

    /**
     * Labels can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }
}
