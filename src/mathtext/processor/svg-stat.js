import $ from '../utils/dom-query.js';
import SVG from 'svg.js';

const svgFunc = SVG;

export class SvgStat {
  static dump(svgNode) {
    $('path', svgNode).each(function() {
      console.log(this.getBBox());
    });
  }
}