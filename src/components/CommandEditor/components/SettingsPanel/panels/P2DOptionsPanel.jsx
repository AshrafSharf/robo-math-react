import React from 'react';
import { getDefaultOptions } from '../../../utils/expressionOptionsSchema';

/**
 * P2D (Polar 2D) Options Panel
 * Options: showGrid, rMax, radialLines, concentricCircles, angleLabels
 */
const P2DOptionsPanel = ({ options, onChange }) => {
  const defaults = getDefaultOptions('p2d');
  const currentOptions = { ...defaults, ...options };

  return (
    <div className="expression-options-panel p2d-options">
      {/* Show Grid */}
      <div className="option-group">
        <label className="option-checkbox-label">
          <input
            type="checkbox"
            checked={currentOptions.showGrid}
            onChange={(e) => onChange('showGrid', e.target.checked)}
          />
          <span>Show Grid</span>
        </label>
      </div>

      {/* Show Angle Labels */}
      <div className="option-group">
        <label className="option-checkbox-label">
          <input
            type="checkbox"
            checked={currentOptions.angleLabels}
            onChange={(e) => onChange('angleLabels', e.target.checked)}
          />
          <span>Show Angle Labels</span>
        </label>
      </div>

      {/* Grid Settings Row */}
      <div className="polar-settings-row">
        <div className="compact-control">
          <label>Max r</label>
          <input
            type="number"
            value={currentOptions.rMax}
            onChange={(e) => onChange('rMax', parseFloat(e.target.value) || 10)}
            min={1}
            max={100}
            step={1}
            className="option-input-small"
          />
        </div>
        <div className="compact-control">
          <label>Radial</label>
          <input
            type="number"
            value={currentOptions.radialLines}
            onChange={(e) => onChange('radialLines', parseInt(e.target.value) || 12)}
            min={4}
            max={24}
            step={1}
            className="option-input-small"
          />
        </div>
        <div className="compact-control">
          <label>Circles</label>
          <input
            type="number"
            value={currentOptions.concentricCircles}
            onChange={(e) => onChange('concentricCircles', parseInt(e.target.value) || 5)}
            min={2}
            max={20}
            step={1}
            className="option-input-small"
          />
        </div>
      </div>
    </div>
  );
};

export default P2DOptionsPanel;
