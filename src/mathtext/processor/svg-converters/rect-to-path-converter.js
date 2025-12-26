import * as d3 from 'd3';

export function convertRectsToPath(cheerio$, strokeWidthInEx) {
  cheerio$('rect').each(function (i, elem) {
    let metaPathValue = cheerio$(this).attr('meta');
    const existingAttrs = cheerio$(this).attr();
    let attributeMap = {};
    Object.keys(existingAttrs).forEach((attname) => {
      attributeMap[attname] = existingAttrs[attname];
    });

    const x = parseFloat(attributeMap['x']) || 0;
    const y = parseFloat(attributeMap['y']) || 0;
    const width = parseFloat(attributeMap['width']) || 0;
    const height = parseFloat(attributeMap['height']) || 0;
    const rx = parseFloat(attributeMap['rx']) || 0;
    const ry = parseFloat(attributeMap['ry']) || rx; // ry defaults to rx if not specified

    delete attributeMap['x'];
    delete attributeMap['y'];
    delete attributeMap['width'];
    delete attributeMap['height'];
    delete attributeMap['rx'];
    delete attributeMap['ry'];

    let pathData;

    // Check if this is a rounded rect or a full rectangle (not just a line)
    if (rx > 0 || ry > 0) {
      // Rounded rectangle path
      const r = Math.min(rx, ry, width / 2, height / 2); // Clamp radius
      pathData = `M${x + r},${y} ` +
                 `L${x + width - r},${y} ` +
                 `A${r},${r} 0 0 1 ${x + width},${y + r} ` +
                 `L${x + width},${y + height - r} ` +
                 `A${r},${r} 0 0 1 ${x + width - r},${y + height} ` +
                 `L${x + r},${y + height} ` +
                 `A${r},${r} 0 0 1 ${x},${y + height - r} ` +
                 `L${x},${y + r} ` +
                 `A${r},${r} 0 0 1 ${x + r},${y}`;
    } else if (height > strokeWidthInEx) {
      // Full rectangle (height > stroke width) - draw all 4 sides
      pathData = `M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height} L${x},${y}`;
    } else {
      // Thin rect (fraction bar, rule, etc.) - just draw single horizontal line
      const centerY = y + height / 2;
      pathData = `M${x},${centerY} L${x + width},${centerY}`;
    }

    let childPath = cheerio$('<path>');
    Object.keys(attributeMap).forEach((attname) => {
      const value = attributeMap[attname];
      childPath.attr(attname, value);
    });
    childPath.attr('d', pathData);
    childPath.attr('stroke-width', strokeWidthInEx);
    childPath.attr('fill', 'none');
    cheerio$(this).replaceWith(childPath);
  });
}

export function convertLinesToPath(cheerio$, strokeWidthInEx) {
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

    let childPath = cheerio$('<path>');
    Object.keys(attributeMap).forEach((attname) => {
      const value = attributeMap[attname];
      childPath.attr(attname, value);
    });
    childPath.attr('d', pathData);
    childPath.attr('stroke-width', strokeWidthInEx);
    childPath.attr('fill', 'none');
    cheerio$(this).replaceWith(childPath);
  });
}
