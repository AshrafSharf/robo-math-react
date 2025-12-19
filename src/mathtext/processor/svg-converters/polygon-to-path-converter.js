export function convertPolygonsToPath(cheerio$, strokeWidthInEx) {
  cheerio$('polygon').each(function (i, elem) {
    const existingAttrs = cheerio$(this).attr();
    let attributeMap = {};
    Object.keys(existingAttrs).forEach((attname) => {
      attributeMap[attname] = existingAttrs[attname];
    });

    const pointsStr = attributeMap['points'];
    if (!pointsStr) return;

    // Parse points "x1,y1 x2,y2 x3,y3 ..."
    const points = pointsStr.trim().split(/\s+/).map(pair => {
      const [x, y] = pair.split(',').map(Number);
      return [x, y];
    });

    if (points.length < 2) return;

    // Build path data: M x1,y1 L x2,y2 L x3,y3 ... Z
    let pathData = `M${points[0][0]},${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      pathData += ` L${points[i][0]},${points[i][1]}`;
    }
    pathData += ' Z';

    delete attributeMap['points'];

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
