/**
 * SurroundCommand - Animates a rectangle around a TextItem
 *
 * Uses MathTextRectEffect internally.
 * Styling via inherited: this.color, this.strokeWidth, this.padding
 */
import { BaseCommand } from './BaseCommand.js';
import { MathTextRectEffect } from '../../effects/math-text-rect-effect.js';

export class SurroundCommand extends BaseCommand {
    constructor(options = {}, styleOptions = {}) {
        super();
        this.options = options;
        this.textItem = null;
        this.effect = null;
        this.padding = 5;  // Default padding
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
            console.warn(`SurroundCommand: "${this.options.textItemVariableName}" not found in registry`);
            return;
        }

        // Handle TextItemCollection (get first item) or single TextItem
        this.textItem = textItemOrCollection.get ? textItemOrCollection.get(0) : textItemOrCollection;

        if (!this.textItem) {
            console.warn('SurroundCommand: No TextItem found');
            return;
        }

        // Get annotation layer from commandContext
        const annotationLayer = this.commandContext.annotationLayer;

        if (!annotationLayer) {
            console.warn('SurroundCommand: No annotation layer available');
            return;
        }

        // Create effect - styling from command properties (set by settings system)
        this.effect = new MathTextRectEffect(this.textItem, annotationLayer, {
            stroke: this.color,
            strokeWidth: this.strokeWidth || 2,
            padding: this.padding
        });

        this.commandResult = this.effect;
    }

    async playSingle() {
        if (this.effect) {
            return this.effect.play();
        }
        return Promise.resolve();
    }

    doDirectPlay() {
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
        this.commandResult = null;
        this.isInitialized = false;
    }
}
