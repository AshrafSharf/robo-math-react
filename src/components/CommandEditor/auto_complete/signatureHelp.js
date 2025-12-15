/**
 * Signature help for robo-canvas language.
 * Shows function signatures as tooltips when cursor is after ( or ,
 */

import { StateField, StateEffect } from '@codemirror/state';
import { showTooltip, EditorView } from '@codemirror/view';
import { completionStatus } from '@codemirror/autocomplete';
import { FUNCTION_METADATA } from './functionMetadata';

/**
 * Parse the text before cursor to find function context.
 * @param {string} text - Text before cursor
 * @returns {Object|null} { funcName, argIndex, openParenPos } or null
 */
function parseFunctionContext(text) {
  let depth = 0;
  let argIndex = 0;
  let funcStart = -1;

  // Scan backwards to find the opening parenthesis
  for (let i = text.length - 1; i >= 0; i--) {
    const char = text[i];

    if (char === ')') {
      depth++;
    } else if (char === '(') {
      if (depth === 0) {
        funcStart = i;
        break;
      }
      depth--;
    } else if (char === ',' && depth === 0) {
      argIndex++;
    }
  }

  if (funcStart === -1) {
    return null;
  }

  // Extract function name before the parenthesis
  const beforeParen = text.slice(0, funcStart);
  const funcMatch = beforeParen.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*$/);

  if (!funcMatch) {
    return null;
  }

  return {
    funcName: funcMatch[1].toLowerCase(),
    argIndex,
    openParenPos: funcStart  // Position of opening paren for stable tooltip placement
  };
}

/**
 * Create signature tooltip content.
 * @param {Object} funcMeta - Function metadata
 * @param {number} argIndex - Current argument index
 * @returns {HTMLElement} Tooltip DOM element
 */
function createSignatureTooltip(funcMeta, argIndex) {
  const dom = document.createElement('div');
  dom.className = 'cm-signature-tooltip';

  // Primary signature with types and argument highlighting
  const primarySig = document.createElement('div');
  primarySig.className = 'cm-signature-primary';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'cm-signature-name';
  nameSpan.textContent = funcMeta.name;
  primarySig.appendChild(nameSpan);

  primarySig.appendChild(document.createTextNode('('));

  funcMeta.args.forEach((arg, i) => {
    if (i > 0) {
      primarySig.appendChild(document.createTextNode(', '));
    }
    const argSpan = document.createElement('span');
    argSpan.className = i === argIndex ? 'cm-signature-arg-active' : 'cm-signature-arg';
    argSpan.textContent = arg;
    primarySig.appendChild(argSpan);
  });

  primarySig.appendChild(document.createTextNode(')'));
  dom.appendChild(primarySig);

  // Description
  if (funcMeta.description) {
    const descDiv = document.createElement('div');
    descDiv.className = 'cm-signature-desc';
    descDiv.textContent = funcMeta.description;
    dom.appendChild(descDiv);
  }

  // Alternative signatures
  if (funcMeta.altSignatures && funcMeta.altSignatures.length > 1) {
    const altTitle = document.createElement('div');
    altTitle.className = 'cm-signature-alt-title';
    altTitle.textContent = 'Also:';
    dom.appendChild(altTitle);

    const sigList = document.createElement('div');
    sigList.className = 'cm-signature-list';

    funcMeta.altSignatures.slice(1).forEach(sig => {
      const sigItem = document.createElement('div');
      sigItem.className = 'cm-signature-item';
      sigItem.textContent = sig;
      sigList.appendChild(sigItem);
    });

    dom.appendChild(sigList);
  }

  return dom;
}

/**
 * Compute signature tooltip based on cursor position.
 * @param {EditorState} state - Current editor state
 * @returns {Array} Array of tooltip objects
 */
function getSignatureTooltip(state) {
  const pos = state.selection.main.head;
  const textBefore = state.sliceDoc(0, pos);

  const context = parseFunctionContext(textBefore);
  if (!context) {
    return [];
  }

  const funcMeta = FUNCTION_METADATA[context.funcName];
  if (!funcMeta) {
    return [];
  }

  return [{
    pos,
    above: true,
    strictSide: true,
    arrow: false,
    create: () => ({
      dom: createSignatureTooltip(funcMeta, context.argIndex),
      offset: { x: 100, y: 60 }
    })
  }];
}

/**
 * Effect to clear signature tooltips (used on blur)
 */
export const clearSignatureTooltips = StateEffect.define();

/**
 * StateField that manages signature help tooltips.
 */
export const signatureHelpField = StateField.define({
  create() {
    return [];
  },

  update(tooltips, tr) {
    // Check for clear effect (triggered on blur)
    for (let effect of tr.effects) {
      if (effect.is(clearSignatureTooltips)) {
        return [];
      }
    }

    // Hide signature help when autocomplete dropdown is active to avoid UI clutter
    const autocompleteActive = completionStatus(tr.state) === 'active';
    if (autocompleteActive) {
      return [];
    }

    // Only show signature help when user is actively typing (document changed)
    // Don't show on selection-only changes (like clicking/focusing)
    if (tr.docChanged) {
      return getSignatureTooltip(tr.state);
    }

    // Keep existing tooltips if document didn't change, but clear on pure selection changes
    // This allows tooltips to persist while navigating with arrows after typing
    if (tr.selection && !tr.docChanged) {
      // If there are existing tooltips and cursor moved, recompute to update arg highlighting
      if (tooltips.length > 0) {
        return getSignatureTooltip(tr.state);
      }
      // Otherwise don't show new tooltips on click/focus
      return [];
    }

    return tooltips;
  },

  provide: field => showTooltip.computeN([field], state => state.field(field))
});

/**
 * Theme for signature help tooltips.
 */
export const signatureHelpTheme = EditorView.baseTheme({
  // Ensure tooltip container has high z-index
  '.cm-tooltip': {
    zIndex: '99999 !important',
    backgroundColor: '#0a0a0a'
  },
  '.cm-tooltip.cm-tooltip-above': {
    backgroundColor: '#0a0a0a',
    overflow: 'visible'
  },
  '.cm-signature-tooltip': {
    backgroundColor: '#0a0a0a',
    color: '#d4d4d4',
    border: '1px solid #333',
    borderRadius: '4px',
    padding: '12px 14px',
    fontSize: '15px',
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    maxWidth: '500px',
    minHeight: 'fit-content',
    height: 'auto',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
    zIndex: '99999 !important',
    overflow: 'visible',
    display: 'block'
  },
  '.cm-signature-name': {
    color: '#dcdcaa',
    fontWeight: 'bold'
  },
  '.cm-signature-arg': {
    color: '#9cdcfe'
  },
  '.cm-signature-arg-active': {
    color: '#4ec9b0',
    fontWeight: 'bold',
    textDecoration: 'underline'
  },
  '.cm-signature-primary': {
    marginBottom: '6px'
  },
  '.cm-signature-desc': {
    color: '#a0a0a0',
    fontSize: '13px',
    fontFamily: '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
    marginBottom: '6px',
    paddingBottom: '6px',
    borderBottom: '1px solid #333'
  },
  '.cm-signature-alt-title': {
    color: '#808080',
    fontSize: '12px',
    marginBottom: '4px'
  },
  '.cm-signature-list': {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  '.cm-signature-item': {
    color: '#9cdcfe',
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    fontSize: '13px',
    padding: '1px 0'
  }
});

/**
 * Get function info for a given name (for external use).
 * @param {string} funcName - Function name
 * @returns {Object|null} Function metadata or null
 */
export function getFunctionInfo(funcName) {
  return FUNCTION_METADATA[funcName.toLowerCase()] || null;
}
