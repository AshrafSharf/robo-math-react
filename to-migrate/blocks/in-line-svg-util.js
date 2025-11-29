export class InLineSvgUtil {
  static getSVGAncestor(node) {
    let svg = node;
    while (svg.nodeName.toLowerCase() !== 'svg') {
      svg = svg.parentNode;
      if (!svg) {
        break;
      }
    }
    return svg;
  }

  static inlineUseTag(svgDocument) {
    const uses = svgDocument.getElementsByTagName('use');
    let numberOfSvgUseElementsToBypass = 0;

    let index = 0;
    let svg;

    // while the index exists in the live <use> collection
    while (index < uses.length) {
      // get the current <use>
      const use = uses[index];

      // get the current <svg>
      const parent = use.parentNode;
      if (!svg) {
        svg = this.getSVGAncestor(parent);
      }
      const src = use.getAttribute('xlink:href') || use.getAttribute('href');
      let groupTag;
      if (svg && src) {
        // parse the src and get the url and id
        const srcSplit = src.split('#');
        const url = srcSplit.shift();
        const refId = srcSplit.join('#');

        const actualTag = svgDocument.getElementById(refId);
        let x = use.getAttribute('x');
        let y = use.getAttribute('y');
        const pathD = actualTag.getAttribute('d');

        groupTag = svgDocument.createElement('g');
        if (!x) {
          x = '0';
        }
        if (!y) {
          y = '0';
        }
        groupTag.setAttribute('transform', `translate(${x}),${y})`);
        const pathTag = svgDocument.createElement('path');
        pathTag.setAttribute('d', pathD);
        groupTag.addChild(pathTag);
        parent.replaceChild(groupTag, use);
        index++;
      }
    }
  }

  static screenToSVG(svgDoc, screenX, screenY, scaleFactor = 0.7) {
    const p = svgDoc.createSVGPoint();
    p.x = screenX;
    p.y = screenY;
    const matrix = svgDoc.getScreenCTM();
    const transformedPoint = p.matrixTransform(matrix.inverse());
    return transformedPoint;
  }

  static SVGToScreen(svgDoc, svgX, svgY) {
    const p = svgDoc.createSVGPoint();
    p.x = svgX;
    p.y = svgY;
    return p.matrixTransform(svgDoc.getScreenCTM());
  }
}