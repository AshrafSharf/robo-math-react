/**
 * Robo-canvas autocomplete module for CodeMirror.
 *
 * This module provides intelligent autocomplete for the robo-canvas language:
 * - Function name completions with signatures
 * - User-defined variable completions
 * - Category grouping
 * - Signature help tooltips on ( and ,
 */

export { FUNCTION_METADATA, getAllFunctionNames, getFunctionsByCategory, getCategories, CATEGORY_ORDER } from './functionMetadata';
export { extractVariables, createVariableProvider } from './variableContext';
export { createRoboCanvasCompletions, roboCanvasCompletions, getCompletionsForPrefix } from './completionSource';
export { signatureHelpField, signatureHelpTheme, getFunctionInfo, clearSignatureTooltips } from './signatureHelp';

// Import styles
import './styles.css';

/**
 * Create a complete autocomplete extension for CodeMirror.
 * This combines the completion source with signature help.
 *
 * @param {Function} variableProvider - Function that returns array of { name, type, line }
 * @param {number} currentLineIndex - Current command line index
 * @returns {Array} Array of CodeMirror extensions
 */
import { autocompletion } from '@codemirror/autocomplete';
import { tooltips } from '@codemirror/view';
import { createRoboCanvasCompletions } from './completionSource';
import { signatureHelpField, signatureHelpTheme } from './signatureHelp';

export function roboCanvasAutocomplete(variableProvider = null, currentLineIndex = 0) {
  return [
    // Configure tooltips to render in document.body to escape overflow clipping
    tooltips({
      parent: document.body,
      position: 'absolute'
    }),
    autocompletion({
      override: [createRoboCanvasCompletions(variableProvider, currentLineIndex)],
      activateOnTyping: true,
      closeOnBlur: true,
      maxRenderedOptions: 50,
      defaultKeymap: true,
      icons: false  // Disable default icons, we style with CSS
    }),
    signatureHelpField,
    signatureHelpTheme
  ];
}
