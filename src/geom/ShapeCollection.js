/**
 * ShapeCollection - Container for multiple shape instances
 *
 * Created by multi-shape transform commands (translate, rotate, scale, etc.)
 * when operating on multiple shapes at once.
 *
 * Follows TextItemCollection pattern for consistency.
 */
export class ShapeCollection {
    /**
     * @param {Array} items - Initial shape items (optional)
     */
    constructor(items = []) {
        this.items = items;
    }

    /**
     * Add a shape to the collection
     * @param {Object} shape
     */
    add(shape) {
        this.items.push(shape);
    }

    /**
     * Get a shape by index
     * @param {number} index
     * @returns {Object}
     */
    get(index) {
        return this.items[index];
    }

    /**
     * Get all shapes
     * @returns {Array}
     */
    getAll() {
        return this.items;
    }

    /**
     * Get the number of shapes
     * @returns {number}
     */
    size() {
        return this.items.length;
    }

    /**
     * Get the number of shapes (JS convention)
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
}
