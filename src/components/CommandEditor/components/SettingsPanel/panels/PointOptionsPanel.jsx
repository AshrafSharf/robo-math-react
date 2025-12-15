import React from 'react';
import { getExpressionSchema, getDefaultOptions } from '../../../utils/expressionOptionsSchema';

/**
 * Point Options Panel
 * Options: radius
 */
const PointOptionsPanel = ({ options, onChange }) => {
  const schema = getExpressionSchema('point');
  const defaults = getDefaultOptions('point');
  const currentOptions = { ...defaults, ...options };

  return (
    <div className="expression-options-panel point-options">
      <div className="option-group">
        <label className="option-label">Radius</label>
        <input
          type="number"
          min={schema.radius.min}
          max={schema.radius.max}
          value={currentOptions.radius}
          onChange={(e) => onChange('radius', parseInt(e.target.value, 10) || schema.radius.default)}
          className="option-input"
        />
      </div>
    </div>
  );
};

export default PointOptionsPanel;
