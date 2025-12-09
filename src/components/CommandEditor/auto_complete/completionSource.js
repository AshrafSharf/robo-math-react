/**
 * CodeMirror completion source for robo-canvas language.
 * Provides function and variable completions with category grouping.
 */

import { FUNCTION_METADATA, CATEGORY_ORDER } from './functionMetadata';

/**
 * Create a formatted info tooltip for a function
 * @param {Object} func - Function metadata
 * @returns {HTMLElement} DOM element for tooltip
 */
function createFunctionInfoTooltip(func) {
  const container = document.createElement('div');
  container.className = 'cm-function-info';

  // Description
  const desc = document.createElement('div');
  desc.className = 'cm-function-desc';
  desc.textContent = func.description;
  container.appendChild(desc);

  // Alternative signatures
  if (func.altSignatures && func.altSignatures.length > 0) {
    const altTitle = document.createElement('div');
    altTitle.className = 'cm-function-alt-title';
    altTitle.textContent = 'Signatures:';
    container.appendChild(altTitle);

    const altList = document.createElement('div');
    altList.className = 'cm-function-alt-list';
    func.altSignatures.forEach(sig => {
      const sigItem = document.createElement('div');
      sigItem.className = 'cm-function-alt-item';
      sigItem.textContent = sig;
      altList.appendChild(sigItem);
    });
    container.appendChild(altList);
  }

  return container;
}

/**
 * Create a CodeMirror completion source for robo-canvas functions and variables.
 * @param {Function} variableProvider - Function that returns array of { name, type, line }
 * @param {number} currentLineIndex - Current command line index
 * @returns {Function} CodeMirror completion source
 */
export function createRoboCanvasCompletions(variableProvider, currentLineIndex = 0) {
  return (context) => {
    // Match identifier being typed (letters, numbers, underscore)
    const word = context.matchBefore(/[a-zA-Z_][a-zA-Z0-9_]*/);

    // Don't show completions if we're not typing an identifier
    // and the user hasn't explicitly requested completions
    if (!word && !context.explicit) {
      return null;
    }

    const search = word?.text?.toLowerCase() || '';
    const from = word?.from ?? context.pos;

    // Get function completions - combine name and signature in label
    const functionOptions = Object.values(FUNCTION_METADATA)
      .filter(func => func.name.toLowerCase().startsWith(search))
      .map(func => ({
        label: func.name + func.signature,
        displayLabel: func.name + func.signature,
        type: 'function',
        info: () => createFunctionInfoTooltip(func),
        section: func.category,
        boost: getCategoryBoost(func.category),
        apply: (view, completion, from, to) => {
          // Insert function name with opening parenthesis
          const insert = func.name + '(';
          view.dispatch({
            changes: { from, to, insert },
            selection: { anchor: from + insert.length }
          });
        }
      }));

    // Get variable completions
    const variables = variableProvider ? variableProvider(currentLineIndex) : [];
    const variableOptions = variables
      .filter(v => v.name.toLowerCase().startsWith(search))
      .map(v => ({
        label: v.name,
        displayLabel: `${v.name} : ${v.type}`,
        type: 'variable',
        info: `Defined at line ${v.line + 1}`,
        section: 'Variables',
        boost: 2 // Variables get higher priority
      }));

    // Combine and sort options
    const options = [...variableOptions, ...functionOptions];

    if (options.length === 0) {
      return null;
    }

    return {
      from,
      options,
      validFor: /^[a-zA-Z_][a-zA-Z0-9_]*$/
    };
  };
}

/**
 * Get boost value for a category (higher = appears first).
 * @param {string} category - The category name
 * @returns {number} Boost value
 */
function getCategoryBoost(category) {
  const index = CATEGORY_ORDER.indexOf(category);
  if (index === -1) return 0;
  // Higher boost for earlier categories
  return (CATEGORY_ORDER.length - index) / CATEGORY_ORDER.length;
}

/**
 * Create a simple completion source without variable support.
 * Useful for standalone usage.
 * @returns {Function} CodeMirror completion source
 */
export function roboCanvasCompletions(context) {
  return createRoboCanvasCompletions(null, 0)(context);
}

/**
 * Get completions for a specific prefix (for testing/debugging).
 * @param {string} prefix - The prefix to match
 * @param {Array} variables - Optional array of variables
 * @returns {Array} Array of completion options
 */
export function getCompletionsForPrefix(prefix, variables = []) {
  const search = prefix.toLowerCase();

  const functionOptions = Object.values(FUNCTION_METADATA)
    .filter(func => func.name.toLowerCase().startsWith(search))
    .map(func => ({
      label: func.name,
      type: 'function',
      detail: func.signature,
      info: func.description,
      section: func.category
    }));

  const variableOptions = variables
    .filter(v => v.name.toLowerCase().startsWith(search))
    .map(v => ({
      label: v.name,
      type: 'variable',
      detail: v.type,
      section: 'Variables'
    }));

  return [...variableOptions, ...functionOptions];
}
