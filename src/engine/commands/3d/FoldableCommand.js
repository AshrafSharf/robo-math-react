/**
 * FoldableCommand - Command for rendering foldable shapes (box nets, cube nets, etc.)
 */
import { Base3DCommand } from './Base3DCommand.js';
import { common_error_messages } from '../../expression-parser/core/ErrorMessages.js';

export class FoldableCommand extends Base3DCommand {
    /**
     * Create a foldable command
     * @param {Object} graphExpression - The graph expression
     * @param {string} type - Foldable type ("box", "rectbox", "cube")
     * @param {Array} params - Type-specific parameters
     * @param {Object} expression - Reference to FoldableExpression for callback
     * @param {Object} options - { styleOptions: { color, opacity, ... } }
     */
    constructor(graphExpression, type, params, expression, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.type = type;
        this.params = params;
        this.expression = expression;  // For setFoldableResult callback
        this.styleOptions = options.styleOptions || {};
        this.graphContainer = null;
        this.foldableResult = null;
    }

    async doInit() {
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('foldable'));
            err.expressionId = this.expressionId;
            throw err;
        }

        if (typeof this.graphExpression.getGrapher !== 'function') {
            const varName = this.graphExpression.variableName || 'first argument';
            const err = new Error(common_error_messages.INVALID_GRAPH_TYPE(varName));
            err.expressionId = this.expressionId;
            throw err;
        }

        this.graphContainer = this.graphExpression.getGrapher();
        if (!this.graphContainer) {
            const varName = this.graphExpression.variableName || 'graph';
            const err = new Error(common_error_messages.GRAPH_NOT_INITIALIZED(varName));
            err.expressionId = this.expressionId;
            throw err;
        }

        // Build style options
        const foldableOptions = {
            color: this.styleOptions.color,
            opacity: this.styleOptions.opacity || 0.8,
            showEdges: this.styleOptions.showEdges !== false,
            edgeColor: this.styleOptions.edgeColor || 0x000000
        };

        // Create foldable via diagram3d
        this.foldableResult = this.graphContainer.diagram3d.foldable(
            this.type,
            this.params,
            foldableOptions
        );

        // Store result for face() accessor
        this.commandResult = this.foldableResult.group;

        // Set foldable result on expression for accessor methods
        if (this.expression && typeof this.expression.setFoldableResult === 'function') {
            this.expression.setFoldableResult(this.foldableResult);
        }
    }

    /**
     * Fade in animation for foldable
     */
    async playSingle() {
        if (!this.commandResult) return;

        // Simple fade-in for all faces and base
        return new Promise((resolve) => {
            // For now, just resolve immediately (shapes appear instantly)
            // TODO: Add GSAP fade-in animation for each face
            resolve();
        });
    }

    /**
     * Get the foldable result
     */
    getFoldableResult() {
        return this.foldableResult;
    }

    /**
     * Clear foldable from scene
     */
    clear() {
        if (this.commandResult && this.graphContainer) {
            const scene = this.graphContainer.getScene();
            if (scene) {
                scene.remove(this.commandResult);
            }
            // Dispose all geometries and materials in the group
            this.commandResult.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            this.commandResult = null;
            this.foldableResult = null;
        }
        this.isInitialized = false;
    }
}
