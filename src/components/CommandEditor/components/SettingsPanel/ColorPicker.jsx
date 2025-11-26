import React, { useState } from 'react';

const PRESET_COLORS = [
  '#990099',
  '#109618',
  '#FF9900',
  '#DC3912',
  '#3366CC',
  '#000000',
  '#DD4477',
  '#0099C6',
  '#6633CC'
];

const MORE_COLORS = [
  '#2B2301',
  '#5F9DA1',
  '#E94C6F',
  '#542733',
  '#5A6A62',
  '#1FDA9A',
  '#E74700',
  '#2B9464',
  '#F5DF65',
  '#59323C',
  '#BFF073',
  '#20457C'
];

/**
 * Color picker with preset colors and custom color input
 */
const ColorPicker = ({ selectedColor, onChange }) => {
  const [showMoreColors, setShowMoreColors] = useState(false);

  return (
    <div className="color-div">
      <div className="option-title">Color:</div>

      <ul className="color-box">
        {PRESET_COLORS.map((color) => (
          <li
            key={color}
            data-color={color}
            className={selectedColor === color ? 'glyphicon-ok selected' : ''}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
          >
            {selectedColor === color && (
              <i className="glyphicon glyphicon-ok" />
            )}
          </li>
        ))}

        {/* Custom color picker */}
        <li className="custom-color-control">
          <input
            type="color"
            id="customColor"
            value={selectedColor}
            onChange={(e) => onChange(e.target.value)}
          />
        </li>
      </ul>

      {/* More colors toggle */}
      <i
        className={`glyphicon glyphicon-chevron-${showMoreColors ? 'down' : 'right'} more-colors`}
        onClick={() => setShowMoreColors(!showMoreColors)}
        style={{ cursor: 'pointer' }}
      />

      {/* Additional colors */}
      {showMoreColors && (
        <ul className="color-box more-color-box">
          {MORE_COLORS.map((color) => (
            <li
              key={color}
              data-color={color}
              className={selectedColor === color ? 'glyphicon-ok selected' : ''}
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
            >
              {selectedColor === color && (
                <i className="glyphicon glyphicon-ok" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ColorPicker;
