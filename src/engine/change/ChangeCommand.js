/**
 * ChangeCommand - Animates value changes using strategy pattern
 *
 * Inherits dependency update logic from FromToCommand.
 * Uses strategy to update context with interpolated values.
 */
import { FromToCommand } from '../fromTo/FromToCommand.js';
import { TweenMax } from 'gsap';
import { ChangeResultCollection } from '../../geom/ChangeResultCollection.js';
import { ShapeVisibilityAdapter } from '../commands/visibility/ShapeVisibilityAdapter.js';

export class ChangeCommand extends FromToCommand {
    constructor(variableName, sourceExpr, fromValues, toValues, strategy,
                orderedDependents, context, hideOriginals = true, options = {}) {
        super(variableName, null, null, orderedDependents, context, options);
        this.sourceExpr = sourceExpr;
        this.fromValues = fromValues;
        this.toValues = toValues;
        this.strategy = strategy;
        this.hideOriginals = hideOriginals;
    }

    /**
     * Hide original shapes (source and dependents) using ShapeVisibilityAdapter
     */
    _hideOriginalShapes() {
        if (!this.hideOriginals) return;

        // Hide source shape
        const sourceShape = this.commandContext.shapeRegistry[this.variableName];
        if (sourceShape) {
            ShapeVisibilityAdapter.for(sourceShape).hide();
        }

        // Hide dependent shapes
        for (const { label } of this.orderedDependents) {
            if (label) {
                const shape = this.commandContext.shapeRegistry[label];
                if (shape) {
                    ShapeVisibilityAdapter.for(shape).hide();
                }
            }
        }
    }

    async doPlay() {
        // Hide original shapes at start of animation
        this._hideOriginalShapes();

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
                    this._updateShapeRegistry();
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
        this.commandsByLabel = new Map(); // Track commands by variable name

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
            this.commandsByLabel.set(this.variableName, newCmd);
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
                // Skip if expression doesn't produce a command (e.g., meq returns null)
                if (!newCmd) continue;

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
                if (label) {
                    this.commandsByLabel.set(label, newCmd);
                }
            }
        }
    }

    async directPlay() {
        // Hide original shapes
        this._hideOriginalShapes();

        // Instant update to final values
        this.strategy.updateContext(
            this.expressionContext,
            this.variableName,
            this.toValues,
            this.sourceExpr
        );
        await this._updateSourceAndDependents();
        this._buildResultCollection();
        this._updateShapeRegistry();
    }

    async playSingle() {
        // Hide originals on every replay (they may have been shown again)
        this._hideOriginalShapes();
        await this.doPlay();
        this._updateShapeRegistry();
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

    /**
     * Update shapeRegistry with new shapes under original labels
     * Called at end of doPlay, directPlay, playSingle
     */
    _updateShapeRegistry() {
        for (const [label, cmd] of this.commandsByLabel) {
            if (cmd && cmd.commandResult) {
                this.commandContext.shapeRegistry[label] = cmd.commandResult;
            }
        }
    }
}
