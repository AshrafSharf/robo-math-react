/**
 * Signature help for robo-canvas language.
 * Shows function signatures as a fixed tooltip at bottom-right of viewport.
 */

import { StateField, StateEffect } from '@codemirror/state';
import { ViewPlugin, EditorView } from '@codemirror/view';
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
 * Get signature data based on cursor position.
 * @param {EditorState} state - Current editor state
 * @returns {Object|null} { funcMeta, argIndex } or null
 */
function getSignatureData(state) {
  const pos = state.selection.main.head;
  const textBefore = state.sliceDoc(0, pos);

  const context = parseFunctionContext(textBefore);
  if (!context) {
    return null;
  }

  const funcMeta = FUNCTION_METADATA[context.funcName];
  if (!funcMeta) {
    return null;
  }

  return { funcMeta, argIndex: context.argIndex };
}

/**
 * Effect to clear signature tooltips (used on blur)
 */
export const clearSignatureTooltips = StateEffect.define();

/**
 * StateField that tracks whether signature help should be shown.
 */
export const signatureHelpField = StateField.define({
  create() {
    return null; // { funcMeta, argIndex } or null
  },

  update(data, tr) {
    // Check for clear effect (triggered on blur)
    for (let effect of tr.effects) {
      if (effect.is(clearSignatureTooltips)) {
        return null;
      }
    }

    // Hide signature help when autocomplete dropdown is active to avoid UI clutter
    const autocompleteActive = completionStatus(tr.state) === 'active';
    if (autocompleteActive) {
      return null;
    }

    // Only show signature help when user is actively typing (document changed)
    // Don't show on selection-only changes (like clicking/focusing)
    if (tr.docChanged) {
      return getSignatureData(tr.state);
    }

    // Keep existing data if document didn't change, but clear on pure selection changes
    // This allows tooltips to persist while navigating with arrows after typing
    if (tr.selection && !tr.docChanged) {
      // If there's existing data and cursor moved, recompute to update arg highlighting
      if (data) {
        return getSignatureData(tr.state);
      }
      // Otherwise don't show new tooltips on click/focus
      return null;
    }

    return data;
  }
});

/**
 * ViewPlugin that manages the fixed-position tooltip DOM element.
 */
const signatureHelpPlugin = ViewPlugin.fromClass(class {
  constructor(view) {
    this.tooltip = null;
    this.update(view);
  }

  update(update) {
    const data = update.state.field(signatureHelpField);

    if (data) {
      // Show or update tooltip
      if (!this.tooltip) {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'cm-signature-tooltip-container';
        document.body.appendChild(this.tooltip);
      }
      // Clear and recreate content
      this.tooltip.innerHTML = '';
      this.tooltip.appendChild(createSignatureTooltip(data.funcMeta, data.argIndex));
    } else {
      // Hide tooltip
      if (this.tooltip) {
        this.tooltip.remove();
        this.tooltip = null;
      }
    }
  }

  destroy() {
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  }
});

/**
 * Theme for signature help tooltips.
 */
export const signatureHelpTheme = EditorView.baseTheme({
  // Styles are applied via global CSS since tooltip is in document.body
});

// Inject global styles for the fixed tooltip
const styleId = 'cm-signature-help-styles';
if (!document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .cm-signature-tooltip-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 99999;
    }
    .cm-signature-tooltip {
      background-color: #0a0a0a;
      color: #d4d4d4;
      border: 1px solid #333;
      border-radius: 4px;
      padding: 12px 14px;
      font-size: 15px;
      font-family: Monaco, Consolas, "Courier New", monospace;
      max-width: 500px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
    }
    .cm-signature-name {
      color: #dcdcaa;
      font-weight: bold;
    }
    .cm-signature-arg {
      color: #9cdcfe;
    }
    .cm-signature-arg-active {
      color: #4ec9b0;
      font-weight: bold;
      text-decoration: underline;
    }
    .cm-signature-primary {
      margin-bottom: 6px;
    }
    .cm-signature-desc {
      color: #a0a0a0;
      font-size: 13px;
      font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
      margin-bottom: 6px;
      padding-bottom: 6px;
      border-bottom: 1px solid #333;
    }
    .cm-signature-alt-title {
      color: #808080;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .cm-signature-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .cm-signature-item {
      color: #9cdcfe;
      font-family: Monaco, Consolas, "Courier New", monospace;
      font-size: 13px;
      padding: 1px 0;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Combined extension for signature help.
 */
export const signatureHelpExtension = [signatureHelpField, signatureHelpPlugin];

/**
 * Get function info for a given name (for external use).
 * @param {string} funcName - Function name
 * @returns {Object|null} Function metadata or null
 */
export function getFunctionInfo(funcName) {
  return FUNCTION_METADATA[funcName.toLowerCase()] || null;
}
