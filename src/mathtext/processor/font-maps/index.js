// Font maps index - combines all character maps
import { latinUppercaseMap } from './latin-uppercase-map.js';
import { latinLowercaseMap } from './latin-lowercase-map.js';
import { digitsMap } from './digits-map.js';
import { symbolsMap } from './symbols-map.js';
import { greekMap } from './greek-map.js';
import { geometricMap } from './geometric-map.js';
import { arrowsMap } from './arrows-map.js';

// Combined font map with all characters
export const mainFontMapValues = {
  ...latinUppercaseMap,
  ...latinLowercaseMap,
  ...digitsMap,
  ...symbolsMap,
  ...greekMap,
  ...geometricMap,
  ...arrowsMap,
};

// Re-export individual maps for direct access if needed
export {
  latinUppercaseMap,
  latinLowercaseMap,
  digitsMap,
  symbolsMap,
  greekMap,
  geometricMap,
  arrowsMap,
};
