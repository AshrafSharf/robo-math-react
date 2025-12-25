/**
 * ChangeCommand - Animates value changes using strategy pattern
 *
 * Inherits dependency update logic from FromToCommand.
 * Uses strategy to update context with interpolated values.
 */
import { FromToCommand } from '../fromTo/FromToCommand.js';
import { TweenMax } from 'gsap';
import { ChangeResultCollection } from '../../geom/ChangeResultCollection.js';

export class ChangeCommand extends FromToCommand {
    constructor(variableName, sourceExpr, fromValues, toValues, strategy,
                orderedDependents, context, options = {}) {
        super(variableName, null, null, orderedDependents, context, options);
        this.sourceExpr = sourceExpr;
        this.fromValues = fromValues;
        this.toValues = toValues;
        this.strategy = strategy;
    }

    async doPlay() {
        // Create animation object with indexed values
        const animData = {};
        this.fromValues.forEach((v, i) => animData[i] = v);

        // Build target object
        const targetData = {};
        this.toValues.forEach((v, i) => targetData[i] = v);

        return new Promise(resolve => {
            TweenMax.to(animData, this.duration, {
                ...targetData,
                ease: 'Power2.easeInOut',
                onUpdate: async () => {
                    // Convert indexed object back to array
                    const values = [];
                    for (let i = 0; i < this.fromValues.length; i++) {
                        values.push(animData[i]);
                    }
                    // Update context via strategy
                    this.strategy.updateContext(
                        this.expressionContext,
                        this.variableName,
                        values,
                        this.sourceExpr
                    );
                    // Update source shape and dependent commands
                    await this._updateSourceAndDependents();
                },
                onComplete: async () => {
                    // Final update with exact target values
                    this.strategy.updateContext(
                        this.expressionContext,
                        this.variableName,
                        this.toValues,
                        this.sourceExpr
                    );
                    await this._updateSourceAndDependents();
                    this._buildResultCollection();
                    resolve();
                }
            });
        });
    }

    /**
     * Update the source shape and all dependents
     */
    async _updateSourceAndDependents() {
        // Clear previous frame's commands (source + dependents)
        for (const cmd of this.currentCommands) {
            if (cmd && typeof cmd.clear === 'function') {
                cmd.clear();
            }
        }
        this.currentCommands = [];

        // Get the updated source expression from context (without registering dependency)
        const savedCaller = this.expressionContext.getCaller();
        this.expressionContext.setCaller(null);
        const updatedSourceExpr = this.expressionContext.getReference(this.variableName);
        this.expressionContext.setCaller(savedCaller);

        // Create and render source shape command (for non-scalar types)
        if (updatedSourceExpr && typeof updatedSourceExpr.toCommand === 'function') {
            const newCmd = updatedSourceExpr.toCommand(this.options);
            newCmd.diagram2d = this.diagram2d;
            newCmd.setCommandContext(this.commandContext);

            await newCmd.init(this.commandContext);
            await newCmd.directPlay();
            this.currentCommands.push(newCmd);
        }

        // Create and render dependent commands
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
                // Don't set labelName on temporary animation commands
                // This prevents them from inheriting hide/show state

                if (originalCmd && originalCmd.color) {
                    newCmd.setColor(originalCmd.color);
                }

                await newCmd.init(this.commandContext);
                await newCmd.directPlay();
                this.currentCommands.push(newCmd);
            }
        }
    }

    async directPlay() {
        // Instant update to final values
        this.strategy.updateContext(
            this.expressionContext,
            this.variableName,
            this.toValues,
            this.sourceExpr
        );
        await this._updateSourceAndDependents();
        this._buildResultCollection();
    }

    async playSingle() {
        return this.doPlay();
    }

    /**
     * Build the result collection from final state commands
     */
    _buildResultCollection() {
        const collection = new ChangeResultCollection();

        // Add each command's result to collection
        for (const cmd of this.currentCommands) {
            collection.add(null, cmd.commandResult, '');
        }

        this.commandResult = collection;

        // Register in shapeRegistry (postInit already ran before commandResult was set)
        if (this.labelName) {
            this.commandContext.shapeRegistry[this.labelName] = this.commandResult;
        }
    }
}
