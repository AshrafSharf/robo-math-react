/**
 * QuotedStringExpression - represents a quoted string literal
 *
 * Handles AST nodes from parser: { name: "quotedstring", value: "..." }
 * Used for string arguments in expressions like label(G, "x^2", 0, 0)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';

export class QuotedStringExpression extends AbstractNonArithmeticExpression {
    static NAME = 'quotedstring';

    constructor(stringValue) {
        super();
        this.stringValue = stringValue;
    }

    resolve(context) {
        // No resolution needed - just holds the string value
    }

    getName() {
        return QuotedStringExpression.NAME;
    }

    /**
     * Get the string value
     * @returns {string}
     */
    getStringValue() {
        return this.stringValue;
    }

    /**
     * Quoted strings don't have numeric atomic values
     * @returns {Array}
     */
    getVariableAtomicValues() {
        return [];
    }

    /**
     * Quoted strings don't render on their own
     * @returns {boolean}
     */
    canPlay() {
        return false;
    }

    /**
     * No command for standalone quoted strings
     * @returns {null}
     */
    toCommand() {
        return null;
    }

    getFriendlyToStr() {
        return `"${this.stringValue}"`;
    }
}
