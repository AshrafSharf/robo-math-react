/**
 * CopyTextItemCommand - Copies a TextItem to a target position
 *
 * Original TextItem stays visible, a clone animates to the target position.
 *
 * Handles resolving target to canvas coordinates from:
 * - Point on a graph (view coords + grapher position)
 * - Another TextItem (canvas bounds)
 * - Logical coordinates (row, col via layoutMapper)
 *
 * Uses MathTextMoveEffect internally.
 */
import { BaseCommand } from './BaseCommand.js';
import { MathTextMoveEffect } from '../../effects/math-text-move-effect.js';
import { MathTextPositionUtil } from '../../mathtext/utils/math-text-position-util.js';

export class CopyTextItemCommand extends BaseCommand {
    constructor(textItemVariableName, targetType, targetData, graphExpression = null) {
        super();
        this.textItemVariableName = textItemVariableName;
        this.targetType = targetType;
        this.targetData = targetData;
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.textItem = null;
        this.effect = null;
        this.targetX = null;
        this.targetY = null;
    }

    async doInit() {
        // Resolve grapher if we have a graphExpression (for point targets)
        if (this.graphExpression) {
            if (typeof this.graphExpression.getGrapher !== 'function') {
                console.warn('CopyTextItemCommand: graphExpression has no getGrapher method', this.graphExpression);
                return;
            }
            this.graphContainer = this.graphExpression.getGrapher();
            if (!this.graphContainer) {
                console.warn('CopyTextItemCommand: Could not get grapher from graphExpression');
                return;
            }
        }

        // Get TextItem from registry
        const textItemOrCollection = this.commandContext.shapeRegistry[this.textItemVariableName];

        if (!textItemOrCollection) {
            console.warn(`CopyTextItemCommand: "${this.textItemVariableName}" not found in registry`);
            return;
        }

        // Handle TextItemCollection (get first item) or single TextItem
        this.textItem = textItemOrCollection.get ? textItemOrCollection.get(0) : textItemOrCollection;

        if (!this.textItem) {
            console.warn('CopyTextItemCommand: No TextItem found');
            return;
        }

        // Resolve target to canvas coordinates
        const targetCoords = this._resolveTargetCoordinates();
        if (!targetCoords) {
            console.warn('CopyTextItemCommand: Could not resolve target coordinates');
            return;
        }

        this.targetX = targetCoords.x;
        this.targetY = targetCoords.y;

        // Get parent DOM for the cloned component
        const parentDOM = this.commandContext.canvasSection;

        // Create effect (reuse MathTextMoveEffect - it just creates and animates a clone)
        this.effect = new MathTextMoveEffect(
            this.textItem,
            this.targetX,
            this.targetY,
            parentDOM,
            { duration: 0.8 }
        );

        this.commandResult = this.effect;
    }

    /**
     * Resolve target to canvas coordinates based on targetType
     * @returns {{x: number, y: number}|null}
     */
    _resolveTargetCoordinates() {
        switch (this.targetType) {
            case 'point':
                return this._resolvePointTarget();
            case 'textitem':
                return this._resolveTextItemTarget();
            case 'logical':
                return this._resolveLogicalTarget();
            default:
                console.warn(`CopyTextItemCommand: Unknown target type "${this.targetType}"`);
                return null;
        }
    }

    /**
     * Resolve point target to canvas coordinates
     * Uses point's view coordinates + grapher's canvas position
     * Handles both inline point expressions and point variables
     */
    _resolvePointTarget() {
        const { pointVariableName, pointExpression } = this.targetData;

        if (!this.graphContainer) {
            console.warn('CopyTextItemCommand: No graphContainer available');
            return null;
        }

        // Verify grapher has toViewX/toViewY methods
        if (typeof this.graphContainer.toViewX !== 'function' || typeof this.graphContainer.toViewY !== 'function') {
            console.warn('CopyTextItemCommand: graphContainer missing toViewX/toViewY methods', this.graphContainer);
            return null;
        }

        let modelPos;

        if (pointExpression) {
            // Inline point expression - get coordinates directly from expression
            modelPos = pointExpression.point;
        } else if (pointVariableName) {
            // Point variable - get from registry
            const pointShape = this.commandContext.shapeRegistry[pointVariableName];
            if (!pointShape) {
                console.warn(`CopyTextItemCommand: Point "${pointVariableName}" not found`);
                return null;
            }
            modelPos = pointShape.getPosition ? pointShape.getPosition() : pointShape.position;
        }

        if (!modelPos) {
            console.warn('CopyTextItemCommand: Could not get point position');
            return null;
        }

        // Convert to view coordinates using grapher's public API
        const viewX = this.graphContainer.toViewX(modelPos.x);
        const viewY = this.graphContainer.toViewY(modelPos.y);

        // Add grapher's canvas position
        const grapherPos = this.graphContainer.getPosition();

        return {
            x: grapherPos.left + viewX,
            y: grapherPos.top + viewY
        };
    }

    /**
     * Resolve TextItem target to canvas coordinates
     * Uses the target TextItem's canvas bounds
     */
    _resolveTextItemTarget() {
        const { targetTextItemVariableName } = this.targetData;

        // Get the target TextItem from registry
        const targetItemOrCollection = this.commandContext.shapeRegistry[targetTextItemVariableName];
        if (!targetItemOrCollection) {
            console.warn(`CopyTextItemCommand: Target "${targetTextItemVariableName}" not found`);
            return null;
        }

        // Handle TextItemCollection (get first item) or single TextItem
        const targetItem = targetItemOrCollection.get ? targetItemOrCollection.get(0) : targetItemOrCollection;
        if (!targetItem) {
            console.warn('CopyTextItemCommand: No target TextItem found');
            return null;
        }

        // Get canvas bounds of target TextItem
        const canvasBounds = targetItem.getCanvasBounds();
        if (!canvasBounds) {
            console.warn('CopyTextItemCommand: Could not get target TextItem bounds');
            return null;
        }

        // Return top-left corner of target bounds
        return MathTextPositionUtil.getTopLeft(canvasBounds);
    }

    /**
     * Resolve logical coordinates (row, col) to canvas coordinates
     * Uses layoutMapper from commandContext
     */
    _resolveLogicalTarget() {
        const { row, col } = this.targetData;

        const layoutMapper = this.commandContext.layoutMapper;
        if (!layoutMapper) {
            console.warn('CopyTextItemCommand: No layoutMapper available');
            return null;
        }

        // Convert logical (row, col) to pixel coordinates
        const pixelCoords = layoutMapper.toPixel(row, col);

        return {
            x: pixelCoords.x,
            y: pixelCoords.y
        };
    }

    async playSingle() {
        // Note: Unlike mmove, we do NOT hide the original - just animate the clone
        if (this.effect) {
            return this.effect.play();
        }
        return Promise.resolve();
    }

    doDirectPlay() {
        // Note: Unlike mmove, we do NOT hide the original - just show the clone at end position
        if (this.effect) {
            this.effect.toEndState();
        }
    }

    getLabelPosition() {
        return { x: 0, y: 0 };
    }

    clear() {
        if (this.effect) {
            this.effect.remove();
            this.effect = null;
        }
        this.textItem = null;
        this.targetX = null;
        this.targetY = null;
        this.commandResult = null;
        this.isInitialized = false;
    }
}
