import { Bounds2 } from '../geom/Bounds2.js';

export class MessageGridHelper {
  constructor() {
    this.activeMessages = new Map();
    this.defaultSpacing = 10;
    this.defaultMessageSize = { width: 200, height: 60 };
  }

  /**
   * Get position for a new message based on reference and position hint
   * @param {string} messageId - Unique identifier for the message
   * @param {Object|null} referenceMessage - Reference message object or null for absolute positioning
   * @param {string} positionHint - Position hint: 'below', 'above', 'left', 'right' (default 'below')
   * @param {Object} messageSize - Size of the new message {width, height}
   * @param {Object} absolutePosition - Fallback position if no reference {x, y}
   * @returns {Object} Position {x, y} for the new message
   */
  getMessagePosition(messageId, referenceMessage, positionHint = 'below', messageSize = null, absolutePosition = null) {
    const size = messageSize || this.defaultMessageSize;
    
    // If no reference, use absolute position or default
    if (!referenceMessage) {
      const position = absolutePosition || { x: 100, y: 100 };
      this.activeMessages.set(messageId, {
        bounds: Bounds2.rect(position.x, position.y, size.width, size.height),
        referenceId: null
      });
      return position;
    }

    // Get reference message bounds
    let referenceBounds;
    if (referenceMessage.bounds) {
      referenceBounds = referenceMessage.bounds;
    } else if (referenceMessage.messageModel && referenceMessage.messageModel.bounds) {
      referenceBounds = referenceMessage.messageModel.bounds;
    } else if (this.activeMessages.has(referenceMessage.id)) {
      referenceBounds = this.activeMessages.get(referenceMessage.id).bounds;
    } else {
      // If reference message doesn't have bounds, treat as no reference
      const position = absolutePosition || { x: 100, y: 100 };
      this.activeMessages.set(messageId, {
        bounds: Bounds2.rect(position.x, position.y, size.width, size.height),
        referenceId: null
      });
      return position;
    }

    // Calculate position based on hint and reference bounds
    let position = this.calculateRelativePosition(referenceBounds, positionHint, size);

    // Check for stacking - find all messages with same reference and position hint
    const stackedMessages = this.findStackedMessages(referenceMessage.id || referenceMessage, positionHint);
    
    if (stackedMessages.length > 0) {
      position = this.adjustForStacking(position, positionHint, size, stackedMessages);
    }

    // Store this message's bounds
    this.activeMessages.set(messageId, {
      bounds: Bounds2.rect(position.x, position.y, size.width, size.height),
      referenceId: referenceMessage.id || referenceMessage,
      positionHint: positionHint
    });

    return position;
  }

  /**
   * Calculate relative position based on reference bounds and hint
   * @private
   */
  calculateRelativePosition(referenceBounds, positionHint, messageSize) {
    const spacing = this.defaultSpacing;
    let position = { x: 0, y: 0 };

    switch(positionHint.toLowerCase()) {
      case 'below':
        position.x = referenceBounds.centerX - messageSize.width / 2;
        position.y = referenceBounds.bottom + spacing;
        break;
        
      case 'above':
        position.x = referenceBounds.centerX - messageSize.width / 2;
        position.y = referenceBounds.top - messageSize.height - spacing;
        break;
        
      case 'left':
        position.x = referenceBounds.left - messageSize.width - spacing;
        position.y = referenceBounds.centerY - messageSize.height / 2;
        break;
        
      case 'right':
        position.x = referenceBounds.right + spacing;
        position.y = referenceBounds.centerY - messageSize.height / 2;
        break;
        
      case 'top-left':
        position.x = referenceBounds.left;
        position.y = referenceBounds.top - messageSize.height - spacing;
        break;
        
      case 'top-right':
        position.x = referenceBounds.right - messageSize.width;
        position.y = referenceBounds.top - messageSize.height - spacing;
        break;
        
      case 'bottom-left':
        position.x = referenceBounds.left;
        position.y = referenceBounds.bottom + spacing;
        break;
        
      case 'bottom-right':
        position.x = referenceBounds.right - messageSize.width;
        position.y = referenceBounds.bottom + spacing;
        break;
        
      default:
        // Default to below
        position.x = referenceBounds.centerX - messageSize.width / 2;
        position.y = referenceBounds.bottom + spacing;
    }

    return position;
  }

  /**
   * Find all messages that are stacked with the same reference and position hint
   * @private
   */
  findStackedMessages(referenceId, positionHint) {
    const stacked = [];
    for (const [msgId, msgData] of this.activeMessages) {
      if (msgData.referenceId === referenceId && msgData.positionHint === positionHint) {
        stacked.push(msgData);
      }
    }
    return stacked;
  }

  /**
   * Adjust position for stacking when multiple messages share same reference/hint
   * @private
   */
  adjustForStacking(basePosition, positionHint, messageSize, stackedMessages) {
    const spacing = this.defaultSpacing;
    let adjustedPosition = { ...basePosition };

    // Get the last stacked message
    const lastMessage = stackedMessages[stackedMessages.length - 1];
    const lastBounds = lastMessage.bounds;

    switch(positionHint.toLowerCase()) {
      case 'below':
      case 'bottom-left':
      case 'bottom-right':
        // Stack vertically downward
        adjustedPosition.y = lastBounds.bottom + spacing;
        break;
        
      case 'above':
      case 'top-left':
      case 'top-right':
        // Stack vertically upward
        adjustedPosition.y = lastBounds.top - messageSize.height - spacing;
        break;
        
      case 'left':
        // Stack horizontally leftward
        adjustedPosition.x = lastBounds.left - messageSize.width - spacing;
        break;
        
      case 'right':
        // Stack horizontally rightward
        adjustedPosition.x = lastBounds.right + spacing;
        break;
    }

    return adjustedPosition;
  }

  /**
   * Clear a specific message from tracking
   * @param {string} messageId - ID of message to clear
   */
  clearMessage(messageId) {
    this.activeMessages.delete(messageId);
  }

  /**
   * Clear multiple messages
   * @param {Array<string>} messageIds - Array of message IDs to clear
   */
  clearMessages(messageIds) {
    if (Array.isArray(messageIds)) {
      messageIds.forEach(id => this.clearMessage(id));
    }
  }

  /**
   * Clear all tracked messages
   */
  clearAll() {
    this.activeMessages.clear();
  }

  /**
   * Get all active message bounds for collision detection
   * @returns {Map} Map of messageId -> message data
   */
  getActiveMessages() {
    return this.activeMessages;
  }

  /**
   * Check if a position would overlap with existing messages
   * @param {Object} bounds - Bounds2 object to check
   * @returns {boolean} True if overlap exists
   */
  hasOverlap(bounds) {
    for (const [msgId, msgData] of this.activeMessages) {
      if (msgData.bounds.intersectsBounds(bounds)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Set default spacing between messages
   * @param {number} spacing - Spacing in pixels
   */
  setDefaultSpacing(spacing) {
    this.defaultSpacing = spacing;
  }

  /**
   * Set default message size
   * @param {Object} size - Default size {width, height}
   */
  setDefaultMessageSize(size) {
    this.defaultMessageSize = size;
  }
}