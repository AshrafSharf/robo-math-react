/**
 * LogicalCoordinateMapper
 * Converts between logical coordinate system (row, col) and pixel coordinates
 * Useful for grid-based layouts where you want to work in logical units
 *
 * Convention: (row, col) ordering - like spreadsheets
 * - row maps to vertical (Y) position
 * - col maps to horizontal (X) position
 *
 * Example: Map a 200×8 logical grid (rows×cols) to a 5000×200 pixel container
 */
export class LogicalCoordinateMapper {
  /**
   * @param {number} pixelWidth - Width of container in pixels
   * @param {number} pixelHeight - Height of container in pixels
   * @param {number} logicalCols - Number of columns (horizontal units)
   * @param {number} logicalRows - Number of rows (vertical units)
   */
  constructor(pixelWidth, pixelHeight, logicalCols, logicalRows) {
    this.pixelWidth = pixelWidth;
    this.pixelHeight = pixelHeight;
    this.logicalCols = logicalCols;
    this.logicalRows = logicalRows;

    // Calculate scale factors (pixels per logical unit)
    this.scaleCol = pixelWidth / logicalCols;   // pixels per column
    this.scaleRow = pixelHeight / logicalRows;  // pixels per row
  }

  /**
   * Convert logical row to pixel Y
   * @param {number} row - Row coordinate in logical units
   * @returns {number} Y coordinate in pixels
   */
  toPixelY(row) {
    return row * this.scaleRow;
  }

  /**
   * Convert logical column to pixel X
   * @param {number} col - Column coordinate in logical units
   * @returns {number} X coordinate in pixels
   */
  toPixelX(col) {
    return col * this.scaleCol;
  }

  /**
   * Convert logical coordinates (row, col) to pixel coordinates
   * @param {number} row - Row coordinate in logical units
   * @param {number} col - Column coordinate in logical units
   * @returns {Object} {x, y} in pixels
   */
  toPixel(row, col) {
    return {
      x: this.toPixelX(col),
      y: this.toPixelY(row)
    };
  }

  /**
   * Convert pixel Y coordinate to logical row
   * @param {number} pixelY - Y coordinate in pixels
   * @returns {number} Row coordinate in logical units
   */
  toLogicalRow(pixelY) {
    return pixelY / this.scaleRow;
  }

  /**
   * Convert pixel X coordinate to logical column
   * @param {number} pixelX - X coordinate in pixels
   * @returns {number} Column coordinate in logical units
   */
  toLogicalCol(pixelX) {
    return pixelX / this.scaleCol;
  }

  /**
   * Convert pixel coordinates to logical coordinates
   * @param {number} pixelX - X coordinate in pixels
   * @param {number} pixelY - Y coordinate in pixels
   * @returns {Object} {row, col} in logical units
   */
  toLogical(pixelX, pixelY) {
    return {
      row: this.toLogicalRow(pixelY),
      col: this.toLogicalCol(pixelX)
    };
  }

  /**
   * Update pixel dimensions (e.g., when container is resized)
   * Recalculates scale factors
   * @param {number} pixelWidth - New width in pixels
   * @param {number} pixelHeight - New height in pixels
   */
  updateDimensions(pixelWidth, pixelHeight) {
    this.pixelWidth = pixelWidth;
    this.pixelHeight = pixelHeight;
    this.scaleCol = pixelWidth / this.logicalCols;
    this.scaleRow = pixelHeight / this.logicalRows;
  }

  /**
   * Get the pixel size of one logical unit
   * @returns {Object} {col, row} pixels per logical unit
   */
  getLogicalUnitSize() {
    return {
      col: this.scaleCol,
      row: this.scaleRow
    };
  }

  /**
   * Get the current mapping information
   * @returns {Object} Mapper configuration
   */
  getInfo() {
    return {
      pixelWidth: this.pixelWidth,
      pixelHeight: this.pixelHeight,
      logicalCols: this.logicalCols,
      logicalRows: this.logicalRows,
      scaleCol: this.scaleCol,
      scaleRow: this.scaleRow
    };
  }
}
