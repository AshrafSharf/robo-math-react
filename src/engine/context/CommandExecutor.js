/**
 * CommandExecutor - Orchestrates command playback
 *
 * Manages a list of commands and provides methods for:
 *   - Playing all commands sequentially
 *   - Playing up to a specific command index
 *   - Playing a single command (with implicit dependencies via shared context)
 *   - Direct drawing (instant, no animation)
 *
 * Flow:
 *   1. setCommands(commands) - set the command list
 *   2. setCommandContext(context) - set the execution context
 *   3. playAll() / playTo(index) / playSingle(index) - execute
 */
export class CommandExecutor {
  constructor() {
    // List of commands to execute
    this.commands = [];

    // Execution context
    this.commandContext = null;

    // Current playback state
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isPaused = false;

    // Callbacks
    this.onCommandComplete = null;
    this.onAllComplete = null;
    this.onError = null;
  }

  // ============================================
  // Setup Methods
  // ============================================

  /**
   * Set the command list
   * @param {ICommand[]} commands
   */
  setCommands(commands) {
    this.commands = commands || [];
    this.currentIndex = 0;
  }

  /**
   * Add a command to the list
   * @param {ICommand} command
   */
  addCommand(command) {
    this.commands.push(command);
  }

  /**
   * Set the command context
   * @param {CommandContext} context
   */
  setCommandContext(context) {
    this.commandContext = context;
  }

  /**
   * Clear all commands
   */
  clearCommands() {
    this.commands = [];
    this.currentIndex = 0;
    this.stop();
  }

  // ============================================
  // Playback Methods
  // ============================================

  /**
   * Play all commands sequentially
   * Each command's init() is called, then play()
   */
  playAll() {
    this.currentIndex = 0;
    this.playTo(this.commands.length);
  }

  /**
   * Play commands from current index up to (but not including) toIndex
   * @param {number} toIndex - Stop before this index
   */
  playTo(toIndex) {
    if (!this.commandContext) {
      this.handleError(new Error('CommandContext not set. Call setCommandContext() first.'));
      return;
    }

    this.isPlaying = true;
    this.isPaused = false;

    const endIndex = Math.min(toIndex, this.commands.length);

    this.executeFromTo(this.currentIndex, endIndex);
  }

  /**
   * Play a single command at the given index
   * All previous commands are executed first (for dependency resolution)
   *
   * @param {number} index - Command index to play
   */
  playSingle(index) {
    if (index < 0 || index >= this.commands.length) {
      this.handleError(new Error(`Invalid command index: ${index}`));
      return;
    }

    if (!this.commandContext) {
      this.handleError(new Error('CommandContext not set. Call setCommandContext() first.'));
      return;
    }

    // Direct draw all commands before this one (for dependencies)
    this.drawTo(index);

    // Now play the target command with animation
    this.currentIndex = index;
    const command = this.commands[index];

    try {
      this.initCommand(command);
      command.play();
      this.currentIndex = index + 1;

      if (this.onCommandComplete) {
        this.onCommandComplete(command, index);
      }
    } catch (err) {
      this.handleError(err, command, index);
    }
  }

  /**
   * Execute commands from startIndex to endIndex
   * @param {number} startIndex
   * @param {number} endIndex
   */
  executeFromTo(startIndex, endIndex) {
    for (let i = startIndex; i < endIndex; i++) {
      if (this.isPaused) {
        this.currentIndex = i;
        return;
      }

      const command = this.commands[i];

      try {
        this.initCommand(command);
        command.play();

        if (this.onCommandComplete) {
          this.onCommandComplete(command, i);
        }
      } catch (err) {
        this.handleError(err, command, i);
        return; // Stop on error
      }
    }

    this.currentIndex = endIndex;
    this.isPlaying = false;

    if (this.onAllComplete && this.currentIndex >= this.commands.length) {
      this.onAllComplete();
    }
  }

  /**
   * Initialize a command with context
   * @param {ICommand} command
   */
  initCommand(command) {
    if (!command.getIsInitialized || !command.getIsInitialized()) {
      command.init(this.commandContext);
    }
  }

  // ============================================
  // Direct Draw Methods (No Animation)
  // ============================================

  /**
   * Direct draw all commands (instant, no animation)
   */
  drawAll() {
    this.drawTo(this.commands.length);
  }

  /**
   * Direct draw commands up to (but not including) toIndex
   * @param {number} toIndex
   */
  drawTo(toIndex) {
    if (!this.commandContext) {
      this.handleError(new Error('CommandContext not set. Call setCommandContext() first.'));
      return;
    }

    const endIndex = Math.min(toIndex, this.commands.length);

    for (let i = 0; i < endIndex; i++) {
      const command = this.commands[i];

      try {
        this.initCommand(command);
        command.directPlay();
      } catch (err) {
        this.handleError(err, command, i);
        return;
      }
    }

    this.currentIndex = endIndex;
  }

  // ============================================
  // Control Methods
  // ============================================

  /**
   * Pause playback
   */
  pause() {
    this.isPaused = true;
    this.isPlaying = false;
  }

  /**
   * Resume playback from current index
   */
  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.playTo(this.commands.length);
    }
  }

  /**
   * Stop playback and reset
   */
  stop() {
    this.isPaused = false;
    this.isPlaying = false;
    this.currentIndex = 0;
  }

  /**
   * Reset to beginning
   */
  reset() {
    this.stop();
  }

  // ============================================
  // State Getters
  // ============================================

  /**
   * Get current command index
   * @returns {number}
   */
  getCurrentIndex() {
    return this.currentIndex;
  }

  /**
   * Get command count
   * @returns {number}
   */
  getCommandCount() {
    return this.commands.length;
  }

  /**
   * Check if currently playing
   * @returns {boolean}
   */
  getIsPlaying() {
    return this.isPlaying;
  }

  /**
   * Check if paused
   * @returns {boolean}
   */
  getIsPaused() {
    return this.isPaused;
  }

  /**
   * Get command at index
   * @param {number} index
   * @returns {ICommand|undefined}
   */
  getCommand(index) {
    return this.commands[index];
  }

  // ============================================
  // Callbacks
  // ============================================

  /**
   * Set callback for when a command completes
   * @param {function(ICommand, number): void} callback
   */
  setOnCommandComplete(callback) {
    this.onCommandComplete = callback;
  }

  /**
   * Set callback for when all commands complete
   * @param {function(): void} callback
   */
  setOnAllComplete(callback) {
    this.onAllComplete = callback;
  }

  /**
   * Set callback for errors
   * @param {function(Error, ICommand, number): void} callback
   */
  setOnError(callback) {
    this.onError = callback;
  }

  // ============================================
  // Error Handling
  // ============================================

  /**
   * Handle error during execution
   * @param {Error} error
   * @param {ICommand} command
   * @param {number} index
   */
  handleError(error, command = null, index = -1) {
    this.isPlaying = false;

    if (this.onError) {
      this.onError(error, command, index);
    } else {
      console.error('CommandExecutor error:', error);
      if (command) {
        console.error(`  Command index: ${index}, Expression ID: ${command.getExpressionId()}`);
      }
    }
  }
}
