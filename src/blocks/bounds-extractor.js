import { Bounds2 } from '../geom/Bounds2.js';

export class BoundsExtractor {
  static SEMI_COLON = "MJMAIN-3B";

  static metaCharacterMinCount = {
    [BoundsExtractor.SEMI_COLON]: 1
  };

  static extractFBoxBoundsDescriptors(svgDocument$) {
    const svgDocument = svgDocument$[0];
    const boundsList = [];

    const gTags = svgDocument.querySelectorAll('g');

    // Filter the g tags to find all with the required children
    Array.from(gTags).forEach(g => {
      const pathChildren = Array.from(g.children).filter(node => node.tagName === 'path');
      const requiredValues = ['hline', 'vline', 'hline', 'vline'];
      const hasValidHighlightSection = pathChildren.length === 4 &&
        pathChildren.every((child, index) => {
          const metaAttr = child.getAttribute('meta');
          return metaAttr !== null && metaAttr === requiredValues[index];
        });

      if (hasValidHighlightSection) {
        const sortedPaths = this.sortNodesByGivenOrder(pathChildren, requiredValues);
        const bounds2 = this.combinePathsAndGetBBox(sortedPaths);
        boundsList.push(bounds2);
      }
    });

    return boundsList;
  }

  static extractOverSetUnderSetBoundsDescriptors(svgDocument$, metaCharacterToCheck) {
    const svgDocument = svgDocument$[0];
    const minCount = this.metaCharacterMinCount[metaCharacterToCheck];
    const gTags = svgDocument.querySelectorAll('g');

    let allMetaCharacterPaths = [];
    // Filter the g tags to find all with the required children
    Array.from(gTags).forEach(g => {
      const pathChildren = Array.from(g.children).filter(node => node.tagName === 'path');
      const hasValidHighlightSection = pathChildren.length > minCount && pathChildren.every((child) => {
        const metaAttr = child.getAttribute('meta');
        return metaAttr !== null && metaAttr === metaCharacterToCheck;
      });

      if (hasValidHighlightSection) {
        allMetaCharacterPaths = allMetaCharacterPaths.concat(pathChildren);
      }
    });

    // Meta based bounds should never be more than one for a given equation
    if (allMetaCharacterPaths.length) {
      return [this.combinePathsAndGetBBox(allMetaCharacterPaths)];
    }
    return [];
  }

  static sortNodesByGivenOrder(paths, order) {
    // Create a map to store the order of each meta attribute
    const orderMap = new Map(order.map((meta, index) => [meta, index]));
    
    // Sort the paths based on the order map
    return paths.sort((a, b) => {
      const metaA = a.getAttribute('meta');
      const metaB = b.getAttribute('meta');
      return orderMap.get(metaA) - orderMap.get(metaB);
    });
  }

  static getScreenBounds(g) {
    const bbox = g.getBBox();
    const ctm = g.getScreenCTM();
    
    if (ctm) {
      const x = bbox.x * ctm.a + bbox.y * ctm.c + ctm.e;
      const y = bbox.x * ctm.b + bbox.y * ctm.d + ctm.f;
      const width = bbox.width * ctm.a;
      const height = bbox.height * ctm.d;
      return new Bounds2(x, y, x + width, y + height);
    }
    
    return Bounds2.NOTHING;
  }

  static getBoundsInCTMUnits(g) {
    const bbox = g.getBBox();
    const ctm = g.getCTM();
    
    if (ctm) {
      // Top-left corner
      const x1 = bbox.x * ctm.a + bbox.y * ctm.c + ctm.e;
      const y1 = bbox.x * ctm.b + bbox.y * ctm.d + ctm.f;
      
      // Bottom-right corner
      const x2 = (bbox.x + bbox.width) * ctm.a + (bbox.y + bbox.height) * ctm.c + ctm.e;
      const y2 = (bbox.x + bbox.width) * ctm.b + (bbox.y + bbox.height) * ctm.d + ctm.f;
      
      const width = x2 - x1;
      const height = y2 - y1;
      return Bounds2.rect(x1, y1, width, height);
    }
    
    return Bounds2.NOTHING;
  }

  // Function to combine multiple paths into one and get its bounding box in CTM coordinates
  static combinePathsAndGetBBox(paths) {
    if (!paths.length)
      return Bounds2.NOTHING;
    
    const pathBounds = this.getBoundsInCTMUnits(paths[0]);
    paths.forEach(path => {
      const transformedBBox = this.getBoundsInCTMUnits(path);
      pathBounds.includeBounds(transformedBBox);
    });
    paths.forEach(path => path.parentNode.removeChild(path));
    return pathBounds;
  }
}