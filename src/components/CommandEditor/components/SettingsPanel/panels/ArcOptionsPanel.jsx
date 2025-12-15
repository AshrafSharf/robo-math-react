import React from 'react';
import { getExpressionSchema, getDefaultOptions } from '../../../utils/expressionOptionsSchema';

/**
 * Arc Options Panel
 * Options: strokeWidth
 */
const ArcOptionsPanel = ({ options, onChange }) => {
  const schema = getExpressionSchema('arc');
  const defaults = getDefaultOptions('arc');
  const currentOptions = { ...defaults, ...options };

  return (
    <div className="expression-options-panel arc-options">
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
    </div>
  );
};

export default ArcOptionsPanel;
