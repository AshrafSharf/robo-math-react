import { RevealElement } from '../core/reveal-element.js';
import { generateUniqueId } from '../utils/id-generator.js';

/**
 * TableBuilder - Simple table builder for presentations
 * Non-fluent API with direct access to cells for fragment callbacks
 */
export class TableBuilder extends RevealElement {
  constructor(rows, cols, config = {}) {
    super('table');
    this.rows = rows;
    this.cols = cols;
    this.cells = []; // 2D array of td elements (for initial setup only)
    this.cellIds = []; // 2D array of cell IDs for runtime lookups
    this.borderStyle = 'all';

    // Configurable styles with backward-compatible defaults
    this.config = {
      cellPadding: config.cellPadding || '8px 12px',
      fontSize: config.fontSize || '1em',
      mathWrapperMargin: config.mathWrapperMargin || '0.5em 0',
      textAlign: config.textAlign || 'left',
      verticalAlign: config.verticalAlign || 'middle',
      borderWidth: config.borderWidth || '1px',
      borderColor: config.borderColor || '#ddd',
      borderStyleType: config.borderStyleType || 'solid'
    };

    this.init();
  }

  init() {
    // Create table structure
    for (let r = 0; r < this.rows; r++) {
      const row = document.createElement('tr');
      this.cells[r] = [];
      this.cellIds[r] = [];
      
      for (let c = 0; c < this.cols; c++) {
        const cell = document.createElement('td');
        cell.style.padding = this.config.cellPadding;
        cell.style.textAlign = this.config.textAlign;
        cell.style.verticalAlign = this.config.verticalAlign;

        // Assign unique ID to each cell for targeting
        const cellId = generateUniqueId();
        cell.id = cellId;
        
        this.cells[r][c] = cell;
        this.cellIds[r][c] = cellId; // Store ID for runtime lookups
        row.appendChild(cell);
      }
      
      this.element.appendChild(row);
    }
    
    this.applyDefaultStyles();
  }

  applyDefaultStyles() {
    this.element.style.borderCollapse = 'collapse';
    this.element.style.width = '100%';
    this.element.style.fontSize = this.config.fontSize;
    this.setBorders(this.borderStyle);
  }

  // Get the raw DOM cell element for direct manipulation
  getCell(row, col) {
    if (!this.isValidCell(row, col)) return null;
    // Use ID lookup to get current DOM element (handles Reveal.js DOM recreation)
    return document.getElementById(this.cellIds[row][col]);
  }
  
  // Internal method to get cell by ID (used by all methods)
  getCellById(row, col) {
    if (!this.isValidCell(row, col)) return null;
    
    // First try to get from DOM (for after Reveal initialization)
    const domCell = document.getElementById(this.cellIds[row][col]);
    if (domCell) return domCell;
    
    // Fallback to stored reference (for initial setup before adding to DOM)
    return this.cells[row][col];
  }

  // Set text content in a cell
  setText(row, col, content) {
    if (!this.isValidCell(row, col)) return;
    const cell = this.getCellById(row, col);
    if (cell) cell.textContent = content;
  }

  // Set HTML content in a cell
  setHTML(row, col, htmlContent) {
    if (!this.isValidCell(row, col)) return;
    const cell = this.getCellById(row, col);
    if (cell) cell.innerHTML = htmlContent;
  }

  // Add a DOM element to a cell
  setElement(row, col, element) {
    if (!this.isValidCell(row, col)) return;
    const cell = this.getCellById(row, col);
    if (cell) {
      cell.innerHTML = '';
      cell.appendChild(element);
    }
  }

  // Set math content in a cell
  setMath(row, col, expression, style = {}) {
    if (!this.isValidCell(row, col)) return;
    
    const cell = this.getCellById(row, col);
    if (!cell) return;
    
    // Create math wrapper
    const wrapper = document.createElement('div');
    wrapper.style.textAlign = 'center';
    wrapper.style.margin = this.config.mathWrapperMargin;

    const mathDiv = document.createElement('div');
    mathDiv.id = generateUniqueId();
    mathDiv.classList.add('math-cell');
    
    // Apply custom styles
    Object.entries(style).forEach(([key, value]) => {
      mathDiv.style[key] = value;
    });
    
    mathDiv.textContent = `$${expression}$`;
    wrapper.appendChild(mathDiv);
    
    cell.innerHTML = '';
    cell.appendChild(wrapper);
  }

  // Set image in a cell
  setImage(row, col, src, config = {}) {
    if (!this.isValidCell(row, col)) return;
    
    const cell = this.getCellById(row, col);
    if (!cell) return;
    const img = document.createElement('img');
    
    // Use Reveal.js lazy loading
    img.setAttribute('data-src', src);
    
    if (config.alt) img.alt = config.alt;
    if (config.width) img.style.width = config.width;
    if (config.height) img.style.height = config.height;
    if (config.objectFit) img.style.objectFit = config.objectFit;
    
    cell.innerHTML = '';
    cell.appendChild(img);
  }

  // Add fragment to a cell
  addFragment(row, col, fragmentIndex, audioSrc = null) {
    if (!this.isValidCell(row, col)) return;
    
    const cell = this.getCellById(row, col);
    if (!cell) return;
    cell.classList.add('fragment');
    cell.setAttribute('data-fragment-index', fragmentIndex);
    
    if (audioSrc) {
      cell.setAttribute('data-audio-src', audioSrc);
    }
  }

  // Set cell style
  setCellStyle(row, col, styles) {
    if (!this.isValidCell(row, col)) return;
    
    const cell = this.getCellById(row, col);
    if (!cell) return;
    Object.assign(cell.style, styles);
  }
  
  // ============= ROW-LEVEL METHODS =============
  
  // Set style for an entire row
  setRowStyle(row, styles) {
    for (let col = 0; col < this.cols; col++) {
      this.setCellStyle(row, col, styles);
    }
  }
  
  // Clear style for an entire row
  clearRowStyle(row, styles = {}) {
    // Reset to empty values for specified style properties
    const resetStyles = {};
    Object.keys(styles).forEach(key => {
      resetStyles[key] = '';
    });
    this.setRowStyle(row, resetStyles);
  }
  
  // Add CSS class to entire row
  addRowMark(row, className) {
    for (let col = 0; col < this.cols; col++) {
      this.addMark(row, col, className);
    }
  }
  
  // Remove CSS class from entire row
  removeRowMark(row, className) {
    for (let col = 0; col < this.cols; col++) {
      this.removeMark(row, col, className);
    }
  }
  
  // Toggle CSS class on entire row
  toggleRowMark(row, className) {
    for (let col = 0; col < this.cols; col++) {
      this.toggleMark(row, col, className);
    }
  }
  
  // ============= END ROW-LEVEL METHODS =============

  // Set colspan for a cell
  setColspan(row, col, span) {
    if (!this.isValidCell(row, col)) return;
    
    const cell = this.getCellById(row, col);
    if (!cell) return;
    cell.colSpan = span;
    
    // Hide the cells that are being merged
    for (let i = 1; i < span && col + i < this.cols; i++) {
      const mergedCell = this.getCellById(row, col + i);
      if (mergedCell) mergedCell.style.display = 'none';
    }
  }

  // Set rowspan for a cell
  setRowspan(row, col, span) {
    if (!this.isValidCell(row, col)) return;
    
    const cell = this.getCellById(row, col);
    if (!cell) return;
    cell.rowSpan = span;
    
    // Hide the cells that are being merged
    for (let i = 1; i < span && row + i < this.rows; i++) {
      const mergedCell = this.getCellById(row + i, col);
      if (mergedCell) mergedCell.style.display = 'none';
    }
  }

  // Set border style for the table
  setBorders(style) {
    this.borderStyle = style;
    
    // Remove all borders first
    this.element.style.border = 'none';
    const allCells = this.element.querySelectorAll('td');
    allCells.forEach(cell => {
      cell.style.border = 'none';
    });
    
    const borderWidth = this.config.borderWidth;
    const borderColor = this.config.borderColor;
    const borderStyleType = this.config.borderStyleType;

    switch (style) {
      case 'all':
        allCells.forEach(cell => {
          cell.style.border = `${borderWidth} ${borderStyleType} ${borderColor}`;
        });
        break;

      case 'none':
        // Already cleared above
        break;

      case 'horizontal-only':
        allCells.forEach(cell => {
          cell.style.borderTop = `${borderWidth} ${borderStyleType} ${borderColor}`;
          cell.style.borderBottom = `${borderWidth} ${borderStyleType} ${borderColor}`;
        });
        break;

      case 'vertical-only':
        allCells.forEach(cell => {
          cell.style.borderLeft = `${borderWidth} ${borderStyleType} ${borderColor}`;
          cell.style.borderRight = `${borderWidth} ${borderStyleType} ${borderColor}`;
        });
        break;

      case 'outer-only':
        this.element.style.border = `${borderWidth} ${borderStyleType} ${borderColor}`;
        break;
    }
  }

  // Clear a cell
  clearCell(row, col) {
    if (!this.isValidCell(row, col)) return;
    const cell = this.getCellById(row, col);
    if (cell) cell.innerHTML = '';
  }

  // Add a CSS class mark to a cell
  addMark(row, col, className) {
    if (!this.isValidCell(row, col)) return;
    
    const cell = this.getCellById(row, col);
    if (cell) cell.classList.add(className);
  }

  // Remove a CSS class mark from a cell
  removeMark(row, col, className) {
    if (!this.isValidCell(row, col)) return;
    
    const cell = this.getCellById(row, col);
    if (cell) cell.classList.remove(className);
  }

  // Toggle a CSS class mark on a cell
  toggleMark(row, col, className) {
    if (!this.isValidCell(row, col)) return;
    
    const cell = this.getCellById(row, col);
    if (cell) cell.classList.toggle(className);
  }

  // Clear all CSS class marks from a cell (optionally specify which classes)
  clearMarks(row, col, classNames = []) {
    if (!this.isValidCell(row, col)) return;
    
    const cell = this.getCellById(row, col);
    if (!cell) return;
    
    if (classNames.length > 0) {
      // Remove specific classes
      classNames.forEach(className => {
        cell.classList.remove(className);
      });
    } else {
      // Remove all classes starting with 'reveal-' (our animation classes)
      const classes = Array.from(cell.classList);
      classes.forEach(className => {
        if (className.startsWith('reveal-')) {
          cell.classList.remove(className);
        }
      });
    }
  }

  // Animate cell with color transition
  animateColor(row, col, textColor, bgColor) {
    if (!this.isValidCell(row, col)) return;
    
    const cell = this.getCellById(row, col);
    if (!cell) return;
    
    // Store original values
    if (!cell.dataset.originalColor) {
      cell.dataset.originalColor = cell.style.color || '';
      cell.dataset.originalBg = cell.style.backgroundColor || '';
    }
    
    // Apply new colors
    if (textColor) cell.style.color = textColor;
    if (bgColor) cell.style.backgroundColor = bgColor;
  }

  // Reset color animation
  resetColor(row, col) {
    if (!this.isValidCell(row, col)) return;
    
    const cell = this.getCellById(row, col);
    if (!cell) return;
    
    if (cell.dataset.originalColor !== undefined) {
      cell.style.color = cell.dataset.originalColor;
      delete cell.dataset.originalColor;
    }
    if (cell.dataset.originalBg !== undefined) {
      cell.style.backgroundColor = cell.dataset.originalBg;
      delete cell.dataset.originalBg;
    }
  }

  // Apply gradient background to cell
  applyGradient(row, col, gradient, textColor = null) {
    if (!this.isValidCell(row, col)) return;
    
    const cell = this.getCellById(row, col);
    if (!cell) return;
    
    // Store original values
    if (!cell.dataset.originalGradient) {
      cell.dataset.originalGradient = cell.style.background || '';
      cell.dataset.originalTextColor = cell.style.color || '';
      cell.dataset.originalPadding = cell.style.padding || '';
      cell.dataset.originalRadius = cell.style.borderRadius || '';
    }
    
    // Apply gradient and styling
    cell.style.background = gradient;
    if (textColor) cell.style.color = textColor;
    cell.style.padding = '0.6em';
    cell.style.borderRadius = '8px';
  }

  // Remove gradient from cell
  removeGradient(row, col) {
    if (!this.isValidCell(row, col)) return;
    
    const cell = this.getCellById(row, col);
    if (!cell) return;
    
    if (cell.dataset.originalGradient !== undefined) {
      cell.style.background = cell.dataset.originalGradient;
      cell.style.color = cell.dataset.originalTextColor;
      cell.style.padding = cell.dataset.originalPadding;
      cell.style.borderRadius = cell.dataset.originalRadius;
      
      delete cell.dataset.originalGradient;
      delete cell.dataset.originalTextColor;
      delete cell.dataset.originalPadding;
      delete cell.dataset.originalRadius;
    }
  }

  // Apply effect to cell (glow, shadow, etc)
  applyEffect(row, col, effect, value) {
    if (!this.isValidCell(row, col)) return;
    
    const cell = this.getCellById(row, col);
    if (!cell) return;
    
    switch(effect) {
      case 'glow':
        cell.style.boxShadow = value || '0 0 10px rgba(76, 175, 80, 0.5)';
        break;
      case 'shadow':
        cell.style.boxShadow = value || '2px 2px 5px rgba(0,0,0,0.3)';
        break;
      case 'opacity':
        cell.style.opacity = value || '0.7';
        break;
      case 'scale':
        cell.style.transform = `scale(${value || 1.1})`;
        break;
      case 'strikethrough':
        cell.style.textDecoration = 'line-through';
        break;
    }
  }

  // Remove effect from cell
  removeEffect(row, col, effect) {
    if (!this.isValidCell(row, col)) return;
    
    const cell = this.getCellById(row, col);
    if (!cell) return;
    
    switch(effect) {
      case 'glow':
      case 'shadow':
        cell.style.boxShadow = '';
        break;
      case 'opacity':
        cell.style.opacity = '';
        break;
      case 'scale':
        cell.style.transform = '';
        break;
      case 'strikethrough':
        cell.style.textDecoration = '';
        break;
    }
  }

  // Store cell state for restoration
  storeCellState(row, col) {
    if (!this.isValidCell(row, col)) return;
    
    const cell = this.cells[row][col];
    cell.dataset.storedState = JSON.stringify({
      color: cell.style.color,
      backgroundColor: cell.style.backgroundColor,
      background: cell.style.background,
      padding: cell.style.padding,
      borderRadius: cell.style.borderRadius,
      boxShadow: cell.style.boxShadow,
      textDecoration: cell.style.textDecoration,
      opacity: cell.style.opacity,
      transform: cell.style.transform
    });
  }

  // Restore cell state
  restoreCellState(row, col) {
    if (!this.isValidCell(row, col)) return;
    
    const cell = this.cells[row][col];
    if (cell.dataset.storedState) {
      const state = JSON.parse(cell.dataset.storedState);
      Object.assign(cell.style, state);
      delete cell.dataset.storedState;
    }
  }

  // Helper to check if cell coordinates are valid
  isValidCell(row, col) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  // Get the table element
  getElement() {
    return this.element;
  }
}