import React from 'react';
import { getExpressionSchema, getDefaultOptions } from '../../../utils/expressionOptionsSchema';

/**
 * Polygon Options Panel
 * Options: strokeWidth, fill, fillOpacity
 */
const PolygonOptionsPanel = ({ options, onChange }) => {
  const schema = getExpressionSchema('polygon');
  const defaults = getDefaultOptions('polygon');
  const currentOptions = { ...defaults, ...options };

  return (
    <div className="expression-options-panel polygon-options">
      <div className="option-group">
        <label className="option-label">Stroke Width</label>
        <input
          type="number"
          min={schema.strokeWidth.min}
          max={schema.strokeWidth.max}
          value={currentOptions.strokeWidth}
          onChange={(e) => onChange('strokeWidth', parseInt(e.target.value, 10) || schema.strokeWidth.default)}
          className="option-input"
        />
      </div>

      <div className="option-group">
        <label className="option-label">Fill Color</label>
        <div className="color-input-wrapper">
          <input
            type="color"
            value={currentOptions.fill === 'none' ? '#ffffff' : currentOptions.fill}
            onChange={(e) => onChange('fill', e.target.value)}
            className="option-color-input"
          />
          <label className="option-checkbox-label inline">
            <input
              type="checkbox"
              checked={currentOptions.fill !== 'none'}
              onChange={(e) => onChange('fill', e.target.checked ? '#FF9900' : 'none')}
            />
            <span>Enable</span>
          </label>
        </div>
      </div>

      {currentOptions.fill !== 'none' && (
        <div className="option-group">
          <label className="option-label">Fill Opacity</label>
          <input
            type="range"
            min={schema.fillOpacity.min}
            max={schema.fillOpacity.max}
            step={schema.fillOpacity.step}
            value={currentOptions.fillOpacity}
            onChange={(e) => onChange('fillOpacity', parseFloat(e.target.value))}
            className="option-slider"
          />
          <span className="option-value">{(currentOptions.fillOpacity * 100).toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
};

export default PolygonOptionsPanel;
