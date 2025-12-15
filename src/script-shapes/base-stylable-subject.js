import { Bounds2 } from "../geom/Bounds2.js";

export class BaseStylableSubject {
  static DEFAULT_STYLE_DEF = {
    fill: 'transparent',
    'stroke-width': 2,
    'stroke': 'blue',
    'stroke-opacity': 1,
    'fill-opacity': 1,
    'family': 'Helvetica',
    'size': 18,
    'anchor': 'middle',
    'color': 'green',
    'font-weight': 'bold'
  }

  constructor() {
    this.styleObj = {
      ...BaseStylableSubject.DEFAULT_STYLE_DEF
    };
  }

  applyStyle() {
  }

  setStyle(newStyleObj) {
    this.styleObj = Object.assign(this.styleObj, ...newStyleObj);
  }

  applyAnimatedStyle(newStyleObj, callback, duration) {

  }

  clearStyle() {

  }

  getScreenBounds() {
    return null;
  }



  ///// Start of Style Helper Methods //////

  stroke(stroke) {
    throw new Error('BaseStylableSubject does not have an implementation of "stroke"');
  }

  strokeWidth(width) {
    throw new Error('BaseStylableSubject does not have an implementation of "strokeWidth"');
  }

  color(value) {
    throw new Error('BaseStylableSubject does not have an implementation of "color"');
  }

  fill(value) {
    throw new Error('BaseStylableSubject does not have an implementation of "fill"');
  }

  fontSize(value) {
    throw new Error('BaseStylableSubject does not have an implementation of "fontSize"');
  }

  ///// End of Style Helper Methods //////
}