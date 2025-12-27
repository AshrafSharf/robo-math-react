/**
 * MarrowCommand - Draws a circle around TextItem and a curved arrow
 *
 * Creates:
 * - AnnotationCircleShape around TextItem
 * - CurvedArrowShape from circle edge outward
 *
 * Animation sequence: Circle draws, then arrow
 */
import { BaseCommand } from './BaseCommand.js';
import { AnnotationCircleShape } from '../../script-shapes/annotation-circle-shape.js';
import { CurvedArrowShape } from '../../script-shapes/curved-arrow-shape.js';
import { CurvedArrowPathGenerator } from '../../path-generators/curved-arrow-path-generator.js';
import { RoboEventManager } from '../../events/robo-event-manager.js';

export class MarrowCommand extends BaseCommand {
    constructor(options = {}, styleOptions = {}) {
        super();
        this.options = options;
        this.circleShape = null;
        this.arrowShape = null;
        // Apply color from style options
        if (styleOptions.color) {
            this.setColor(styleOptions.color);
        }
        if (styleOptions.strokeWidth) {
            this.strokeWidth = styleOptions.strokeWidth;
        }
    }

    async doInit() {
        // Get TextItem from registry
        const textItemOrCollection = this.commandContext.shapeRegistry[this.options.textItemVariableName];

        if (!textItemOrCollection) {
            console.warn(`MarrowCommand: "${this.options.textItemVariableName}" not found in registry`);
            return;
        }

        // Handle TextItemCollection (get first item) or single TextItem
        const textItem = textItemOrCollection.get ? textItemOrCollection.get(0) : textItemOrCollection;

        if (!textItem) {
            console.warn('MarrowCommand: No TextItem found');
            return;
        }

        // Get annotation layer from commandContext
        const annotationLayer = this.commandContext.annotationLayer;

        if (!annotationLayer) {
            console.warn('MarrowCommand: No annotation layer available');
            return;
        }

        // Get canvas bounds for positioning
        const bounds = textItem.getCanvasBounds();
        if (!bounds) {
            console.warn('MarrowCommand: Could not get TextItem bounds');
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

        this.commandResult = { circleShape: this.circleShape, arrowShape: this.arrowShape };
    }

    async playSingle() {
        // Reset all to hidden state upfront
        if (this.circleShape) {
            this.circleShape.hide();
        }
        if (this.arrowShape) {
            this.arrowShape.hide();
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
        this.commandResult = null;
        this.isInitialized = false;
    }
}
