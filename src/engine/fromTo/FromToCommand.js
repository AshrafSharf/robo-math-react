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
                onUpdate: () => {
                    // Update variable to interpolated value
                    this.expressionContext.updateReference(
                        this.variableName,
                        new NumericExpression(animData.value)
                    );

                    // Clear and recreate dependent commands
                    this._updateDependentCommands();
                },
                onComplete: () => {
                    // Update variable to final value
                    this.expressionContext.updateReference(
                        this.variableName,
                        new NumericExpression(this.toValue)
                    );

                    // Final update
                    this._updateDependentCommands();

                    resolve();
                }
            });
        });
    }

    /**
     * Clear existing dependent commands and recreate with updated values
     */
    _updateDependentCommands() {
        console.log('🔄 _updateDependentCommands', {
            clearing: this.currentCommands.length,
            dependents: this.orderedDependents.length
        });

        // First: Clear previous frame's commands
        for (const cmd of this.currentCommands) {
            console.log('  🗑️ Clearing command:', cmd?.labelName);
            if (cmd && typeof cmd.clear === 'function') {
                cmd.clear();
            }
        }
        this.currentCommands = [];

        // Then: Resolve, create, and play new commands
        for (const { expr, label } of this.orderedDependents) {
            expr.resolve(this.expressionContext);
            const cmdExpr = this._getCommandableExpr(expr);
            if (cmdExpr && typeof cmdExpr.toCommand === 'function') {
                const newCmd = cmdExpr.toCommand(this.options);
                newCmd.diagram2d = this.diagram2d;
                newCmd.setCommandContext(this.commandContext);
                if (label) {
                    newCmd.setLabelName(label);
                }
                console.log('  ✨ Creating command:', label, {
                    diagram2d: !!newCmd.diagram2d,
                    commandContext: !!newCmd.commandContext
                });
                newCmd.directPlay();
                this.currentCommands.push(newCmd);
            } else {
                console.log('  ⚠️ No toCommand for:', label);
            }
        }

        console.log('🔄 _updateDependentCommands done, created:', this.currentCommands.length);
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

    directPlay() {
        console.log('🎯 FromTo.directPlay called', {
            variableName: this.variableName,
            toValue: this.toValue,
            diagram2d: !!this.diagram2d,
            commandContext: !!this.commandContext,
            orderedDependents: this.orderedDependents.length
        });

        // Update variable to final value
        this.expressionContext.updateReference(
            this.variableName,
            new NumericExpression(this.toValue)
        );

        // Clear previous and create new commands at final value
        this._updateDependentCommands();
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
