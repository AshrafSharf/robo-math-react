/**
 * Simple jQuery-like DOM query utility
 * Supports basic DOM operations without external dependencies
 */

class DOMQuery {
  constructor(elements) {
    // Store elements as array-like object
    this.elements = Array.isArray(elements) ? elements : [elements];
    this.length = this.elements.length;

    // Make it array-like (can access with [0], [1], etc.)
    this.elements.forEach((el, i) => {
      this[i] = el;
    });
  }

  /**
   * Get/Set CSS styles
   * @param {string|Object} prop - Property name or object of properties
   * @param {string} value - Value to set (if prop is string)
   */
  css(prop, value) {
    if (typeof prop === 'object') {
      // Set multiple properties: .css({ display: 'block', color: 'red' })
      this.elements.forEach(el => {
        Object.keys(prop).forEach(key => {
          el.style[key] = prop[key];
        });
      });
    } else if (value !== undefined) {
      // Set single property: .css('display', 'block')
      this.elements.forEach(el => {
        el.style[prop] = value;
      });
    } else {
      // Get property: .css('display')
      return this.elements[0] ? this.elements[0].style[prop] : undefined;
    }
    return this;
  }

  /**
   * Get/Set attributes
   * @param {string|Object} attr - Attribute name or object of attributes
   * @param {string} value - Value to set (if attr is string)
   */
  attr(attr, value) {
    if (typeof attr === 'object') {
      // Set multiple attributes: .attr({ id: 'foo', class: 'bar' })
      this.elements.forEach(el => {
        Object.keys(attr).forEach(key => {
          el.setAttribute(key, attr[key]);
        });
      });
    } else if (value !== undefined) {
      // Set single attribute: .attr('id', 'foo')
      this.elements.forEach(el => {
        el.setAttribute(attr, value);
      });
    } else {
      // Get attribute: .attr('id')
      return this.elements[0] ? this.elements[0].getAttribute(attr) : undefined;
    }
    return this;
  }

  /**
   * Get/Set innerHTML
   * @param {string} content - HTML content to set
   */
  html(content) {
    if (content !== undefined) {
      // Set innerHTML
      this.elements.forEach(el => {
        el.innerHTML = content;
      });
      return this;
    } else {
      // Get innerHTML
      return this.elements[0] ? this.elements[0].innerHTML : undefined;
    }
  }

  /**
   * Append element(s)
   * @param {Element|DOMQuery|string} content - Content to append
   */
  append(content) {
    this.elements.forEach(el => {
      if (typeof content === 'string') {
        el.insertAdjacentHTML('beforeend', content);
      } else if (content instanceof DOMQuery) {
        content.elements.forEach(child => el.appendChild(child));
      } else {
        el.appendChild(content);
      }
    });
    return this;
  }

  /**
   * Find descendants matching selector
   * @param {string} selector - CSS selector
   */
  find(selector) {
    const found = [];
    this.elements.forEach(el => {
      const matches = el.querySelectorAll(selector);
      found.push(...Array.from(matches));
    });
    return new DOMQuery(found);
  }

  /**
   * Iterate over elements
   * @param {Function} callback - Function to call for each element
   */
  each(callback) {
    this.elements.forEach((el, index) => {
      callback.call(el, index, el);
    });
    return this;
  }

  /**
   * Get element width
   */
  width() {
    if (this.elements[0]) {
      return this.elements[0].offsetWidth;
    }
    return 0;
  }

  /**
   * Get element height
   */
  height() {
    if (this.elements[0]) {
      return this.elements[0].offsetHeight;
    }
    return 0;
  }

  /**
   * Replace this element with another
   * @param {Element|DOMQuery} content - Content to replace with
   */
  replaceWith(content) {
    this.elements.forEach(el => {
      if (content instanceof DOMQuery) {
        content.elements.forEach(newEl => {
          el.parentNode.replaceChild(newEl, el);
        });
      } else {
        el.parentNode.replaceChild(content, el);
      }
    });
    return this;
  }
}

/**
 * jQuery-like $ function
 * @param {string|Element|DOMQuery} selector - CSS selector, element, or DOMQuery
 * @param {Element} context - Optional context element for scoped queries
 */
export function $(selector, context) {
  // Handle string selectors
  if (typeof selector === 'string') {
    // Create new element: $('<div>')
    if (selector.startsWith('<') && selector.endsWith('>')) {
      const tagName = selector.slice(1, -1);
      return new DOMQuery([document.createElement(tagName)]);
    }

    // Query selector: $('#id'), $('.class'), $('tag')
    const root = context || document;
    const elements = root.querySelectorAll(selector);
    return new DOMQuery(Array.from(elements));
  }

  // Handle DOM elements
  if (selector instanceof Element) {
    return new DOMQuery([selector]);
  }

  // Already a DOMQuery
  if (selector instanceof DOMQuery) {
    return selector;
  }

  // Empty DOMQuery
  return new DOMQuery([]);
}

export default $;
