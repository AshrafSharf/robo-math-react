import { Bounds2 } from '../../geom/Bounds2.js';
import { TextSection } from '../models/text-section.js';

export class BoundsExtractor {
  static SEMI_COLON = "MJMAIN-3B";
  static THETA = "MJMATHI-3B8";
  static LANGLE = "MJMAIN-27E8";  // Left angle bracket ⟨
  static RANGLE = "MJMAIN-27E9";  // Right angle bracket ⟩

  // Pixels to inflate bbox bounds for proper coverage
  static BBOX_BOUNDS_PADDING = 3;

  static metaCharacterMinCount = {
    [BoundsExtractor.SEMI_COLON]: 1,
    [BoundsExtractor.THETA]: 1
  };

  static extractFBoxBoundsDescriptors(svgDocument$) {
    const svgDocument = svgDocument$[0];
    const boundsList = [];
    const gTags = svgDocument.querySelectorAll('g');
    const requiredValues = ['hline', 'vline', 'hline', 'vline'];

    Array.from(gTags).forEach((g) => {
      const pathChildren = Array.from(g.children).filter(node => node.tagName === 'path');

      if (pathChildren.length === 4) {
        const hasValidHighlightSection = pathChildren.every((child, index) => {
          const metaAttr = child.getAttribute('meta');
          return metaAttr !== null && metaAttr === requiredValues[index];
        });

        if (hasValidHighlightSection) {
          const sortedPaths = this.sortNodesByGivenOrder(pathChildren, requiredValues);
          const bounds2 = this.combinePathsAndGetBBox(sortedPaths);
          boundsList.push({
            bounds: bounds2,
            paths: sortedPaths
          });
        }
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

  // Extract bounds for groups marked with meta="mpadded" (created by \bbox)
  // Returns objects with {bounds, paths} where paths are the nodes within the bbox region
  static extractBBoxBoundsDescriptors(svgDocument$) {
    const svgDocument = svgDocument$[0];
    const boundsList = [];

    console.log('\n=== BBOX DETECTION (using meta="mpadded") ===');

    // Look for groups with meta="mpadded" which bbox creates
    const mpaddedGroups = svgDocument.querySelectorAll('g[meta="mpadded"]');
    console.log('Groups with meta="mpadded":', mpaddedGroups.length);

    Array.from(mpaddedGroups).forEach((mpaddedGroup, index) => {
      console.log(`\nBBox group ${index}:`);

      // Get bounds of the mpadded group and inflate slightly for proper coverage
      const bounds = this.getBoundsInCTMUnits(mpaddedGroup).dilated(BoundsExtractor.BBOX_BOUNDS_PADDING);
      if (!bounds || bounds.isEmpty()) {
        console.warn('  Could not get valid bounds');
        return;
      }

      console.log(`  Bounds:`, { minX: bounds.minX, minY: bounds.minY, maxX: bounds.maxX, maxY: bounds.maxY });

      // Find all paths with nodepath that are within this bbox region
      const allPaths = svgDocument.querySelectorAll('path[nodepath]');
      const pathsInBBox = [];

      allPaths.forEach((path) => {
        const pathBounds = this.getBoundsInCTMUnits(path);
        if (pathBounds && !pathBounds.isEmpty()) {
          // Check if path is within bbox bounds (with tolerance)
          const tolerance = 5;
          if (this.boundsContains(bounds, pathBounds, tolerance)) {
            pathsInBBox.push(path);
          }
        }
      });

      console.log(`  Found ${pathsInBBox.length} paths within this bbox region`);

      boundsList.push(new TextSection(bounds, pathsInBBox, mpaddedGroup));
    });

    console.log(`Total bbox regions found: ${boundsList.length}`);
    return boundsList;
  }

  // Helper: Check if bounds2 is contained within bounds1 (with tolerance)
  static boundsContains(bounds1, bounds2, tolerance = 0) {
    return (
      bounds2.minX >= (bounds1.minX - tolerance) &&
      bounds2.maxX <= (bounds1.maxX + tolerance) &&
      bounds2.minY >= (bounds1.minY - tolerance) &&
      bounds2.maxY <= (bounds1.maxY + tolerance)
    );
  }

  /**
   * Extract bounds for content enclosed in angle brackets \langle \rangle
   * This finds pairs of angle brackets and stores metadata for later bounds calculation
   * @param {jQuery} svgDocument$ - jQuery-wrapped SVG document
   * @returns {Array} Array of objects with content group IDs and bracket path references
   */
  static extractAngleBracketBounds(svgDocument$) {
    const svgDocument = svgDocument$[0];
    const boundsList = [];

    console.log('\n=== ANGLE BRACKET DETECTION ===');
    console.log('SVG HTML before extraction (first 500 chars):', svgDocument.outerHTML.substring(0, 500));

    // Find all groups in the SVG
    const allGroups = Array.from(svgDocument.querySelectorAll('g'));
    console.log('Total groups:', allGroups.length);

    // Find all angle bracket elements
    const langleGroups = [];
    const rangleGroups = [];

    allGroups.forEach((g, index) => {
      const paths = Array.from(g.children).filter(n => n.tagName === 'path');
      if (paths.length > 0) {
        const meta = paths[0].getAttribute('meta');
        if (meta === this.LANGLE) {
          langleGroups.push({ group: g, index, paths });
          console.log(`Found ⟨ at group ${index}`);
        } else if (meta === this.RANGLE) {
          rangleGroups.push({ group: g, index, paths });
          console.log(`Found ⟩ at group ${index}`);
        }
      }
    });

    console.log(`Found ${langleGroups.length} left angle brackets and ${rangleGroups.length} right angle brackets`);

    // Match pairs of angle brackets
    // Assumption: they appear in order, so first ⟨ pairs with first ⟩, etc.
    const pairCount = Math.min(langleGroups.length, rangleGroups.length);
    console.log(`Pairing ${pairCount} angle bracket pairs`);

    for (let i = 0; i < pairCount; i++) {
      const langle = langleGroups[i];
      const rangle = rangleGroups[i];

      console.log(`\nPair ${i}: ⟨ at group ${langle.index}, ⟩ at group ${rangle.index}`);

      // Find all groups between the angle brackets
      const contentGroups = allGroups.filter((g, idx) => {
        return idx > langle.index && idx < rangle.index;
      });

      console.log(`  Content groups between brackets: ${contentGroups.length}`);

      if (contentGroups.length > 0) {
        // Assign IDs to content groups so we can find them later
        const contentGroupIds = contentGroups.map((g, gIdx) => {
          if (!g.id) {
            g.id = `angle-bracket-content-${i}-${gIdx}`;
          }
          console.log(`    Content group ${gIdx}: id="${g.id}", meta="${g.getAttribute('meta')}"`);
          return g.id;
        });

        // Store metadata for later bounds calculation (after DOM is fully rendered)
        boundsList.push({
          bounds: null,  // Will be calculated later
          contentGroupIds: contentGroupIds,
          langlePaths: langle.paths,
          ranglePaths: rangle.paths
        });
      }
    }

    console.log(`Total angle bracket pairs found: ${boundsList.length}`);
    console.log('SVG HTML after extraction (first 500 chars):', svgDocument.outerHTML.substring(0, 500));
    return boundsList;
  }

  /**
   * Extract bounds for elements marked with a specific fill color (created by \color{colorname}{content})
   * @param {jQuery} svgDocument$ - jQuery-wrapped SVG document
   * @param {string} markerColor - The color name to search for (e.g., 'magenta', 'red', 'cyan')
   * @returns {Bounds2[]} Array of Bounds2 objects for each color-marked element
   */
  static extractColorMarkedBounds(svgDocument$, markerColor) {
    const svgDocument = svgDocument$[0];
    const boundsList = [];

    console.log(`\n=== COLOR MARKER DETECTION (${markerColor}) ===`);

    // Convert color name to hex/rgb for comparison
    const colorVariations = this.getColorVariations(markerColor);
    console.log('Looking for color variations:', colorVariations);

    // Find all elements (use, path, text, etc.) with the marker color
    const allElements = svgDocument.querySelectorAll('*');
    const coloredElements = [];

    console.log(`Total elements in SVG: ${allElements.length}`);

    // Debug: sample first 10 elements to see their structure
    for (let i = 0; i < Math.min(10, allElements.length); i++) {
      const el = allElements[i];
      console.log(`Element ${i}: <${el.tagName}> fill="${el.getAttribute('fill')}" style="${el.getAttribute('style')}" class="${el.getAttribute('class')}"`);
    }

    Array.from(allElements).forEach((element, index) => {
      const fill = element.getAttribute('fill');
      const style = element.getAttribute('style');

      // Check fill attribute or style
      if (fill && colorVariations.some(c => fill.toLowerCase().includes(c))) {
        console.log(`Match found at element ${index}: ${element.tagName} with fill="${fill}"`);
        coloredElements.push(element);
      } else if (style && colorVariations.some(c => style.toLowerCase().includes(c))) {
        console.log(`Match found at element ${index}: ${element.tagName} with style="${style}"`);
        coloredElements.push(element);
      }
    });

    console.log(`Found ${coloredElements.length} elements with ${markerColor} color`);

    // Group elements by their parent <g> to get complete symbol bounds
    const parentGroups = new Map();
    coloredElements.forEach((element) => {
      // Find the nearest parent <g> that represents the colored content
      let parent = element.parentElement;
      while (parent && parent.tagName !== 'g') {
        parent = parent.parentElement;
      }

      if (parent) {
        if (!parentGroups.has(parent)) {
          parentGroups.set(parent, []);
        }
        parentGroups.get(parent).push(element);
      }
    });

    console.log(`Grouped into ${parentGroups.size} parent groups`);

    // Get bounds for each group
    parentGroups.forEach((elements, group) => {
      console.log(`Processing group with ${elements.length} colored elements`);
      const bounds = this.getBoundsInCTMUnits(group);
      if (bounds && !bounds.isEmpty()) {
        console.log(`  Bounds:`, bounds);
        boundsList.push(bounds);
        // Note: We DON'T reset the color here anymore - it will be handled
        // during the normal rendering process in extractHighLightSections
      }
    });

    console.log(`Total color-marked bounds found: ${boundsList.length}`);
    return boundsList;
  }

  /**
   * Get color variations for a color name (hex, rgb, named)
   * @param {string} colorName - Color name (e.g., 'magenta')
   * @returns {string[]} Array of color representations
   */
  static getColorVariations(colorName) {
    const colorMap = {
      'magenta': ['magenta', '#ff00ff', '#f0f', 'rgb(255, 0, 255)', 'rgb(255,0,255)'],
      'cyan': ['cyan', '#00ffff', '#0ff', 'rgb(0, 255, 255)', 'rgb(0,255,255)'],
      'red': ['red', '#ff0000', '#f00', 'rgb(255, 0, 0)', 'rgb(255,0,0)'],
      'blue': ['blue', '#0000ff', '#00f', 'rgb(0, 0, 255)', 'rgb(0,0,255)'],
      'green': ['green', '#008000', 'rgb(0, 128, 0)', 'rgb(0,128,0)'],
      'yellow': ['yellow', '#ffff00', '#ff0', 'rgb(255, 255, 0)', 'rgb(255,255,0)'],
      'orange': ['orange', '#ffa500', 'rgb(255, 165, 0)', 'rgb(255,165,0)'],
      'purple': ['purple', '#800080', 'rgb(128, 0, 128)', 'rgb(128,0,128)']
    };

    return colorMap[colorName.toLowerCase()] || [colorName.toLowerCase()];
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

      // Normalize bounds (SVG can have inverted Y-axis)
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);

      const width = maxX - minX;
      const height = maxY - minY;
      return Bounds2.rect(minX, minY, width, height);
    }

    return Bounds2.NOTHING;
  }

  // Function to combine multiple paths into one and get its bounding box in CTM coordinates
  // NOTE: This is NON-DESTRUCTIVE - it does not remove paths from the DOM
  static combinePathsAndGetBBox(paths) {
    if (!paths.length)
      return Bounds2.NOTHING;

    // Start with NOTHING and accumulate all paths
    const pathBounds = new Bounds2(
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY
    );

    paths.forEach(path => {
      const transformedBBox = this.getBoundsInCTMUnits(path);
      console.log('Path bbox:', transformedBBox);
      console.log('  minX:', transformedBBox.minX, 'minY:', transformedBBox.minY);
      console.log('  maxX:', transformedBBox.maxX, 'maxY:', transformedBBox.maxY);
      pathBounds.includeBounds(transformedBBox);
    });

    console.log('Combined bounds:', pathBounds);
    console.log('  minX:', pathBounds.minX, 'minY:', pathBounds.minY);
    console.log('  maxX:', pathBounds.maxX, 'maxY:', pathBounds.maxY);

    // DO NOT REMOVE PATHS - this is a pure getter function
    // If you need to remove fbox paths, call removeFBoxPaths() explicitly
    return pathBounds;
  }

  // Explicit method to remove fbox paths from the DOM
  static removeFBoxPaths(paths) {
    paths.forEach(path => {
      if (path.parentNode) {
        path.parentNode.removeChild(path);
      }
    });
  }
}