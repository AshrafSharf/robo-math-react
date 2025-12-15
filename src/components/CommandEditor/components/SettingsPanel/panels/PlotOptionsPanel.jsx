import React from 'react';
import { getExpressionSchema, getDefaultOptions } from '../../../utils/expressionOptionsSchema';

/**
 * Plot Options Panel (used for both plot and paraplot)
 * Options: strokeWidth, samples
 */
const PlotOptionsPanel = ({ options, onChange }) => {
  const schema = getExpressionSchema('plot');
  const defaults = getDefaultOptions('plot');
  const currentOptions = { ...defaults, ...options };

  return (
    <div className="expression-options-panel plot-options">
      <div className="option-group">
        <label className="option-label">Line Width</label>
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
        <label className="option-label">Sample Points</label>
        <input
          type="number"
          min={schema.samples.min}
          max={schema.samples.max}
          step={schema.samples.step}
          value={currentOptions.samples}
          onChange={(e) => onChange('samples', parseInt(e.target.value, 10) || schema.samples.default)}
          className="option-input"
        />
        <span className="option-hint">Higher values = smoother curves</span>
      </div>
    </div>
  );
};

export default PlotOptionsPanel;
