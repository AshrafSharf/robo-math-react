/**
 * UnderbraceCommand - Draws a curly brace below a TextItem
 *
 * Uses MathTextUnderbraceEffect to draw directly on annotation layer.
 */
import { BaseCommand } from './BaseCommand.js';
import { MathTextUnderbraceEffect } from '../../effects/math-text-underbrace-effect.js';

export class UnderbraceCommand extends BaseCommand {
    constructor(options = {}) {
        super();
        this.options = options;
        this.effect = null;
    }

    async doInit() {
        // Get textItem from registry
        const textItemOrCollection = this.commandContext.shapeRegistry[this.options.textItemVariableName];
        if (!textItemOrCollection) {
            console.warn(`UnderbraceCommand: "${this.options.textItemVariableName}" not found in registry`);
            return;
        }

        // Handle TextItemCollection (get first item) or single TextItem
        const textItem = textItemOrCollection.get ? textItemOrCollection.get(0) : textItemOrCollection;
        if (!textItem) {
            console.warn('UnderbraceCommand: No TextItem found');
            return;
        }

        // Get annotation layer from commandContext
        const annotationLayer = this.commandContext.annotationLayer;
        if (!annotationLayer) {
            console.warn('UnderbraceCommand: No annotation layer available');
            return;
        }

        // Create effect
        this.effect = new MathTextUnderbraceEffect(textItem, annotationLayer, {
            stroke: this.color,
            strokeWidth: this.strokeWidth || 2,
            buffer: this.options.buffer || 5
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
        this.commandResult = null;
        this.isInitialized = false;
    }
}
