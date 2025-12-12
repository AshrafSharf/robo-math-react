/**
 * BaseCommand - Abstract base class for all commands
 *
 * Follows the legacy pattern:
 *   init(context) -> prePlay() -> play() -> postPlay()
 *                 or
 *   directPlay() for instant rendering
 *
 * Subclasses implement:
 *   - doInit() to create shapes via diagram
 *   - doPlay() for custom play logic (optional, default shows shape)
 *   - doDirectPlay() for custom instant rendering (optional)
 *
 * The Diagram (AnimatedDiagram or Diagram) handles animation internally.
 */
export class BaseCommand {
  constructor() {
    // Result created during init (shape, graph container, etc.)
    this.commandResult = null;

    // Expression metadata
    this.expressionId = -1;
    this.labelName = '';
    this.showLabel = true;

    // Styling
    this.color = '#DC3912'; // Default red

    // Label offset
    this.labelOffsetX = 0;
    this.labelOffsetY = 0;

    // Diagram2d instance (set by CommandExecutor before init)
    this.diagram2d = null;

    // Command context (set during init) - contains shapeRegistry
    this.commandContext = null;

    // State tracking
    this.isInitialized = false;
  }

  // ============================================
  // Lifecycle Methods
  // ============================================

  /**
   * Initialize command - must be called before play()
   * Creates shapes via this.diagram2d (set by CommandExecutor)
   *
   * @param {CommandContext} commandContext - Contains diagram, graphContainer, expressionContext
   * @returns {Promise}
   */
  async init(commandContext) {
    this.commandContext = commandContext;
    this.preInit();
    await this.doInit();
    this.postInit();
    this.isInitialized = true;
  }

  /**
   * Called before doInit() - override for pre-initialization logic
   */
  preInit() {
    // Subclass can override
  }

  /**
   * Subclass implements - create shape via diagram
   * @abstract
   * @returns {Promise}
   */
  async doInit() {
    throw new Error('BaseCommand.doInit() must be implemented by subclass');
  }

  /**
   * Called after doInit() - register shape in registry if this is an assignment
   */
  postInit() {
    // Register commandResult in shapeRegistry if this command has a label
    // (labels are only set for assignment expressions like P = point(...))
    if (this.labelName && this.commandResult) {
      this.commandContext.shapeRegistry[this.labelName] = this.commandResult;
    }
  }

  /**
   * Play the command - returns Promise that resolves when animation completes
   * @returns {Promise}
   */
  async play() {
    if (!this.isInitialized) {
      throw new Error('Command not initialized. Call init() first.');
    }

    this.prePlay();
    await this.doPlay();
    this.postPlay();
  }

  /**
   * Called before doPlay() - override for pre-play logic
   */
  prePlay() {
    // Subclass can override
  }

  /**
   * Subclass can override for custom play logic
   * Default: calls playSingle() to animate the shape
   * @returns {Promise}
   */
  async doPlay() {
    return this.playSingle();
  }

  /**
   * Called after doPlay() - override for post-play logic (e.g., show labels)
   */
  postPlay() {
    // Handle label display
    if (this.showLabel && this.labelName && this.labelName.length > 0) {
      this.displayLabel();
    }
  }

  /**
   * Instant render without animation
   */
  directPlay() {
    if (!this.isInitialized) {
      // For direct play, we can auto-init
      if (this.commandContext) {
        this.init(this.commandContext);
      } else {
        throw new Error('Command context not set. Cannot directPlay.');
      }
    }

    this.doDirectPlay();
  }

  /**
   * Replay animation on existing shape (non-destructive, idempotent)
   * Override in subclasses that have animatable shapes.
   * Default is no-op (e.g., for graph containers).
   * @returns {Promise}
   */
  async playSingle() {
    // Default no-op - subclasses override if they have animations
    return Promise.resolve();
  }

  /**
   * Subclass can override for custom direct play logic
   * Default: render end state and show
   */
  doDirectPlay() {
    if (this.commandResult) {
      this.commandResult.renderEndState();
      this.commandResult.show();
    }

    // Handle label
    if (this.showLabel && this.labelName && this.labelName.length > 0) {
      this.displayLabel();
    }
  }

  // ============================================
  // Label Handling
  // ============================================

  /**
   * Display the label for this command's shape
   * Subclass can override for custom label positioning
   */
  displayLabel() {
    const position = this.getLabelPosition();
    if (position && this.diagram2d) {
      // Use diagram's label method if available
      // For now, labels are handled by the shape options
    }
  }

  /**
   * Get label position - override in subclass for custom positioning
   * @returns {{x: number, y: number}}
   */
  getLabelPosition() {
    return { x: 0, y: 0 };
  }

  /**
   * Get label position with offset applied
   * @returns {{x: number, y: number}}
   */
  getOffsetLabelPosition() {
    const pos = this.getLabelPosition();
    return {
      x: pos.x + (this.labelOffsetX || 0),
      y: pos.y + (this.labelOffsetY || 0)
    };
  }

  // ============================================
  // Cleanup
  // ============================================

  /**
   * Clear/remove the command result
   * Subclasses can override for custom cleanup logic
   */
  clear() {
    if (this.commandResult) {
      if (typeof this.commandResult.remove === 'function') {
        this.commandResult.remove();
      } else if (typeof this.commandResult.destroy === 'function') {
        this.commandResult.destroy();
      }
      this.commandResult = null;
    }
    this.isInitialized = false;
  }

  // ============================================
  // Getters and Setters
  // ============================================

  /**
   * Get the command result (shape, graph container, etc.)
   * @returns {Object|null}
   */
  getCommandResult() {
    return this.commandResult;
  }

  /**
   * Get expression ID
   * @returns {number}
   */
  getExpressionId() {
    return this.expressionId;
  }

  /**
   * Set expression ID
   * @param {number} id
   */
  setExpressionId(id) {
    this.expressionId = id;
  }

  /**
   * Get color
   * @returns {string}
   */
  getColor() {
    return this.color;
  }

  /**
   * Set color
   * @param {string} color
   */
  setColor(color) {
    this.color = color;
  }

  /**
   * Get label name
   * @returns {string}
   */
  getLabelName() {
    return this.labelName;
  }

  /**
   * Set label name
   * @param {string} name
   */
  setLabelName(name) {
    this.labelName = name;
  }

  /**
   * Get show label flag
   * @returns {boolean}
   */
  getShowLabel() {
    return this.showLabel;
  }

  /**
   * Set show label flag
   * @param {boolean} show
   */
  setShowLabel(show) {
    this.showLabel = show;
  }

  /**
   * Set label offset
   * @param {number} x
   * @param {number} y
   */
  setLabelOffset(x, y) {
    this.labelOffsetX = isNaN(x) ? 0 : x;
    this.labelOffsetY = isNaN(y) ? 0 : y;
  }

  /**
   * Set command context (allows deferred init)
   * @param {CommandContext} context
   */
  setCommandContext(context) {
    this.commandContext = context;
  }

  /**
   * Check if command is initialized
   * @returns {boolean}
   */
  getIsInitialized() {
    return this.isInitialized;
  }
}
