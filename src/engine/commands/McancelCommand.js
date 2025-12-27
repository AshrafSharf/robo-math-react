/**
 * McancelCommand - Draws cancel strikethrough over TextItem(s)
 *
 * Uses MathTextCancelEffect to draw directly on annotation layer.
 * Supports directions: 'u' (up/cancel), 'd' (down/bcancel), 'x' (xcancel)
 * If the textItem is a collection, creates cancel for each item.
 */
import { BaseCommand } from './BaseCommand.js';
import { MathTextCancelEffect } from '../../effects/math-text-cancel-effect.js';

export class McancelCommand extends BaseCommand {
    constructor(options = {}) {
        super();
        this.options = options;
        this.effects = [];  // Array for collection support
    }

    async doInit() {
        const textItemOrCollection = this.commandContext.shapeRegistry[this.options.textItemVariableName];
        if (!textItemOrCollection) {
            console.warn(`McancelCommand: "${this.options.textItemVariableName}" not found in registry`);
            return;
        }

        // Get annotation layer from commandContext
        const annotationLayer = this.commandContext.annotationLayer;
        if (!annotationLayer) {
            console.warn('McancelCommand: No annotation layer available');
            return;
        }

        // Handle TextItemCollection or single TextItem
        const items = this._getItemsArray(textItemOrCollection);
        if (items.length === 0) {
            console.warn('McancelCommand: No TextItems found');
            return;
        }

        // Create cancel effect for each item
        for (const textItem of items) {
            const effect = new MathTextCancelEffect(textItem, annotationLayer, {
                direction: this.options.direction || 'd',
                stroke: this.color || 'red',
                strokeWidth: this.strokeWidth || 2
            });
            this.effects.push(effect);
        }

        this.commandResult = this.effects.length === 1
            ? this.effects[0]
            : this.effects;
    }

    /**
     * Get items as array (handles both single TextItem and TextItemCollection)
     */
    _getItemsArray(textItemOrCollection) {
        // TextItemCollection has get() and size() methods
        if (textItemOrCollection.get && textItemOrCollection.size) {
            // It's a collection - use getAll() for efficiency
            return textItemOrCollection.getAll ? textItemOrCollection.getAll() : [];
        }
        // Single TextItem
        return [textItemOrCollection];
    }

    async playSingle() {
        if (this.effects.length === 0) return;

        // Play all cancel effects
        return Promise.all(this.effects.map(e => e.play()));
    }

    doDirectPlay() {
        this.effects.forEach(effect => {
            effect.toEndState();
        });
    }

    getLabelPosition() {
        return { x: 0, y: 0 };
    }

    clear() {
        this.effects.forEach(effect => {
            effect.remove();
        });
        this.effects = [];
        this.commandResult = null;
        this.isInitialized = false;
    }
}
