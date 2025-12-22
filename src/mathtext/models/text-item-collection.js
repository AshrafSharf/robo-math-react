/**
 * TextItemCollection - Container for multiple TextItem instances
 *
 * Created by select/selectexcept expressions or MathTextComponent.getTextItems().
 * All items in a collection share the same parent MathTextComponent.
 *
 * Provides batch operations for cloning and managing cloned components.
 */
export class TextItemCollection {
    /**
     * @param {Array<TextItem>} items - Initial items (optional)
     */
    constructor(items = []) {
        this.items = items;
        this.clonedComponents = [];
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
     * Get the number of items (JS convention)
     * @returns {number}
     */
    get length() {
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

    // ===== BATCH CLONE OPERATIONS =====

    /**
     * Clone all TextItems to new positions with specified spacing
     * @param {HTMLElement} parentDOM - Parent DOM element for cloned components
     * @param {number} startX - Starting x pixel coordinate
     * @param {number} startY - Starting y pixel coordinate
     * @param {Object} options - Configuration options
     * @param {number} options.horizontalSpacing - Horizontal gap between clones (default: 20)
     * @param {number} options.verticalSpacing - Vertical gap between clones (default: 0)
     * @param {string} options.direction - 'horizontal' or 'vertical' (default: 'horizontal')
     * @returns {MathTextComponent[]} Array of created MathTextComponents
     */
    cloneAllTo(parentDOM, startX, startY, options = {}) {
        const {
            horizontalSpacing = 20,
            verticalSpacing = 0,
            direction = 'horizontal'
        } = options;

        const mathComponent = this.getMathComponent();
        if (!mathComponent) {
            console.warn('TextItemCollection.cloneAllTo: No mathComponent');
            return [];
        }

        const components = [];
        let currentX = startX;
        let currentY = startY;

        this.items.forEach((textItem) => {
            // Use mathComponent to clone (avoids circular dependency)
            const component = mathComponent.cloneTextItemTo(textItem, parentDOM, currentX, currentY);

            if (component) {
                components.push(component);
                this.clonedComponents.push(component);

                // Update position for next clone based on item bounds
                const bounds = textItem.getBounds();
                if (direction === 'horizontal') {
                    currentX += (bounds ? bounds.width : 50) + horizontalSpacing;
                } else {
                    currentY += (bounds ? bounds.height : 30) + verticalSpacing;
                }
            }
        });

        return components;
    }

    /**
     * Get all cloned components created by this collection
     * @returns {MathTextComponent[]} Array of cloned components
     */
    getClonedComponents() {
        return this.clonedComponents;
    }

    /**
     * Remove all cloned components from DOM
     */
    clearClones() {
        this.clonedComponents.forEach(component => {
            if (component.containerDOM && component.containerDOM.parentNode) {
                component.containerDOM.parentNode.removeChild(component.containerDOM);
            }
        });
        this.clonedComponents = [];
    }
}
