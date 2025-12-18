import React from 'react';
import ColorPicker from '../ColorPicker';
import { getStyleType } from '../../../utils/expressionOptionsSchema';

// Preset values for stroke width
const STROKE_WIDTH_PRESETS = [0.5, 1, 1.5, 2, 3, 4, 5, 6];

// Preset values for opacity
const OPACITY_PRESETS = [0, 0.25, 0.5, 0.75, 1];

// Preset values for font size
const FONT_SIZE_PRESETS = [16, 22, 28, 36, 48, 64];

/**
 * Style Tab - Renders different UI based on style type
 * - stroke: color + strokeWidth + opacity
 * - fill: single color (applies to both stroke and fill)
 * - strokeFill: stroke color + fill color + opacities
 * - font: fontSize + fontColor
 * - null: no style controls
 */
const StyleTab = ({ command, expressionType, expressionOptions = {}, onUpdate, onColorChange, onFillColorChange, onStrokeWidthChange, onStrokeOpacityChange, onFillOpacityChange, onFontSizeChange }) => {
  const strokeColor = command.color || '#DC3912';
  const fillColor = command.fillColor || 'none';
  const strokeWidth = command.strokeWidth ?? 2;
  const strokeOpacity = command.strokeOpacity ?? 1;
  const fillOpacity = command.fillOpacity ?? 1;
  const hasFill = fillColor && fillColor !== 'none' && fillColor !== 'transparent';

  const styleType = getStyleType(expressionType);

  // No style controls for this expression type
  if (!styleType) {
    return (
      <div className="style-tab compact">
        <p className="no-style-message">No style options for this expression</p>
      </div>
    );
  }

  // fill: single color picker + opacity (for point - sets both stroke and fill)
  if (styleType === 'fill') {
    return (
      <div className="style-tab compact">
        <ColorPicker
          selectedColor={strokeColor}
          onChange={(color) => {
            if (onColorChange) onColorChange(color);
            if (onFillColorChange) onFillColorChange(color);
          }}
          label="Color:"
        />
        <div className="compact-controls-row">
          <div className="compact-control opacity-presets">
            <label>Opacity</label>
            <div className="preset-buttons">
              {OPACITY_PRESETS.map(o => (
                <button
                  key={o}
                  type="button"
                  className={`preset-btn ${fillOpacity === o ? 'active' : ''}`}
                  onClick={() => {
                    // Apply to both fill and stroke opacity for points
                    if (onFillOpacityChange) onFillOpacityChange(o);
                    if (onStrokeOpacityChange) onStrokeOpacityChange(o);
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // stroke: color + strokeWidth + opacity (for line, segment, ray, vec, arc, plot)
  if (styleType === 'stroke') {
    return (
      <div className="style-tab compact">
        <ColorPicker
          selectedColor={strokeColor}
          onChange={onColorChange || ((color) => onUpdate({ color }))}
          label="Color:"
        />
        <div className="compact-controls-row">
          <div className="compact-control width-presets">
            <label>Width</label>
            <div className="preset-buttons">
              {STROKE_WIDTH_PRESETS.map(w => (
                <button
                  key={w}
                  type="button"
                  className={`preset-btn ${strokeWidth === w ? 'active' : ''}`}
                  onClick={() => {
                    if (onStrokeWidthChange) onStrokeWidthChange(w);
                  }}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="compact-controls-row">
          <div className="compact-control opacity-presets">
            <label>Opacity</label>
            <div className="preset-buttons">
              {OPACITY_PRESETS.map(o => (
                <button
                  key={o}
                  type="button"
                  className={`preset-btn ${strokeOpacity === o ? 'active' : ''}`}
                  onClick={() => {
                    if (onStrokeOpacityChange) onStrokeOpacityChange(o);
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // font: fontSize + fontColor (for label, mathtext, write, writeonly, writewithout)
  if (styleType === 'font') {
    // Get fontSize from expression options (registry) or fall back to defaults
    const defaultSize = expressionType === 'mathtext' ? 22 : 16;
    const fontSize = expressionOptions.fontSize ?? defaultSize;
    return (
      <div className="style-tab compact">
        <ColorPicker
          selectedColor={strokeColor}
          onChange={onColorChange || ((color) => onUpdate({ color }))}
          label="Color:"
        />
        <div className="compact-controls-row">
          <div className="compact-control width-presets">
            <label>Size</label>
            <div className="preset-buttons">
              {FONT_SIZE_PRESETS.map(size => (
                <button
                  key={size}
                  type="button"
                  className={`preset-btn ${fontSize === size ? 'active' : ''}`}
                  onClick={() => {
                    if (onFontSizeChange) {
                      onFontSizeChange(size);
                    } else {
                      onUpdate({ fontSize: size });
                    }
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // strokeFill: stroke color + fill color + opacities (for circle, polygon, ellipse, angle)
  return (
    <div className="style-tab compact">
      <ColorPicker
        selectedColor={strokeColor}
        onChange={onColorChange || ((color) => onUpdate({ color }))}
        label="Stroke:"
      />
      <ColorPicker
        selectedColor={fillColor}
        onChange={onFillColorChange || ((fillColor) => onUpdate({ fillColor }))}
        label="Fill:"
        allowNone={true}
      />
      <div className="compact-controls-row">
        <div className="compact-control width-presets">
          <label>Width</label>
          <div className="preset-buttons">
            {STROKE_WIDTH_PRESETS.map(w => (
              <button
                key={w}
                type="button"
                className={`preset-btn ${strokeWidth === w ? 'active' : ''}`}
                onClick={() => {
                  if (onStrokeWidthChange) onStrokeWidthChange(w);
                }}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="compact-controls-row">
        <div className="compact-control opacity-presets">
          <label>Stroke</label>
          <div className="preset-buttons">
            {OPACITY_PRESETS.map(o => (
              <button
                key={o}
                type="button"
                className={`preset-btn ${strokeOpacity === o ? 'active' : ''}`}
                onClick={() => {
                  if (onStrokeOpacityChange) onStrokeOpacityChange(o);
                }}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
        <div className="compact-control opacity-presets">
          <label>Fill</label>
          <div className="preset-buttons">
            {OPACITY_PRESETS.map(o => (
              <button
                key={o}
                type="button"
                className={`preset-btn ${fillOpacity === o ? 'active' : ''}`}
                onClick={() => onUpdate({ fillOpacity: o })}
                disabled={!hasFill}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleTab;
