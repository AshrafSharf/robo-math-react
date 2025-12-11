/**
 * TextSection - Represents a bbox-wrapped section of math text
 * Contains the bounds, SVG paths, and mpadded element for a \bbox[0px]{...} region
 */
export class TextSection {
  /**
   * @param {Bounds2} bounds - The bounding box of this section
   * @param {Element[]} paths - The SVG path elements in this section
   * @param {Element} mpaddedElement - The mpadded group element created by bbox
   */
  constructor(bounds, paths, mpaddedElement = null) {
    this.bounds = bounds;
    this.paths = paths;
    this.mpaddedElement = mpaddedElement;
  }
}
