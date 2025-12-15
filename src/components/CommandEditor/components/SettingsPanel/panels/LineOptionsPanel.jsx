import React from 'react';
import { getExpressionSchema, getDefaultOptions } from '../../../utils/expressionOptionsSchema';

/**
 * Line Options Panel (also used for Segment, Ray)
 * Options: strokeWidth, dashPattern
 */
const LineOptionsPanel = ({ options, onChange }) => {
  const schema = getExpressionSchema('line');
  const defaults = getDefaultOptions('line');
  const currentOptions = { ...defaults, ...options };

  return (
    <div className="expression-options-panel line-options">
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
        <label className="option-label">Dash Pattern</label>
        <select
          value={currentOptions.dashPattern}
          onChange={(e) => onChange('dashPattern', e.target.value)}
          className="option-select"
        >
          {schema.dashPattern.options.map(opt => (
            <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LineOptionsPanel;
