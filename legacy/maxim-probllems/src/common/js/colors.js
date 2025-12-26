// Unified color palette for all lesson types (2D, 3D Three.js, 3D JSXGraph, 2D+3D)
// This is the single source of truth for colors across the entire codebase
export const COLORS = {
    // Core colors - Work well across all visualization types
    BLACK: '#000000',
    WHITE: '#ffffff',
    
    // Primary colors - Balanced for both 2D and 3D visibility
    RED: '#ff4444',          // Bright red (visible in 3D)
    RED_DARK: '#cc0000',     // Dark red for emphasis
    BLUE: '#4444ff',         // Bright blue (visible in 3D)
    BLUE_DARK: '#0044aa',    // Dark blue for emphasis
    GREEN: '#44ff44',        // Bright green (visible in 3D)
    GREEN_DARK: '#008800',   // Dark green for emphasis
    
    // Secondary colors
    YELLOW: '#ffff44',       // Bright yellow
    CYAN: '#44ffff',         // Bright cyan
    MAGENTA: '#ff44ff',      // Bright magenta
    ORANGE: '#ff8844',       // Bright orange
    PURPLE: '#8844ff',       // Bright purple
    
    // Neutral colors
    GRAY: '#888888',
    GRAY_LIGHT: '#cccccc',
    GRAY_LIGHTER: '#e0e0e0',
    GRAY_DARK: '#444444',
    
    // Axis colors for 3D (also used in 2D when showing axes)
    X_AXIS: '#ff0000',       // Red for X
    Y_AXIS: '#00ff00',       // Green for Y  
    Z_AXIS: '#0000ff',       // Blue for Z
    
    // Surface/fill colors with built-in transparency
    // Use these for filled regions in 2D or surfaces in 3D
    SURFACE_BLUE: '#4dabf7',    // Light blue
    SURFACE_RED: '#ff6b6b',     // Light red
    SURFACE_GREEN: '#51cf66',   // Light green
    SURFACE_YELLOW: '#ffd43b',  // Light yellow
    SURFACE_ORANGE: '#ff9f43',  // Light orange
    SURFACE_PURPLE: '#c084fc',  // Light purple
    SURFACE_CYAN: '#5eead4',    // Light cyan
    
    // Special purpose colors
    GRID: '#e0e0e0',         // Light gray for grid lines
    GRID_DARK: '#cccccc',    // Darker grid for emphasis
    TEXT: '#000000',         // Always black for labels
    HIGHLIGHT: '#fbbf24',    // Golden yellow for highlighting
    TRACE: '#ef4444',        // Bright red for tracing paths
    
    // Transparent versions (append to any color)
    // Example: COLORS.RED + COLORS.TRANSPARENT_LIGHT
    TRANSPARENT_LIGHT: '44',  // ~27% opacity
    TRANSPARENT_MEDIUM: '88', // ~53% opacity
    TRANSPARENT_HEAVY: 'CC'   // ~80% opacity
};

// Legacy aliases for backward compatibility
// These will be removed in future versions
export const FILL_BLUE = COLORS.SURFACE_BLUE;
export const FILL_YELLOW = COLORS.SURFACE_YELLOW;
export const FILL_GREEN = COLORS.SURFACE_GREEN;
export const FILL_ORANGE = COLORS.SURFACE_ORANGE;