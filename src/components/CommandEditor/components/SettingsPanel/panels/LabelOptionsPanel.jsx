import React from 'react';
import { getExpressionSchema, getDefaultOptions } from '../../../utils/expressionOptionsSchema';

/**
 * Label Options Panel
 * Options: fontSize, fontColor
 */
const LabelOptionsPanel = ({ options, onChange }) => {
  const schema = getExpressionSchema('label');
  const defaults = getDefaultOptions('label');
  const currentOptions = { ...defaults, ...options };

  return (
    <div className="expression-options-panel label-options">
      <div className="option-group">
        <label className="option-label">Font Size</label>
        <input
          type="number"
          min={schema.fontSize.min}
          max={schema.fontSize.max}
          value={currentOptions.fontSize}
          onChange={(e) => onChange('fontSize', parseInt(e.target.value, 10) || schema.fontSize.default)}
          className="option-input"
        />
      </div>

      <div className="option-group">
        <label className="option-label">Font Color</label>
        <input
          type="color"
          value={currentOptions.fontColor}
          onChange={(e) => onChange('fontColor', e.target.value)}
          className="option-color-input"
        />
      </div>
    </div>
  );
};

export default LabelOptionsPanel;
