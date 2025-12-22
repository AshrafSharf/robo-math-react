/**
 * FromToCommand - Animates variable value changes with dependent shape updates
 *
 * Animation flow:
 * 1. Tween the variable value from fromValue to toValue
 * 2. On each frame: clear previous frame's commands, update value, resolve expressions, recreate and play commands
 * 3. Manages its own temporary commands independently (does not touch existing commandRegistry)
 */
import { BaseCommand } from '../commands/BaseCommand.js';
import { NumericExpression } from '../expression-parser/expressions/NumericExpression.js';
import { AssignmentExpression } from '../expression-parser/expressions/AssignmentExpression.js';
import { ExpressionOptionsRegistry } from '../expression-parser/core/ExpressionOptionsRegistry.js';
import { TweenMax } from 'gsap';

export class FromToCommand extends BaseCommand {
    constructor(variableName, fromValue, toValue, orderedDependents, context, options = {}) {
        super();
        this.variableName = variableName;
        this.fromValue = fromValue;
        this.toValue = toValue;
        this.orderedDependents = orderedDependents; // Array of {expr, label}
        this.expressionContext = context;
        this.options = options;
        this.duration = options.duration || 0.8;

        // Track current frame's commands for clearing on next frame
        this.currentCommands = [];
    }

    async doInit() {
        // No shape to create - fromTo manages other shapes
    }

    async doPlay() {
        const animData = { value: this.fromValue };

        return new Promise(resolve => {
            TweenMax.to(animData, this.duration, {
                value: this.toValue,
                ease: 'Power2.easeInOut',
                onUpdate: async () => {
                    // Update variable to interpolated value
                    this.expressionContext.updateReference(
                        this.variableName,
                        new NumericExpression(animData.value)
                    );

                    // Clear and recreate dependent commands
                    await this._updateDependentCommands();
                },
                onComplete: async () => {
                    // Update variable to final value
                    this.expressionContext.updateReference(
                        this.variableName,
                        new NumericExpression(this.toValue)
                    );

                    // Final update
                    await this._updateDependentCommands();

                    resolve();
                }
            });
        });
    }

    /**
     * Clear existing dependent commands and recreate with updated values
     */
    async _updateDependentCommands() {
        // Clear previous frame's commands
        for (const cmd of this.currentCommands) {
            if (cmd && typeof cmd.clear === 'function') {
                cmd.clear();
            }
        }
        this.currentCommands = [];

        // Resolve, create, and play new commands
        for (const { expr, label } of this.orderedDependents) {
            expr.resolve(this.expressionContext);
            const cmdExpr = this._getCommandableExpr(expr);
            if (cmdExpr && typeof cmdExpr.toCommand === 'function') {
                const originalCmd = label ? this.commandContext.commandRegistry[label] : null;
                const originalOptions = originalCmd ? this._extractOptions(originalCmd) : {};
                const mergedOptions = { ...originalOptions, ...this.options };

                const newCmd = cmdExpr.toCommand(mergedOptions);
                newCmd.diagram2d = this.diagram2d;
                newCmd.setCommandContext(this.commandContext);
                if (label) {
                    newCmd.setLabelName(label);
                }

                // Set color from original command (color is set via setColor, not options)
                if (originalCmd && originalCmd.color) {
                    newCmd.setColor(originalCmd.color);
                }

                await newCmd.init(this.commandContext);
                await newCmd.directPlay();
                this.currentCommands.push(newCmd);
            }
        }
    }

    /**
     * Get the commandable expression (RHS for assignments, or the expression itself)
     */
    _getCommandableExpr(expr) {
        if (expr instanceof AssignmentExpression) {
            return expr.getComparableExpression();
        }
        return expr;
    }

    /**
     * Extract styling options from original command and registry
     * @param {BaseCommand} cmd - Original command
     * @returns {Object} Options object with styling properties
     */
    _extractOptions(cmd) {
        const options = {};

        // First: Get options from registry (settings panel stores here)
        if (cmd.expressionId) {
            const rawOptions = ExpressionOptionsRegistry.getRawById(cmd.expressionId);
            this._copyStyleProps(rawOptions, options);
        }

        // Second: Override with values directly on command
        this._copyStyleProps(cmd, options);

        return options;
    }

    /**
     * Copy non-null style properties from source to target
     * @param {Object} source - Source object with style properties
     * @param {Object} target - Target options object to copy into
     */
    _copyStyleProps(source, target) {
        if (!source) return;

        const styleProps = ['color', 'strokeWidth', 'fillOpacity', 'strokeOpacity', 'radius', 'fill'];
        for (const prop of styleProps) {
            if (source[prop] != null) {
                target[prop] = source[prop];
            }
        }
    }

    async directPlay() {
        // Update variable to final value
        this.expressionContext.updateReference(
            this.variableName,
            new NumericExpression(this.toValue)
        );

        // Clear previous and create new commands at final value
        await this._updateDependentCommands();
    }

    /**
     * Override playSingle to animate the fromTo transition
     * @returns {Promise}
     */
    async playSingle() {
        return this.doPlay();
    }

    clear() {
        for (const cmd of this.currentCommands) {
            if (cmd && typeof cmd.clear === 'function') {
                cmd.clear();
            }
        }
        this.currentCommands = [];
        super.clear();
    }
}
