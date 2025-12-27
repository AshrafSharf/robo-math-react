/**
 * KatexTextItemCollection - Container for multiple KatexTextItem instances
 *
 * Created by select() when source is a print expression.
 * Mirrors the TextItemCollection interface for KaTeX.
 */
export class KatexTextItemCollection {
  /**
   * @param {Array<KatexTextItem>} items - Initial items (optional)
   */
  constructor(items = []) {
    this.items = items;
  }

  /**
   * Add a KatexTextItem to the collection
   * @param {KatexTextItem} item
   */
  add(item) {
    this.items.push(item);
  }

  /**
   * Get a KatexTextItem by index
   * @param {number} index
   * @returns {KatexTextItem}
   */
  get(index) {
    return this.items[index];
  }

  /**
   * Get all KatexTextItems
   * @returns {Array<KatexTextItem>}
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
   * Get the parent KatexComponent (all items share same parent)
   * @returns {KatexComponent|null}
   */
  getKatexComponent() {
    return this.items.length > 0 ? this.items[0].katexComponent : null;
  }

  /**
   * Get the parent component (compatibility with TextItemCollection interface)
   * @returns {KatexComponent|null}
   */
  getMathComponent() {
    return this.getKatexComponent();
  }

  /**
   * Check if collection is empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.items.length === 0;
  }
}

export default KatexTextItemCollection;
