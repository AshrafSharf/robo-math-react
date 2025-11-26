/**
 * Available command keywords for autocomplete
 */
export const AVAILABLE_TAGS = [
  'point',
  'line',
  'arc',
  'perp',
  'parallel',
  'angle',
  'polygon',
  'findangle',
  'dist',
  'pos',
  'x',
  'y',
  'intersect',
  'reflect',
  'rotate',
  'project',
  'interpolate',
  'hide',
  'dilate',
  'fill',
  'trace',
  'translate',
  'text',
  'group',
  'and',
  'or',
  'diff',
  'subtract',
  'plot',
  'para',
  'part',
  'fade',
  'dash',
  'pointtype',
  'stroke',
  'reverse',
  'marker'
];

/**
 * Extract search string for autocomplete
 * @param {string} value - Input value
 * @returns {string} Search string
 */
export const getSearchStr = (value) => {
  if (!value || value.trim() === '') return '';

  const splitByComma = value.split(',').pop();
  if (/^[A-Za-z]+$/.test(splitByComma) || splitByComma === '') {
    return splitByComma;
  }

  const splitByBracket = value.split('(').pop();
  if (/^[A-Za-z]+$/.test(splitByBracket)) {
    return splitByBracket;
  }

  const splitByEqual = value.split('=').pop();
  if (/^[A-Za-z]+$/.test(splitByEqual) || splitByEqual === '') {
    return splitByEqual;
  }

  return 'no-match';
};

/**
 * Get autocomplete suggestions based on search string
 * @param {string} searchStr - Search string
 * @returns {Array<string>} Filtered suggestions
 */
export const getSuggestions = (searchStr) => {
  if (!searchStr || searchStr === 'no-match') return [];

  const regex = new RegExp('^' + searchStr, 'i');
  return AVAILABLE_TAGS.filter(tag => regex.test(tag)).sort();
};
