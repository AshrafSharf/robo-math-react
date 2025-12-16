/**
 * TextItemCollection - Container for multiple TextItem instances
 *
 * Created by subonly/subwithout expressions. All items in a collection
 * share the same parent MathTextComponent.
 */
export class TextItemCollection {
    /**
     * @param {Array<TextItem>} items - Initial items (optional)
     */
    constructor(items = []) {
        this.items = items;
    }

    /**
     * Add a TextItem to the collection
     * @param {TextItem} textItem
     */
    add(textItem) {
        this.items.push(textItem);
    }

    /**
     * Get a TextItem by index
     * @param {number} index
     * @returns {TextItem}
     */
    get(index) {
        return this.items[index];
    }

    /**
     * Get all TextItems
     * @returns {Array<TextItem>}
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
     * Get the parent MathTextComponent (all items share same parent)
     * @returns {MathTextComponent|null}
     */
    getMathComponent() {
        return this.items.length > 0 ? this.items[0].mathComponent : null;
    }

    /**
     * Check if collection is empty
     * @returns {boolean}
     */
    isEmpty() {
        return this.items.length === 0;
    }
}
