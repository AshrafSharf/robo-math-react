/**
 * Style Helper for Diagram classes
 * Contains color definitions, CSS definitions, and style utilities
 */

// Color map for common color names
export const COLOR_MAP = {
  'red': '#ff0000',
  'green': '#00ff00',
  'blue': '#0000ff',
  'yellow': '#ffff00',
  'cyan': '#00ffff',
  'magenta': '#ff00ff',
  'white': '#ffffff',
  'black': '#000000',
  'gray': '#808080',
  'grey': '#808080',
  'orange': '#ffa500',
  'purple': '#800080',
  'violet': '#ee82ee',
  'pink': '#ffc0cb',
  'brown': '#a52a2a',
  'lightblue': '#add8e6',
  'darkblue': '#00008b',
  'lightgreen': '#90ee90',
  'darkgreen': '#006400'
};

// Animation type mappings for messages
export const ANIMATION_TYPE_MAP = {
  'fade': 'f',
  'slide-left': 'l',
  'slide-right': 'r',
  'slide-top': 't',
  'slide-bottom': 'b',
  'center': 'c',
  'width': 'w'
};

// Default CSS styles for different message types
export const MESSAGE_STYLES = {
  note: {
    'background': 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
    'border-radius': '8px',
    'box-shadow': '0 4px 8px rgba(0, 0, 0, 0.1)',
    'padding': '12px',
    'font-size': '16px',
    'color': '#2c3e50'
  },
  alert: {
    'background': 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
    'border-radius': '8px',
    'box-shadow': '0 4px 12px rgba(255, 0, 0, 0.2)',
    'padding': '12px',
    'font-size': '16px',
    'color': 'white',
    'font-weight': 'bold'
  },
  success: {
    'background': 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
    'border-radius': '8px',
    'box-shadow': '0 4px 8px rgba(0, 255, 0, 0.2)',
    'padding': '12px',
    'font-size': '16px',
    'color': 'white'
  }
};

// Default shape colors (hex values)
export const DEFAULT_SHAPE_COLORS = {
  point: '#ff0000',
  vector: '#ff0000',
  line: '#000000',
  plot: '#00ff00',
  circle: '#0000ff',
  ellipse: '#ff0000',
  arc: '#00ff00',
  polygon: '#ffa500',
  curve: '#ee82ee',
  arrow: '#ff0000',
  angle: '#ffa500'
};

/**
 * Get animation type code
 * @param {string} animationType - Animation type name
 * @returns {string} Animation type code
 */
export function getAnimationType(animationType) {
  return ANIMATION_TYPE_MAP[animationType] || animationType || 'f';
}

/**
 * Get message style preset
 * @param {string} type - Message type ('note', 'alert', 'success')
 * @returns {Object} CSS style object
 */
export function getMessageStyle(type) {
  return MESSAGE_STYLES[type] || {};
}

/**
 * Get default shape color
 * @param {string} shapeType - Type of shape
 * @returns {string} Default hex color for the shape
 */
export function getDefaultShapeColor(shapeType) {
  return DEFAULT_SHAPE_COLORS[shapeType] || '#000000';
}