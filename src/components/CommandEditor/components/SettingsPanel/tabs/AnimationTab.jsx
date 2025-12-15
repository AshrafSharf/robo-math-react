import React from 'react';
import SpeedSlider from '../SpeedSlider';

/**
 * Animation Tab - Speed slider and apply to all option
 */
const AnimationTab = ({ speed, onSpeedChange, applyToAll, onApplyToAllChange }) => {
  return (
    <div className="animation-tab">
      <SpeedSlider
        value={speed}
        onChange={onSpeedChange}
      />

      <div className="apply-all-section">
        <label className="apply-all-label">
          <input
            type="checkbox"
            checked={applyToAll || false}
            onChange={(e) => onApplyToAllChange && onApplyToAllChange(e.target.checked)}
          />
          <span>Apply this speed to all</span>
        </label>
      </div>
    </div>
  );
};

export default AnimationTab;
