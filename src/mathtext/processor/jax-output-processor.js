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

  /**
   * DEBUG: Log the structure of rect elements to discover MathJax v2's consistent patterns
   * Call this BEFORE rectToLinePathConverter to see the original structure
   * @param {CheerioStatic} cheerio$ - Cheerio instance with SVG
   */
  debugLogRectStructure(cheerio$) {
    console.log('\n========== MATHJAX SVG STRUCTURE DEBUG ==========\n');

    cheerio$('rect').each((i, elem) => {
      const rect = cheerio$(elem);
      const existingAttrs = rect.attr();

      console.log(`\n--- RECT #${i} ---`);
      console.log('Attributes:', JSON.stringify(existingAttrs, null, 2));

      // Walk up the parent chain to find structure markers
      let current = rect.parent();
      let depth = 0;
      const maxDepth = 8;

      while (current.length && depth < maxDepth) {
        const tagName = current.prop('tagName') || current.get(0)?.name;
        if (!tagName || tagName === 'html' || tagName === 'body') break;

        const parentAttrs = current.attr() || {};
        console.log(`Parent[${depth}] <${tagName}>:`, {
          'data-mml-node': parentAttrs['data-mml-node'],
          'data-c': parentAttrs['data-c'],
          'class': parentAttrs['class'],
          'meta': parentAttrs['meta'],
          'transform': parentAttrs['transform']?.substring(0, 50),
          'allAttrs': Object.keys(parentAttrs).join(', ')
        });

        current = current.parent();
        depth++;
      }

      // Log siblings to understand context
      const parent = rect.parent();
      const siblings = parent.children();
      console.log(`Siblings count: ${siblings.length}`);
      siblings.each((si, sib) => {
        const sibTag = cheerio$(sib).prop('tagName') || cheerio$(sib).get(0)?.name;
        const sibMeta = cheerio$(sib).attr('meta');
        const sibDataMml = cheerio$(sib).attr('data-mml-node');
        if (sibTag !== 'rect') {
          console.log(`  Sibling[${si}]: <${sibTag}> meta="${sibMeta}" data-mml-node="${sibDataMml}"`);
        }
      });
    });

    console.log('\n========== END DEBUG ==========\n');
  }

  /**
   * Process SVG with debug logging enabled
   * Use this instead of process() to see structure before conversion
   * @param {string} svgHtml - Raw SVG from MathJax
   * @param {number} strokeWidthInEx - Stroke width
   * @returns {string} Processed SVG
   */
  processWithDebug(svgHtml, strokeWidthInEx) {
    const cheerio$ = cheerio.load(svgHtml);

    // Log BEFORE conversion
    console.log('\n[DEBUG] Raw SVG from MathJax (before processing):');
    this.debugLogRectStructure(cheerio$);

    // Now do normal processing
    return this.process(svgHtml, strokeWidthInEx);
  }
}