import React, { useState, useRef } from 'react';

/**
 * All colors in a single array for carousel
 * Note: No white at start or end of array
 */
const ALL_COLORS = [
  '#DC3912',  // dark-red (default)
  '#FF0000',  // red
  '#FF9900',  // orange
  '#FFD700',  // yellow
  '#109618',  // green
  '#90EE90',  // light green
  '#0099C6',  // teal
  '#3366CC',  // blue
  '#4169E1',  // royal blue
  '#6633CC',  // violet
  '#990099',  // purple
  '#DD4477',  // pink
  '#FF00FF',  // magenta
  '#8B4513',  // brown
  '#000000',  // black
];

const VISIBLE_COUNT = 9; // Number of colors visible at once

/**
 * Color picker carousel with arrows
 * @param {string} selectedColor - Currently selected color
 * @param {function} onChange - Callback when color changes
 * @param {string} label - Label to display (default: "Color:")
 * @param {boolean} allowNone - Whether to show a "none" option (for fill colors)
 */
const ColorPicker = ({ selectedColor, onChange, label = "Color:", allowNone = false }) => {
  const [scrollIndex, setScrollIndex] = useState(0);
  const customColorRef = useRef(null);

  // Build colors array with optional "none" at start
  const colors = allowNone ? ['none', ...ALL_COLORS] : ALL_COLORS;
  const maxScroll = Math.max(0, colors.length - VISIBLE_COUNT);

  const scrollLeft = () => {
    setScrollIndex(Math.max(0, scrollIndex - 1));
  };

  const scrollRight = () => {
    setScrollIndex(Math.min(maxScroll, scrollIndex + 1));
  };

  // Get visible colors based on scroll position
  const visibleColors = colors.slice(scrollIndex, scrollIndex + VISIBLE_COUNT);

  const canScrollLeft = scrollIndex > 0;
  const canScrollRight = scrollIndex < maxScroll;

  // Get current color for the custom picker display
  const currentColorValue = selectedColor && selectedColor !== 'none' && selectedColor !== 'transparent'
    ? selectedColor
    : '#000000';

  const openCustomPicker = () => {
    customColorRef.current?.click();
  };

  return (
    <div className="color-picker-container">
      {/* Header row: Label + Custom color picker */}
      <div className="color-picker-header">
        <span className="color-picker-label">{label}</span>
        <button
          className="custom-color-btn"
          onClick={openCustomPicker}
          title="Pick custom color"
        >
          <span className="color-preview" style={{ backgroundColor: currentColorValue }}></span>
          <span className="picker-icon">+</span>
          <input
            ref={customColorRef}
            type="color"
            value={currentColorValue}
            onChange={(e) => onChange(e.target.value)}
            className="hidden-color-input"
          />
        </button>
      </div>

      {/* Color carousel */}
      <div className="color-carousel">
        <button
          className={`carousel-arrow ${!canScrollLeft ? 'disabled' : ''}`}
          onClick={scrollLeft}
          disabled={!canScrollLeft}
        >
          &#8249;
        </button>

        <ul className="color-box color-row">
          {visibleColors.map((color) => (
            <li
              key={color}
              className={`color-swatch ${color === 'none' ? 'none-swatch' : ''}`}
              style={color !== 'none' ? { backgroundColor: color } : undefined}
              onClick={() => onChange(color)}
              title={color === 'none' ? 'No fill' : color}
            />
          ))}
        </ul>

        <button
          className={`carousel-arrow ${!canScrollRight ? 'disabled' : ''}`}
          onClick={scrollRight}
          disabled={!canScrollRight}
        >
          &#8250;
        </button>
      </div>
    </div>
  );
};

export default ColorPicker;
