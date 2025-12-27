/**
 * KatexBoundsExtractor - Extract bounds from KaTeX HTML using class markers
 *
 * Finds elements marked with .robo-select class and extracts their bounds.
 * Used for selective display/animation of KaTeX-rendered math portions.
 */

export class KatexBoundsExtractor {
  static MARKER_CLASS = 'robo-select';

  /**
   * Find all elements with the marker class and get their bounds
   * @param {HTMLElement} containerDOM - The KaTeX container element
   * @returns {Array<{bounds: DOMRect, element: HTMLElement}>}
   */
  static extractMarkedBounds(containerDOM) {
    const markedElements = containerDOM.querySelectorAll(`.${this.MARKER_CLASS}`);
    return Array.from(markedElements).map(el => ({
      bounds: el.getBoundingClientRect(),
      element: el
    }));
  }

  /**
   * Find all marked elements
   * @param {HTMLElement} containerDOM - The KaTeX container element
   * @returns {HTMLElement[]}
   */
  static getMarkedElements(containerDOM) {
    return Array.from(containerDOM.querySelectorAll(`.${this.MARKER_CLASS}`));
  }

  /**
   * Find all non-marked content elements (for printwithout)
   * This returns the container with marked elements hidden
   * @param {HTMLElement} containerDOM - The KaTeX container element
   * @returns {HTMLElement[]}
   */
  static getNonMarkedElements(containerDOM) {
    // Get all direct content elements that are not marked
    const allElements = containerDOM.querySelectorAll('.katex-html *');
    const markedElements = new Set(this.getMarkedElements(containerDOM));

    // Filter out marked elements and their children
    return Array.from(allElements).filter(el => {
      // Check if this element or any parent is marked
      let current = el;
      while (current && current !== containerDOM) {
        if (markedElements.has(current)) {
          return false;
        }
        current = current.parentElement;
      }
      return true;
    });
  }

  /**
   * Get bounds relative to container
   * @param {HTMLElement} element - Element to get bounds for
   * @param {HTMLElement} container - Container element
   * @returns {{left: number, top: number, width: number, height: number}}
   */
  static getRelativeBounds(element, container) {
    const elRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    return {
      left: elRect.left - containerRect.left,
      top: elRect.top - containerRect.top,
      width: elRect.width,
      height: elRect.height
    };
  }

  /**
   * Hide all marked elements
   * @param {HTMLElement} containerDOM - The KaTeX container element
   */
  static hideMarkedElements(containerDOM) {
    const marked = this.getMarkedElements(containerDOM);
    marked.forEach(el => {
      el.style.opacity = '0';
      el.style.visibility = 'hidden';
    });
  }

  /**
   * Show all marked elements
   * @param {HTMLElement} containerDOM - The KaTeX container element
   */
  static showMarkedElements(containerDOM) {
    const marked = this.getMarkedElements(containerDOM);
    marked.forEach(el => {
      el.style.opacity = '1';
      el.style.visibility = 'visible';
    });
  }

  /**
   * Hide all content except marked elements
   * @param {HTMLElement} containerDOM - The KaTeX container element
   */
  static hideNonMarkedContent(containerDOM) {
    // Get the katex-html element
    const katexHtml = containerDOM.querySelector('.katex-html');
    if (!katexHtml) return;

    // Hide the entire content first
    katexHtml.style.opacity = '0';

    // Then show only the marked elements
    const marked = this.getMarkedElements(containerDOM);
    marked.forEach(el => {
      el.style.opacity = '1';
    });
  }

  /**
   * Get the marker class name
   * @returns {string}
   */
  static getMarkerClass() {
    return this.MARKER_CLASS;
  }
}

export default KatexBoundsExtractor;
