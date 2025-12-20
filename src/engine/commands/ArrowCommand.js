/**
 * ArrowCommand - Draws a circle around TextItem, curved arrow, and annotation text
 *
 * Creates:
 * - AnnotationCircleShape around TextItem
 * - CurvedArrowShape from circle to annotation
 * - AnnotationTextComponent for text at arrowhead
 *
 * Animation sequence: Circle draws, then arrow, then text
 */
import { BaseCommand } from './BaseCommand.js';
import { AnnotationCircleShape } from '../../script-shapes/annotation-circle-shape.js';
import { CurvedArrowShape } from '../../script-shapes/curved-arrow-shape.js';
import { CurvedArrowPathGenerator } from '../../path-generators/curved-arrow-path-generator.js';
import { AnnotationTextComponent } from '../../mathtext/components/annotation-text-component.js';
import { WriteEffect } from '../../mathtext/effects/write-effect.js';
import { RoboEventManager } from '../../events/robo-event-manager.js';

export class ArrowCommand extends BaseCommand {
    constructor(options = {}) {
        super();
        this.options = options;
        this.circleShape = null;
        this.arrowShape = null;
        this.textComponent = null;
    }

    async doInit() {
        // Get TextItem from registry
        const textItemOrCollection = this.commandContext.shapeRegistry[this.options.textItemVariableName];

        if (!textItemOrCollection) {
            console.warn(`ArrowCommand: "${this.options.textItemVariableName}" not found in registry`);
            return;
        }

        // Handle TextItemCollection (get first item) or single TextItem
        const textItem = textItemOrCollection.get ? textItemOrCollection.get(0) : textItemOrCollection;

        if (!textItem) {
            console.warn('ArrowCommand: No TextItem found');
            return;
        }

        // Get annotation layer from commandContext
        const annotationLayer = this.commandContext.annotationLayer;

        if (!annotationLayer) {
            console.warn('ArrowCommand: No annotation layer available');
            return;
        }

        // Get canvas bounds for positioning
        const bounds = textItem.getCanvasBounds();
        if (!bounds) {
            console.warn('ArrowCommand: Could not get TextItem bounds');
            return;
        }

        // Calculate start and end points
        const anchor = this.options.anchor || 'rm';
        const direction = this.options.direction || 'E';
        const length = this.options.length || 50;
        const offset = this.options.offset || 5;
        const curvature = this.options.curvature || 50;
        const circlePadding = 8;

        // Create the circle shape around TextItem
        this.circleShape = new AnnotationCircleShape(
            annotationLayer,
            bounds,
            {
                padding: circlePadding,
                stroke: this.color || '#333',
                strokeWidth: this.strokeWidth || 1.5
            }
        );
        this.circleShape.create();

        // Arrow starts from circle edge (bounds + padding + offset)
        const start = CurvedArrowPathGenerator.calculateStartPoint(bounds, anchor, direction, circlePadding + offset);
        const end = CurvedArrowPathGenerator.calculateEndPoint(start, direction, length);

        // Create the curved arrow shape on annotation layer
        this.arrowShape = new CurvedArrowShape(
            annotationLayer,
            start,
            end,
            curvature,
            {
                stroke: this.color || '#333',
                strokeWidth: this.strokeWidth || 2,
                headLength: 10,
                headAngle: Math.PI / 6
            }
        );
        this.arrowShape.create();

        // Create the text component at arrowhead
        if (this.options.text) {
            const textPosition = this._calculateTextPosition(end, direction);
            const textParentDOM = this.commandContext.canvasSection;

            this.textComponent = new AnnotationTextComponent(
                this._formatText(this.options.text),
                textPosition.x,
                textPosition.y,
                textParentDOM,
                {
                    fontSize: this.fontSize || 18,
                    stroke: this.color || '#333',
                    fill: this.color || '#333'
                }
            );
            // Text starts hidden
            this.textComponent.hide();
            this.textComponent.disableStroke();
        }

        this.commandResult = { circleShape: this.circleShape, arrowShape: this.arrowShape, textComponent: this.textComponent };
    }

    /**
     * Calculate text position based on arrow endpoint and direction
     */
    _calculateTextPosition(end, direction) {
        const buffer = 8;

        let x = end.x;
        let y = end.y;

        switch (direction.toUpperCase()) {
            case 'N':
                y -= buffer;
                break;
            case 'S':
                y += buffer;
                break;
            case 'E':
                x += buffer;
                break;
            case 'W':
                x -= buffer;
                break;
        }

        return { x, y };
    }

    /**
     * Format text - wrap in \text{} if plain text
     */
    _formatText(text) {
        const hasLatexChars = /[\\^_{}]/.test(text);
        if (hasLatexChars) {
            return text;
        }
        return `\\text{${text}}`;
    }

    async playSingle() {
        // Reset all to hidden state upfront
        if (this.circleShape) {
            this.circleShape.hide();
        }
        if (this.arrowShape) {
            this.arrowShape.hide();
        }
        if (this.textComponent) {
            this.textComponent.hide();
            this.textComponent.disableStroke();
        }

        // Phase 1: Animate the circle
        if (this.circleShape) {
            const startPoint = RoboEventManager.getLastVisitedPenPoint();
            await new Promise(resolve => {
                this.circleShape.renderWithAnimation(startPoint, resolve);
            });
        }

        // Phase 2: Animate the arrow
        if (this.arrowShape) {
            const startPoint = RoboEventManager.getLastVisitedPenPoint();
            await new Promise(resolve => {
                this.arrowShape.renderWithAnimation(startPoint, resolve);
            });
        }

        // Phase 3: Animate the text
        if (this.textComponent) {
            const textEffect = new WriteEffect(this.textComponent);
            await textEffect.play();
        }
    }

    doDirectPlay() {
        // Instant render circle
        if (this.circleShape) {
            this.circleShape.renderEndState();
        }

        // Instant render arrow
        if (this.arrowShape) {
            this.arrowShape.renderEndState();
        }

        // Instant render text
        if (this.textComponent) {
            this.textComponent.show();
            this.textComponent.enableStroke();
        }
    }

    getLabelPosition() {
        return { x: 0, y: 0 };
    }

    clear() {
        if (this.circleShape) {
            this.circleShape.remove();
            this.circleShape = null;
        }
        if (this.arrowShape) {
            this.arrowShape.remove();
            this.arrowShape = null;
        }
        if (this.textComponent && this.textComponent.containerDOM) {
            const containerDOM = this.textComponent.containerDOM;
            if (containerDOM.parentNode) {
                containerDOM.parentNode.removeChild(containerDOM);
            }
            this.textComponent = null;
        }
        this.commandResult = null;
        this.isInitialized = false;
    }
}
