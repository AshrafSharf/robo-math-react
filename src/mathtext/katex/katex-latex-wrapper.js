/**
 * KatexLatexWrapper - Wraps LaTeX patterns with \htmlClass{robo-select}{...}
 *
 * Used for selective display/animation of KaTeX-rendered math portions.
 * Similar to bbox-latex-wrapper.js but uses KaTeX's \htmlClass command.
 */

/**
 * Escapes special regex characters in a string
 * @param {string} str - String to escape
 * @returns {string} - Regex-safe string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Operators that can have flexible whitespace around them
const OPERATORS = '=+\\-*/^<>≤≥≠±×÷';

// Map of shorthand names to LaTeX commands (commands that take arguments)
const LATEX_COMMAND_MAP = {
  // Roots and fractions
  sqrt: '\\sqrt',
  frac: '\\frac',
  dfrac: '\\dfrac',
  tfrac: '\\tfrac',
  cfrac: '\\cfrac',
  sfrac: '\\sfrac',
  nicefrac: '\\nicefrac',
  xfrac: '\\xfrac',

  // Accents and decorations (single argument)
  hat: '\\hat',
  widehat: '\\widehat',
  bar: '\\bar',
  overbar: '\\overbar',
  vec: '\\vec',
  overrightarrow: '\\overrightarrow',
  overleftarrow: '\\overleftarrow',
  overleftrightarrow: '\\overleftrightarrow',
  dot: '\\dot',
  ddot: '\\ddot',
  dddot: '\\dddot',
  ddddot: '\\ddddot',
  tilde: '\\tilde',
  widetilde: '\\widetilde',
  acute: '\\acute',
  grave: '\\grave',
  breve: '\\breve',
  check: '\\check',
  ring: '\\ring',
  mathring: '\\mathring',

  // Over/under constructs
  overline: '\\overline',
  underline: '\\underline',
  overbrace: '\\overbrace',
  underbrace: '\\underbrace',
  overgroup: '\\overgroup',
  undergroup: '\\undergroup',
  overlinesegment: '\\overlinesegment',
  underlinesegment: '\\underlinesegment',
  overset: '\\overset',
  underset: '\\underset',
  stackrel: '\\stackrel',
  atop: '\\atop',
  xrightarrow: '\\xrightarrow',
  xleftarrow: '\\xleftarrow',
  xLeftarrow: '\\xLeftarrow',
  xRightarrow: '\\xRightarrow',
  xleftrightarrow: '\\xleftrightarrow',
  xLeftrightarrow: '\\xLeftrightarrow',
  xhookleftarrow: '\\xhookleftarrow',
  xhookrightarrow: '\\xhookrightarrow',
  xtwoheadleftarrow: '\\xtwoheadleftarrow',
  xtwoheadrightarrow: '\\xtwoheadrightarrow',
  xlongequal: '\\xlongequal',
  xmapsto: '\\xmapsto',
  cancelto: '\\cancelto',

  // Text and font styles
  text: '\\text',
  textbf: '\\textbf',
  textit: '\\textit',
  texttt: '\\texttt',
  textrm: '\\textrm',
  textsf: '\\textsf',
  textup: '\\textup',
  textnormal: '\\textnormal',
  mathbf: '\\mathbf',
  mathit: '\\mathit',
  mathrm: '\\mathrm',
  mathsf: '\\mathsf',
  mathtt: '\\mathtt',
  mathcal: '\\mathcal',
  mathbb: '\\mathbb',
  mathfrak: '\\mathfrak',
  mathscr: '\\mathscr',
  mathord: '\\mathord',
  mathop: '\\mathop',
  mathbin: '\\mathbin',
  mathrel: '\\mathrel',
  mathopen: '\\mathopen',
  mathclose: '\\mathclose',
  mathpunct: '\\mathpunct',
  mathinner: '\\mathinner',
  boldsymbol: '\\boldsymbol',
  bm: '\\bm',
  bold: '\\bold',
  pmb: '\\pmb',
  rm: '\\rm',
  bf: '\\bf',
  it: '\\it',
  sf: '\\sf',
  tt: '\\tt',
  cal: '\\cal',
  Bbb: '\\Bbb',
  frak: '\\frak',

  // Size commands
  tiny: '\\tiny',
  scriptsize: '\\scriptsize',
  footnotesize: '\\footnotesize',
  small: '\\small',
  normalsize: '\\normalsize',
  large: '\\large',
  Large: '\\Large',
  LARGE: '\\LARGE',
  huge: '\\huge',
  Huge: '\\Huge',

  // Delimiters
  left: '\\left',
  right: '\\right',
  bigl: '\\bigl',
  bigr: '\\bigr',
  bigm: '\\bigm',
  Bigl: '\\Bigl',
  Bigr: '\\Bigr',
  Bigm: '\\Bigm',
  biggl: '\\biggl',
  biggr: '\\biggr',
  biggm: '\\biggm',
  Biggl: '\\Biggl',
  Biggr: '\\Biggr',
  Biggm: '\\Biggm',

  // Binomials and combinations
  binom: '\\binom',
  dbinom: '\\dbinom',
  tbinom: '\\tbinom',
  choose: '\\choose',

  // Boxes and frames
  boxed: '\\boxed',
  fbox: '\\fbox',
  colorbox: '\\colorbox',
  fcolorbox: '\\fcolorbox',
  framebox: '\\framebox',
  mbox: '\\mbox',
  hbox: '\\hbox',
  vbox: '\\vbox',
  bbox: '\\bbox',
  cancel: '\\cancel',
  bcancel: '\\bcancel',
  xcancel: '\\xcancel',
  sout: '\\sout',
  phase: '\\phase',
  angl: '\\angl',
  enclose: '\\enclose',

  // Colors
  color: '\\color',
  textcolor: '\\textcolor',

  // Spacing
  hspace: '\\hspace',
  vspace: '\\vspace',
  kern: '\\kern',
  mkern: '\\mkern',
  mskip: '\\mskip',
  hskip: '\\hskip',
  rule: '\\rule',
  phantom: '\\phantom',
  hphantom: '\\hphantom',
  vphantom: '\\vphantom',
  smash: '\\smash',
  llap: '\\llap',
  rlap: '\\rlap',
  clap: '\\clap',
  mathllap: '\\mathllap',
  mathrlap: '\\mathrlap',
  mathclap: '\\mathclap',
  raisebox: '\\raisebox',
  raisebox: '\\raisebox',
  lowered: '\\lowered',
  raised: '\\raised',
  vcenter: '\\vcenter',

  // Environments and matrices
  matrix: '\\matrix',
  pmatrix: '\\pmatrix',
  bmatrix: '\\bmatrix',
  Bmatrix: '\\Bmatrix',
  vmatrix: '\\vmatrix',
  Vmatrix: '\\Vmatrix',
  smallmatrix: '\\smallmatrix',
  cases: '\\cases',
  rcases: '\\rcases',
  array: '\\array',
  aligned: '\\aligned',
  gathered: '\\gathered',
  alignedat: '\\alignedat',
  split: '\\split',
  subarray: '\\subarray',

  // Limits and sums
  sum: '\\sum',
  prod: '\\prod',
  int: '\\int',
  iint: '\\iint',
  iiint: '\\iiint',
  oint: '\\oint',
  oiint: '\\oiint',
  oiiint: '\\oiiint',
  intop: '\\intop',
  smallint: '\\smallint',
  lim: '\\lim',
  limsup: '\\limsup',
  liminf: '\\liminf',
  max: '\\max',
  min: '\\min',
  sup: '\\sup',
  inf: '\\inf',
  det: '\\det',
  gcd: '\\gcd',
  lcm: '\\lcm',
  Pr: '\\Pr',
  hom: '\\hom',
  ker: '\\ker',
  dim: '\\dim',
  arg: '\\arg',
  deg: '\\deg',
  exp: '\\exp',
  lg: '\\lg',
  ln: '\\ln',
  log: '\\log',

  // Trig functions
  sin: '\\sin',
  cos: '\\cos',
  tan: '\\tan',
  cot: '\\cot',
  sec: '\\sec',
  csc: '\\csc',
  sinh: '\\sinh',
  cosh: '\\cosh',
  tanh: '\\tanh',
  coth: '\\coth',
  sech: '\\sech',
  csch: '\\csch',
  arcsin: '\\arcsin',
  arccos: '\\arccos',
  arctan: '\\arctan',
  arccot: '\\arccot',
  arcsec: '\\arcsec',
  arccsc: '\\arccsc',
  operatorname: '\\operatorname',

  // Modular arithmetic
  mod: '\\mod',
  bmod: '\\bmod',
  pmod: '\\pmod',
  pod: '\\pod',

  // Misc
  not: '\\not',
  tag: '\\tag',
  notag: '\\notag',
  label: '\\label',
  ref: '\\ref',
  eqref: '\\eqref',
  href: '\\href',
  url: '\\url',
  htmlClass: '\\htmlClass',
  htmlId: '\\htmlId',
  htmlStyle: '\\htmlStyle',
  htmlData: '\\htmlData',
  includegraphics: '\\includegraphics',
};

/**
 * Normalize pattern - convert shorthand to LaTeX command if known
 * @param {string} pattern - User-provided pattern
 * @returns {string} - Normalized pattern with LaTeX command
 */
function normalizePattern(pattern) {
  const trimmed = pattern.trim();
  // Check if it's a known shorthand (without backslash)
  if (LATEX_COMMAND_MAP[trimmed]) {
    return LATEX_COMMAND_MAP[trimmed];
  }
  // Check if it starts with backslash but without it is a known command
  if (trimmed.startsWith('\\')) {
    const withoutSlash = trimmed.substring(1);
    if (LATEX_COMMAND_MAP[withoutSlash]) {
      return LATEX_COMMAND_MAP[withoutSlash];
    }
  }
  return pattern;
}

/**
 * Extract balanced brace groups starting at position
 * @param {string} str - The string to search in
 * @param {number} startPos - Position to start looking
 * @returns {string} - The captured brace groups (empty if none)
 */
function captureBraceGroups(str, startPos) {
  let result = '';
  let pos = startPos;

  // Capture consecutive {..} groups (for commands like \frac{a}{b})
  while (pos < str.length && str[pos] === '{') {
    let depth = 1;
    let groupStart = pos;
    pos++; // skip opening {

    while (pos < str.length && depth > 0) {
      if (str[pos] === '{') depth++;
      else if (str[pos] === '}') depth--;
      pos++;
    }

    if (depth === 0) {
      result += str.substring(groupStart, pos);
    } else {
      // Unbalanced braces, stop
      break;
    }
  }

  return result;
}

/**
 * Wraps all occurrences of a pattern within a LaTeX string with \htmlClass{robo-select}{...}
 * Allows flexible whitespace around operators.
 *
 * @param {string} full - The full LaTeX string
 * @param {string} pattern - The pattern to wrap
 * @returns {string} - LaTeX string with pattern wrapped in \htmlClass{robo-select}{...}
 *
 * @example
 * wrapWithHtmlClass('x^2 + 2x + 1 = 0', 'x^2')
 * // Returns: '\\htmlClass{robo-select}{x^2} + 2x + 1 = 0'
 */
export function wrapWithHtmlClass(full, pattern) {
  if (!full || !pattern) {
    return full;
  }

  // Normalize pattern (e.g., 'sqrt' → '\sqrt')
  const normalizedPattern = normalizePattern(pattern);

  // Build a flexible regex pattern that allows optional whitespace around operators
  let flexiblePattern = '';
  for (let i = 0; i < normalizedPattern.length; i++) {
    const char = normalizedPattern[i];
    const escapedChar = escapeRegex(char);

    if (OPERATORS.includes(char)) {
      // Allow optional whitespace around operators
      flexiblePattern += `\\s*${escapedChar}\\s*`;
    } else {
      flexiblePattern += escapedChar;
    }
  }

  const regex = new RegExp(flexiblePattern, 'g');

  // Track offset adjustments due to replacements
  let result = '';
  let lastIndex = 0;

  let match;
  while ((match = regex.exec(full)) !== null) {
    const matchStr = match[0];
    const offset = match.index;

    // Add content before this match
    result += full.substring(lastIndex, offset);

    // Check if match ends with a LaTeX command (e.g., \sqrt, \frac)
    // If so, capture following {..} groups
    let fullMatch = matchStr;
    let endPos = offset + matchStr.length;

    if (/\\[a-zA-Z]+$/.test(matchStr)) {
      const braceGroups = captureBraceGroups(full, endPos);
      if (braceGroups) {
        fullMatch += braceGroups;
        endPos += braceGroups.length;
      }
    }

    // Wrap the full match
    let wrapped = `\\htmlClass{robo-select}{${fullMatch}}`;

    // If preceded by ^ or _, wrap in braces so LaTeX parses correctly
    if (offset > 0) {
      const prevChar = full[offset - 1];
      if (prevChar === '^' || prevChar === '_') {
        wrapped = `{${wrapped}}`;
      }
    }

    result += wrapped;
    lastIndex = endPos;

    // Update regex lastIndex to skip captured brace groups
    regex.lastIndex = endPos;
  }

  // Add remaining content after last match
  result += full.substring(lastIndex);

  return result;
}

/**
 * Wraps multiple patterns within a LaTeX string with \htmlClass{robo-select}{...}
 * Patterns are processed in order.
 *
 * @param {string} full - The full LaTeX string
 * @param {string[]} patterns - Array of patterns to wrap
 * @returns {string} - LaTeX string with all patterns wrapped
 */
export function wrapMultipleWithHtmlClass(full, patterns) {
  if (!full || !patterns || !Array.isArray(patterns)) {
    return full;
  }

  let result = full;
  for (const pattern of patterns) {
    result = wrapWithHtmlClass(result, pattern);
  }
  return result;
}

/**
 * KatexLatexWrapper class for object-oriented usage
 */
export class KatexLatexWrapper {
  static MARKER_CLASS = 'robo-select';

  /**
   * Wraps all occurrences of a pattern with \htmlClass{robo-select}{...}
   * @param {string} full - Full LaTeX string
   * @param {string} pattern - Pattern to wrap
   * @returns {string} - Wrapped LaTeX string
   */
  static wrap(full, pattern) {
    return wrapWithHtmlClass(full, pattern);
  }

  /**
   * Wraps multiple patterns with \htmlClass{robo-select}{...}
   * @param {string} full - Full LaTeX string
   * @param {string[]} patterns - Patterns to wrap
   * @returns {string} - Wrapped LaTeX string
   */
  static wrapMultiple(full, patterns) {
    return wrapMultipleWithHtmlClass(full, patterns);
  }

  /**
   * Get the CSS class used for marking
   * @returns {string}
   */
  static getMarkerClass() {
    return this.MARKER_CLASS;
  }
}

export default KatexLatexWrapper;
