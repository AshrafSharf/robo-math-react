import * as d3 from 'd3';
import { FontMapService } from '../services/font-map.service.js';
import cheerio from 'cheerio-standalone';

export class JaxOutputProcessor {

  process(svgHtml, strokeWidthInEx) {
    const cheerio$ = cheerio.load(svgHtml);
    const heightInEx = cheerio$('svg').attr('height');

    cheerio$('path').each(function (i, elem) {
      let metaPathValue = cheerio$(this).attr('meta');
      const pathValues = FontMapService.getInstance().getPathList(metaPathValue);
      if (!pathValues.length) {
        return;
      }
      const existingAttrs = cheerio$(this).attr();

      let attributeMap = {};
      Object.keys(existingAttrs).forEach((attname) => {
        attributeMap[attname] = existingAttrs[attname];
      });

      if (pathValues.length) {
        const parentGroup = cheerio('<g>');
        parentGroup.attr('meta', 'chargroup');
        pathValues.forEach((pathData) => {
          let childPath = cheerio('<path>');
          Object.keys(attributeMap).forEach((attname) => {
            const value = attributeMap[attname];
            childPath.attr(attname, value);
          });
          childPath.attr('d', pathData);
          let currentStrokeWidth = attributeMap['stroke-width'] ? parseInt(attributeMap['stroke-width']) : 1;
          childPath.attr('stroke-width', strokeWidthInEx);
          childPath.attr('fill', 'none');
          parentGroup.append(childPath);
        });
        cheerio$(this).replaceWith(parentGroup);
      }
    });

    this.rectToLinePathConverter(cheerio$, strokeWidthInEx);

    //return svgHtml;
    return cheerio$.root().html();
  }

  rectToLinePathConverter(cheerio$, strokeWidthInEx) {
    cheerio$('rect').each(function (i, elem) {
      let metaPathValue = cheerio$(this).attr('meta');
      const existingAttrs = cheerio$(this).attr();
      let attributeMap = {};
      Object.keys(existingAttrs).forEach((attname) => {
        attributeMap[attname] = existingAttrs[attname];
      });

      const x1 = parseInt(attributeMap['x']);
      const y1 = parseInt(attributeMap['y']);
      const x2 = x1 + parseInt(attributeMap['width']);
      const y2 = y1; // Ignore height

      delete attributeMap['x'];
      delete attributeMap['y'];
      delete attributeMap['width'];
      delete attributeMap['height'];

      var data = [];
      data.push([x1, y1]);
      data.push([x2, y2]);
      var lineGenerator = d3.line();
      var pathData = lineGenerator(data);

      let childPath = cheerio('<path>');
      Object.keys(attributeMap).forEach((attname) => {
        const value = attributeMap[attname];
        childPath.attr(attname, value);
      });
      childPath.attr('d', pathData);
      let currentStrokeWidth = attributeMap['stroke-width'] ? parseInt(attributeMap['stroke-width']) : 1;
      childPath.attr('stroke-width', strokeWidthInEx);
      childPath.attr('fill', 'none');
      cheerio$(this).replaceWith(childPath);
    });

    cheerio$('line').each(function (i, elem) {
      let metaPathValue = cheerio$(this).attr('meta');
      const existingAttrs = cheerio$(this).attr();
      let attributeMap = {};
      Object.keys(existingAttrs).forEach((attname) => {
        attributeMap[attname] = existingAttrs[attname];
      });

      const x1 = parseInt(attributeMap['x1']);
      const y1 = parseInt(attributeMap['y1']);
      const x2 = parseInt(attributeMap['x2']);
      const y2 = parseInt(attributeMap['y2']);

      delete attributeMap['x1'];
      delete attributeMap['y1'];
      delete attributeMap['x2'];
      delete attributeMap['y2'];

      var data = [];
      data.push([x1, y1]);
      data.push([x2, y2]);
      var lineGenerator = d3.line();
      var pathData = lineGenerator(data);

      let childPath = cheerio('<path>');
      Object.keys(attributeMap).forEach((attname) => {
        const value = attributeMap[attname];
        childPath.attr(attname, value);
      });
      childPath.attr('d', pathData);
      let currentStrokeWidth = attributeMap['stroke-width'] ? parseInt(attributeMap['stroke-width']) : 1;
      childPath.attr('stroke-width', strokeWidthInEx);
      childPath.attr('fill', 'none');
      cheerio$(this).replaceWith(childPath);
    });
  }
}