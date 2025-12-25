/**
 * ChangeResultCollection - Container for change() command results
 *
 * Each item contains:
 * - expression: The animated expression (for geometry type detection)
 * - commandResult: The rendered shape result
 * - label: The variable name (optional)
 *
 * Delegates geometry accessor methods to the underlying expression,
 * allowing item() to work with any shape type (2D, 3D, or scalar).
 */
export class ChangeResultCollection {
    /**
     * @param {Array} items - Array of {expression, commandResult, label}
     */
    constructor(items = []) {
        this.items = items;
    }

    /**
     * Add an item to the collection
     * @param {Object} expression - The animated expression
     * @param {Object} commandResult - The rendered shape
     * @param {string} label - Variable name (optional)
     */
    add(expression, commandResult, label = '') {
        this.items.push({ expression, commandResult, label });
    }

    /**
     * Get the commandResult at index (consistent with ShapeCollection)
     * @param {number} index
     * @returns {Object} The rendered shape
     */
    get(index) {
        return this.items[index].commandResult;
    }

    /**
     * Get all items
     * @returns {Array}
     */
    getAll() {
        return this.items;
    }

    /**
     * Get the number of items
     * @returns {number}
     */
    size() {
        return this.items.length;
    }

    /**
     * Get the number of items (JS convention)
     * @returns {number}
     */
    get length() {
        return this.items.length;
    }

    /**
     * Check if collection is empty
     * @returns {boolean}
     */
    isEmpty() {
        return this.items.length === 0;
    }

    /**
     * Get the expression at index (for ItemExpression delegation)
     * @param {number} index
     * @returns {Object}
     */
    getExpressionAt(index) {
        const item = this.items[index];
        return item ? item.expression : null;
    }

    /**
     * Get the command result at index
     * @param {number} index
     * @returns {Object}
     */
    getCommandResultAt(index) {
        const item = this.items[index];
        return item ? item.commandResult : null;
    }
}
