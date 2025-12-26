// Unified size presets for all lesson types (2D, 3D Three.js, 2D+3D)
// This is the single source of truth for sizes across the entire codebase
export const SIZES = {
    // Layout dimensions
    LAYOUT: {
        // 2D single board
        DIAGRAM_WIDTH: 600,
        PANEL_WIDTH: 400,
        
        // 2D+2D dual boards
        BOARD1_WIDTH: 333,
        BOARD2_WIDTH: 333,
        
        // 2D+3D combined
        SCENE_WIDTH: 333,
        BOARD_WIDTH: 333,
        
        // Common
        TOTAL_WIDTH: 1000,
        HEIGHT: 700
    },
    
    // Font sizes
    FONT: {
        // Labels on diagrams
        LABEL: 20,
        LABEL_SMALL: 16,
        LABEL_LARGE: 24,
        
        // Axis labels
        AXIS: 12,
        AXIS_SMALL: 10,
        AXIS_LARGE: 14,
        
        // Text elements
        TEXT: 16,
        TEXT_SMALL: 14,
        TEXT_LARGE: 18,
        
        // Titles and headers
        TITLE: 20,
        TITLE_SMALL: 18,
        TITLE_LARGE: 22,
        
        // Control panel
        CONTROL_LABEL: 14,
        CONTROL_VALUE: 16,
        CONTROL_RESULT: 18,
        CONTROL_INSTRUCTION: 14
    },
    
    // Point sizes
    POINT: {
        TINY: 2,
        SMALL: 3,
        MEDIUM: 4,
        DEFAULT: 4,
        LARGE: 6,
        XLARGE: 8
    },
    
    // Line widths
    LINE: {
        THIN: 1,
        MEDIUM: 2,
        DEFAULT: 2,
        THICK: 3,
        XTHICK: 4
    },
    
    // Arrow dimensions
    ARROW: {
        SIZE: 8,
        HEAD_LENGTH: 0.3,
        HEAD_WIDTH: 0.2,
        SHAFT_WIDTH: 0.05,
        
        // 3D specific
        THICKNESS_3D: 0.04,
        HEAD_LENGTH_3D: 0.2,
        HEAD_WIDTH_3D: 0.12
    },
    
    // Grid and tick marks
    GRID: {
        MAJOR_WIDTH: 1,
        MINOR_WIDTH: 0.5,
        TICK_SIZE: 5,
        TICK_DISTANCE: 10
    },
    
    // Standard bounding boxes for different scenarios
    BOUNDING_BOX: {
        // 2D standard boxes
        UNIT_CIRCLE: [-1.5, 1.5, 1.5, -1.5],
        SINE_WAVE: [-0.8, 1.5, 6.5, -1.5],
        STANDARD: [-2, 2, 2, -2],
        QUADRANT_I: [-0.5, 5, 5, -0.5],
        FUNCTION_PLOT: [-1, 5, 5, -1],
        
        // 3D view ranges
        VIEW_3D_STANDARD: [[-6, -3], [8, 8], [[-5, 5], [-5, 5], [-5, 5]]],
        VIEW_3D_LARGE: [[-8, -4], [10, 10], [[-8, 8], [-8, 8], [-8, 8]]]
    },
    
    // Animation speeds (milliseconds)
    ANIMATION: {
        VERY_FAST: 500,
        FAST: 1000,
        NORMAL: 2000,
        SLOW: 3000,
        VERY_SLOW: 5000
    },
    
    // Control panel specific
    CONTROL: {
        STEPPER_HEIGHT: 32,
        BUTTON_HEIGHT: 36,
        SECTION_MARGIN: 10,
        ELEMENT_MARGIN: 8,
        DIVIDER_MARGIN: 15
    }
};

// Legacy aliases for backward compatibility
// These will be removed in future versions
export const SIZE_PRESETS_2D = {
    DIAGRAM_WIDTH: SIZES.LAYOUT.DIAGRAM_WIDTH,
    PANEL_WIDTH: SIZES.LAYOUT.PANEL_WIDTH,
    TOTAL_WIDTH: SIZES.LAYOUT.TOTAL_WIDTH,
    HEIGHT: SIZES.LAYOUT.HEIGHT,
    
    LABEL_FONT: SIZES.FONT.LABEL,
    AXIS_FONT: SIZES.FONT.AXIS,
    TEXT_FONT: SIZES.FONT.TEXT,
    
    POINT_SIZE: SIZES.POINT.DEFAULT,
    LINE_WIDTH: SIZES.LINE.DEFAULT,
    ARROW_SIZE: SIZES.ARROW.SIZE,
    
    UNIT_CIRCLE_BOX: SIZES.BOUNDING_BOX.UNIT_CIRCLE,
    SINE_WAVE_BOX: SIZES.BOUNDING_BOX.SINE_WAVE,
    STANDARD_BOX: SIZES.BOUNDING_BOX.STANDARD
};

export const SIZE_PRESETS_3D = {
    POINT: {
        SMALL: SIZES.POINT.SMALL,
        MEDIUM: SIZES.POINT.MEDIUM,
        LARGE: SIZES.POINT.LARGE
    },
    LINE: {
        THIN: SIZES.LINE.THIN,
        MEDIUM: SIZES.LINE.MEDIUM,
        THICK: SIZES.LINE.THICK
    },
    ARROW: {
        HEAD_LENGTH: SIZES.ARROW.HEAD_LENGTH,
        HEAD_WIDTH: SIZES.ARROW.HEAD_WIDTH
    },
    LABEL: {
        SMALL: SIZES.FONT.AXIS,
        MEDIUM: SIZES.FONT.TEXT,
        LARGE: SIZES.FONT.LABEL,
        XLARGE: SIZES.FONT.LABEL_LARGE
    }
};

export const SIZE_PRESETS_2D2D = {
    BOARD1_WIDTH: SIZES.LAYOUT.BOARD1_WIDTH,
    BOARD2_WIDTH: SIZES.LAYOUT.BOARD2_WIDTH,
    PANEL_WIDTH: SIZES.LAYOUT.PANEL_WIDTH,
    TOTAL_WIDTH: SIZES.LAYOUT.TOTAL_WIDTH,
    HEIGHT: SIZES.LAYOUT.HEIGHT,
    
    LABEL_FONT: SIZES.FONT.TEXT_LARGE,
    AXIS_FONT: SIZES.FONT.TEXT,
    TEXT_FONT: SIZES.FONT.TEXT,
    TITLE_FONT: SIZES.FONT.TITLE,
    
    POINT_SIZE: SIZES.POINT.DEFAULT,
    LINE_WIDTH: SIZES.LINE.DEFAULT,
    ARROW_SIZE: SIZES.ARROW.SIZE,
    
    UNIT_CIRCLE_BOX: SIZES.BOUNDING_BOX.UNIT_CIRCLE,
    SINE_WAVE_BOX: SIZES.BOUNDING_BOX.SINE_WAVE,
    STANDARD_BOX: SIZES.BOUNDING_BOX.STANDARD
};

export const SIZE_PRESETS_2D3D = {
    SCENE_WIDTH: SIZES.LAYOUT.SCENE_WIDTH,
    BOARD_WIDTH: SIZES.LAYOUT.BOARD_WIDTH,
    PANEL_WIDTH: SIZES.LAYOUT.PANEL_WIDTH,
    TOTAL_WIDTH: SIZES.LAYOUT.TOTAL_WIDTH,
    HEIGHT: SIZES.LAYOUT.HEIGHT
};

// Export specific 3D JSXGraph alias
export const SIZE_PRESETS_3D_JSX = SIZE_PRESETS_3D;