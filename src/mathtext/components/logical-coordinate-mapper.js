/**
 * LogicalCoordinateMapper
 * Converts between logical coordinate system and pixel coordinates
 * Useful for grid-based layouts where you want to work in logical units
 *
 * Example: Map a 8×16 logical grid to a 400×800 pixel container
 */
export class LogicalCoordinateMapper {
  /**
   * @param {number} pixelWidth - Width of container in pixels
   * @param {number} pixelHeight - Height of container in pixels
   * @param {number} logicalWidth - Width in logical units (e.g., 8)
   * @param {number} logicalHeight - Height in logical units (e.g., 16)
   */
  constructor(pixelWidth, pixelHeight, logicalWidth, logicalHeight) {
    this.pixelWidth = pixelWidth;
    this.pixelHeight = pixelHeight;
    this.logicalWidth = logicalWidth;
    this.logicalHeight = logicalHeight;

    // Calculate scale factors
    this.scaleX = pixelWidth / logicalWidth;
    this.scaleY = pixelHeight / logicalHeight;
  }

  /**
   * Convert logical X coordinate to pixel X
   * @param {number} logicalX - X coordinate in logical units
   * @returns {number} X coordinate in pixels
   */
  toPixelX(logicalX) {
    return logicalX * this.scaleX;
  }

  /**
   * Convert logical Y coordinate to pixel Y
   * @param {number} logicalY - Y coordinate in logical units
   * @returns {number} Y coordinate in pixels
   */
  toPixelY(logicalY) {
    return logicalY * this.scaleY;
  }

  /**
   * Convert logical coordinates to pixel coordinates
   * @param {number} logicalX - X coordinate in logical units
   * @param {number} logicalY - Y coordinate in logical units
   * @returns {Object} {x, y} in pixels
   */
  toPixel(logicalX, logicalY) {
    return {
      x: this.toPixelX(logicalX),
      y: this.toPixelY(logicalY)
    };
  }

  /**
   * Convert pixel X coordinate to logical X
   * @param {number} pixelX - X coordinate in pixels
   * @returns {number} X coordinate in logical units
   */
  toLogicalX(pixelX) {
    return pixelX / this.scaleX;
  }

  /**
   * Convert pixel Y coordinate to logical Y
   * @param {number} pixelY - Y coordinate in pixels
   * @returns {number} Y coordinate in logical units
   */
  toLogicalY(pixelY) {
    return pixelY / this.scaleY;
  }

  /**
   * Convert pixel coordinates to logical coordinates
   * @param {number} pixelX - X coordinate in pixels
   * @param {number} pixelY - Y coordinate in pixels
   * @returns {Object} {x, y} in logical units
   */
  toLogical(pixelX, pixelY) {
    return {
      x: this.toLogicalX(pixelX),
      y: this.toLogicalY(pixelY)
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
    this.scaleX = pixelWidth / this.logicalWidth;
    this.scaleY = pixelHeight / this.logicalHeight;
  }

  /**
   * Get the pixel size of one logical unit
   * @returns {Object} {width, height} in pixels per logical unit
   */
  getLogicalUnitSize() {
    return {
      width: this.scaleX,
      height: this.scaleY
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
      logicalWidth: this.logicalWidth,
      logicalHeight: this.logicalHeight,
      scaleX: this.scaleX,
      scaleY: this.scaleY
    };
  }
}
