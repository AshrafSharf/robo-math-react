/**
 * SelectKatexCommand - Extracts portions from KaTeX-rendered math
 *
 * Uses \htmlClass{robo-select}{...} to mark patterns, then extracts
 * the marked DOM elements into KatexTextItems.
 */
import { BaseCommand } from './BaseCommand.js';
import { KatexLatexWrapper } from '../../mathtext/katex/katex-latex-wrapper.js';
import { KatexBoundsExtractor } from '../../mathtext/katex/katex-bounds-extractor.js';
import { KatexTextItem } from '../../mathtext/katex/katex-text-item.js';
import { KatexTextItemCollection } from '../../mathtext/katex/katex-text-item-collection.js';

export class SelectKatexCommand extends BaseCommand {
  /**
   * Create a select katex command
   * @param {Object} options - { targetVariableName, includePatterns, expression }
   */
  constructor(options = {}) {
    super();
    this.options = options;
    this.katexComponent = null;
    this.collection = null;
  }

  async doInit() {
    // 1. Get source expression and its KatexComponent
    const sourceExpr = this.commandContext.expressionContext.getReference(
      this.options.targetVariableName
    );

    if (!sourceExpr) {
      throw new Error(`SelectKatexCommand: Variable "${this.options.targetVariableName}" not found`);
    }

    this.katexComponent = sourceExpr.getKatexComponent();

    if (!this.katexComponent) {
      throw new Error(`SelectKatexCommand: "${this.options.targetVariableName}" has no KatexComponent`);
    }

    // 2. Re-render with patterns wrapped in \htmlClass{robo-select}{...}
    const originalContent = this.katexComponent.getContent();
    const wrappedLatex = KatexLatexWrapper.wrapMultiple(
      originalContent,
      this.options.includePatterns
    );

    // Update component with wrapped content to get marked elements
    this.katexComponent.updateContent(wrappedLatex);

    // 3. Ensure container is visible and force reflow for accurate bounds
    const container = this.katexComponent.containerDOM;
    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    // Force synchronous layout
    // eslint-disable-next-line no-unused-expressions
    container.offsetHeight;

    // 4. Extract marked elements
    const markedElements = KatexBoundsExtractor.getMarkedElements(container);

    // 5. Create KatexTextItems
    this.collection = new KatexTextItemCollection();
    markedElements.forEach((el, i) => {
      const pattern = this.options.includePatterns[i] || '';
      this.collection.add(new KatexTextItem(this.katexComponent, el, pattern));
    });

    // 6. Store in expression
    if (this.options.expression) {
      this.options.expression.setCollection(this.collection);
      this.commandResult = this.options.expression.getResolvedValue();
    }

    // Note: We keep the wrapped content so element references remain valid
    // The \htmlClass wrapper is invisible and doesn't affect rendering
  }

  async playSingle() {
    // No animation for select - it's a data extraction command
    return Promise.resolve();
  }

  doDirectPlay() {
    // No-op
  }

  clear() {
    this.katexComponent = null;
    this.collection = null;
    this.commandResult = null;
    this.isInitialized = false;
  }
}
