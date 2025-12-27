import { BaseTextItem } from '../models/base-text-item.js';

/**
 * KatexTextItem - Represents a single extracted part of a KatexComponent
 *
 * Created by select() when source is a print expression.
 * Extends BaseTextItem for compatibility with TextItem.
 */
export class KatexTextItem extends BaseTextItem {
  /**
   * @param {KatexComponent} katexComponent - Parent KatexComponent
   * @param {HTMLElement} element - The .robo-select DOM element
   * @param {string} pattern - The pattern that was matched
   */
  constructor(katexComponent, element, pattern) {
    super();
    this.katexComponent = katexComponent;
    this.element = element;
    this.pattern = pattern;
  }

  /**
   * Get the parent component
   * @returns {KatexComponent}
   */
  getMathComponent() {
    return this.katexComponent;
  }

  /**
   * Get the DOM element
   * @returns {HTMLElement}
   */
  getElement() {
    return this.element;
  }

  /**
   * Get the matched pattern
   * @returns {string}
   */
  getPattern() {
    return this.pattern;
  }

  /**
   * Get bounds relative to the katexComponent container (client coordinates)
   * @returns {{x: number, y: number, width: number, height: number}|null}
   */
  getClientBounds() {
    if (!this.element || !this.katexComponent.containerDOM) {
      return null;
    }

    const container = this.katexComponent.containerDOM;
    const elRect = this.element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return {
      x: elRect.left - containerRect.left,
      y: elRect.top - containerRect.top,
      width: elRect.width,
      height: elRect.height
    };
  }
}

export default KatexTextItem;
