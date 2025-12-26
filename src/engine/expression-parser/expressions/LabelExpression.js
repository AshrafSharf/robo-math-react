/**
 * LabelExpression - renders a MathTextComponent label on a grapher with pen animation
 *
 * Syntax options:
 *   label(graph, x, y, "latex string")     - using separate x and y coordinates
 *   label(graph, point, "latex string")    - using a point expression
 *
 * Template syntax for dynamic values:
 *   :varName        - simple variable substitution
 *   :{expr}         - mathjs expression (e.g., :{a+b}, :{sqrt(x)})
 *   :varName:.Nf    - with N decimal places
 *   :{expr}:.Nf     - expression with formatting
 *
 * Examples:
 *   label(G, 3.2, 4.2, "A")                // label at coordinates
 *   label(G, A, "x^2 + y^2 = r^2")         // label at point A
 *   label(G, 0, 3, "x = :a")               // dynamic label with variable
 *   label(G, P, "\frac{:a}{:b}")           // fraction with template values
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { LabelCommand } from '../../commands/LabelCommand.js';
import { label_error_messages } from '../core/ErrorMessages.js';
import { TemplateEvaluator } from '../../template/TemplateEvaluator.js';

export class LabelExpression extends AbstractNonArithmeticExpression {
    static NAME = 'label';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.graphExpression = null;
        this.latexString = '';
        this.position = { x: 0, y: 0 };
        // Template support
        this.templateString = null;  // Original template with placeholders
        this.isTemplate = false;     // Whether this label uses template syntax
        this.templateScope = {};     // Variable values for template evaluation
    }

    resolve(context) {
        // Need at least 3 args: graph, position (point or x,y), string
        if (this.subExpressions.length < 3) {
            this.dispatchError(label_error_messages.MISSING_ARGS());
        }

        // First arg must be graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError(label_error_messages.GRAPH_REQUIRED());
        }

        // Last arg must be a quoted string
        const lastIndex = this.subExpressions.length - 1;
        this.subExpressions[lastIndex].resolve(context);
        const stringExpression = this._getResolvedExpression(context, this.subExpressions[lastIndex]);

        if (!stringExpression || stringExpression.getName() !== 'quotedstring') {
            this.dispatchError(label_error_messages.STRING_REQUIRED());
        }

        const rawString = stringExpression.getStringValue();

        // Check if the string contains template placeholders
        if (TemplateEvaluator.hasPlaceholders(rawString)) {
            this.isTemplate = true;
            this.templateString = rawString;

            // Get variable names used in the template
            const varNames = TemplateEvaluator.getVariables(rawString);

            // Build scope from context
            this.templateScope = {};
            for (const varName of varNames) {
                const value = context.getReference(varName);
                if (value !== undefined && typeof value.getNumericValue === 'function') {
                    this.templateScope[varName] = value.getNumericValue();
                }
            }

            // Evaluate template to get the actual LaTeX string
            this.latexString = TemplateEvaluator.evaluate(rawString, this.templateScope);
        } else {
            this.latexString = rawString;
        }

        // Middle args (between graph and string): collect coordinates
        // - label(g, x, y, "text") - separate numeric values
        // - label(g, point, "text") - expression returning 2 values
        const coordinates = [];
        for (let i = 1; i < lastIndex; i++) {
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
        // Pass template info to command for dynamic updates
        const commandOptions = {
            ...options,
            isTemplate: this.isTemplate,
            templateString: this.templateString,
            templateScope: this.templateScope
        };
        return new LabelCommand(this.graphExpression, this.latexString, this.position, commandOptions);
    }

    /**
     * Labels can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }
}
