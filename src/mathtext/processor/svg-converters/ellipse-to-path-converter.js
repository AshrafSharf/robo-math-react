export function convertEllipsesToPath(cheerio$, strokeWidthInEx) {
  cheerio$('ellipse').each(function (i, elem) {
    const existingAttrs = cheerio$(this).attr();
    let attributeMap = {};
    Object.keys(existingAttrs).forEach((attname) => {
      attributeMap[attname] = existingAttrs[attname];
    });

    const cx = parseFloat(attributeMap['cx']) || 0;
    const cy = parseFloat(attributeMap['cy']) || 0;
    const rx = parseFloat(attributeMap['rx']) || 0;
    const ry = parseFloat(attributeMap['ry']) || 0;

    if (rx === 0 || ry === 0) return;

    delete attributeMap['cx'];
    delete attributeMap['cy'];
    delete attributeMap['rx'];
    delete attributeMap['ry'];

    // Convert ellipse to path using two arc commands
    // Start at left point, arc to right point, arc back to left point
    const pathData = `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy}`;

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

export function convertCirclesToPath(cheerio$, strokeWidthInEx) {
  cheerio$('circle').each(function (i, elem) {
    const existingAttrs = cheerio$(this).attr();
    let attributeMap = {};
    Object.keys(existingAttrs).forEach((attname) => {
      attributeMap[attname] = existingAttrs[attname];
    });

    const cx = parseFloat(attributeMap['cx']) || 0;
    const cy = parseFloat(attributeMap['cy']) || 0;
    const r = parseFloat(attributeMap['r']) || 0;

    if (r === 0) return;

    delete attributeMap['cx'];
    delete attributeMap['cy'];
    delete attributeMap['r'];

    // Convert circle to path using two arc commands
    const pathData = `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy}`;

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
