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
    // Shape created during init
    this.shape = null;

    // Expression metadata
    this.expressionId = -1;
    this.labelName = '';
    this.showLabel = true;

    // Styling
    this.color = '#DC3912'; // Default red

    // Label offset
    this.labelOffsetX = 0;
    this.labelOffsetY = 0;

    // Command context (set during init)
    this.commandContext = null;

    // State tracking
    this.isInitialized = false;
  }

  // ============================================
  // Lifecycle Methods
  // ============================================

  /**
   * Initialize command - must be called before play()
   * Creates shapes via commandContext.diagram
   *
   * @param {CommandContext} commandContext - Contains diagram, graphContainer, expressionContext
   */
  init(commandContext) {
    this.commandContext = commandContext;
    this.preInit();
    this.doInit();
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
   */
  doInit() {
    throw new Error('BaseCommand.doInit() must be implemented by subclass');
  }

  /**
   * Called after doInit() - override for post-initialization logic
   */
  postInit() {
    // Subclass can override
  }

  /**
   * Play the command - diagram handles animation mode internally
   */
  play() {
    if (!this.isInitialized) {
      throw new Error('Command not initialized. Call init() first.');
    }

    this.prePlay();
    this.doPlay();
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
   * Default: diagram already handled animation during init
   */
  doPlay() {
    // For most commands, the diagram handles animation in init()
    // Shape is already created and animated (or shown for static diagram)
    // Override if custom play behavior needed
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
   * Subclass can override for custom direct play logic
   * Default: render end state and show
   */
  doDirectPlay() {
    if (this.shape) {
      this.shape.renderEndState();
      this.shape.show();
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
    if (position && this.commandContext && this.commandContext.diagram) {
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
  // Getters and Setters
  // ============================================

  /**
   * Get the created shape
   * @returns {Shape|null}
   */
  getShape() {
    return this.shape;
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
