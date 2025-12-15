import React from 'react';
import { getExpressionSchema, getDefaultOptions } from '../../../utils/expressionOptionsSchema';

/**
 * Vector Options Panel
 * Options: strokeWidth, arrowSize
 */
const VectorOptionsPanel = ({ options, onChange }) => {
  const schema = getExpressionSchema('vec');
  const defaults = getDefaultOptions('vec');
  const currentOptions = { ...defaults, ...options };

  return (
    <div className="expression-options-panel vector-options">
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
        <label className="option-label">Arrow Size</label>
        <input
          type="number"
          min={schema.arrowSize.min}
          max={schema.arrowSize.max}
          value={currentOptions.arrowSize}
          onChange={(e) => onChange('arrowSize', parseInt(e.target.value, 10) || schema.arrowSize.default)}
          className="option-input"
        />
      </div>
    </div>
  );
};

export default VectorOptionsPanel;
