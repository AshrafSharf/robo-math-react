/**
 * ICommand Interface
 *
 * Defines the contract for all command classes.
 * Commands bridge Expressions to Diagram rendering.
 *
 * Lifecycle:
 *   Expression.toCommand() -> Command.init(context) -> Command.play()
 *
 * The Diagram (via CommandContext) handles whether to animate or show instantly.
 */

/**
 * @typedef {Object} ICommand
 * @property {function(CommandContext): void} init - Initialize command, create shapes via diagram
 * @property {function(): void} play - Play the command (diagram handles animation mode)
 * @property {function(): void} directPlay - Instant render without animation
 * @property {function(): Shape|null} getShape - Get the created shape
 * @property {function(): number} getExpressionId - Get associated expression ID
 * @property {function(number): void} setExpressionId - Set expression ID
 * @property {function(string): void} setColor - Set shape color
 * @property {function(): string} getColor - Get shape color
 * @property {function(string): void} setLabelName - Set label name
 * @property {function(): string} getLabelName - Get label name
 * @property {function(boolean): void} setShowLabel - Show/hide label
 * @property {function(): boolean} getShowLabel - Get label visibility
 */

// ES6 doesn't have interfaces, but we document the expected contract here.
// Implementations should follow the BaseCommand pattern.

export const ICommand = {
  // Marker for type checking
  __isCommand: true,

  /**
   * Check if an object implements ICommand
   * @param {Object} obj
   * @returns {boolean}
   */
  isCommand(obj) {
    return obj &&
      typeof obj.init === 'function' &&
      typeof obj.play === 'function' &&
      typeof obj.directPlay === 'function';
  }
};
