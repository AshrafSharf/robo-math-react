import React, { useState, useRef } from 'react';
import { getDefaultOptions } from '../../../utils/expressionOptionsSchema';

// Preset values for divisions
const DIVISION_PRESETS = [4, 5, 10, 20];

// Preset values for ranges [min, max, label] - for linear/pi scales
const RANGE_PRESETS_LINEAR = [
  [-10, 10, '±10'],
  [-5, 5, '±5'],
  [0, 10, '0-10'],
  [-1, 1, '±1'],
];

// Preset values for ranges [min, max, label] - for log scale (positive values only)
const RANGE_PRESETS_LOG = [
  [0.1, 100, '.1-100'],
  [1, 100, '1-100'],
  [1, 1000, '1-1k'],
  [0.01, 10, '.01-10'],
];

// Preset values for pi intervals [value, label]
const PI_PRESETS = [
  ['2pi', '2π'],
  ['pi', 'π'],
  ['pi/2', 'π/2'],
  ['pi/4', 'π/4'],
  ['pi/6', 'π/6'],
];

// Preset values for log base [value, label]
const LOG_PRESETS = [
  ['10', '10'],
  ['e', 'e'],
  ['2', '2'],
];

/**
 * G2D (Graph 2D) Options Panel
 */
const G2DOptionsPanel = ({ options, onChange }) => {
  const defaults = getDefaultOptions('g2d');
  const [activeAxis, setActiveAxis] = useState('x');
  const [localValues, setLocalValues] = useState({});
  const customDivInputRef = useRef(null);

  const axis = activeAxis;
  const scaleType = options[`${axis}ScaleType`] || defaults[`${axis}ScaleType`] || 'linear';

  // Get display value - local state takes priority for free typing
  const getDisplayValue = (key) => {
    if (localValues[key] !== undefined) return localValues[key];
    return options[key] !== undefined ? options[key] : defaults[key];
  };

  // Get current divisions value
  const currentDivisions = getDisplayValue(`${axis}Divisions`);
  const isCustomDivision = !DIVISION_PRESETS.includes(currentDivisions);

  // Get current range values
  const currentMin = getDisplayValue(`${axis}Min`);
  const currentMax = getDisplayValue(`${axis}Max`);

  // Get appropriate range presets based on scale type
  const rangePresets = scaleType === 'log' ? RANGE_PRESETS_LOG : RANGE_PRESETS_LINEAR;

  // Check if current range matches a preset
  const getActiveRangePreset = () => {
    for (const [min, max] of rangePresets) {
      if (currentMin === min && currentMax === max) return `${min},${max}`;
    }
    return null;
  };
  const activeRangePreset = getActiveRangePreset();

  // Handle range preset click
  const handleRangePreset = (min, max) => {
    onChange(`${axis}Min`, min);
    onChange(`${axis}Max`, max);
  };

  // Handle typing - update local state, commit if valid number
  const handleInputChange = (key, value) => {
    setLocalValues(prev => ({ ...prev, [key]: value }));
    if (value !== '' && value !== '-') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        onChange(key, parsed);
      }
    }
  };

  // Handle blur - reset to default if empty, clear local state
  const handleInputBlur = (key) => {
    const value = localValues[key];
    if (value !== undefined) {
      if (value === '' || value === '-') {
        onChange(key, defaults[key]);
      } else if (scaleType === 'log' && (key === `${axis}Min` || key === `${axis}Max`)) {
        // For log scale, ensure positive values
        const parsed = parseFloat(value);
        if (isNaN(parsed) || parsed <= 0) {
          onChange(key, key.includes('Min') ? 0.1 : 100);
        }
      }
      setLocalValues(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // Handle division preset click
  const handleDivisionPreset = (value) => {
    onChange(`${axis}Divisions`, value);
  };

  // Handle custom division input
  const handleCustomDivisionChange = (e) => {
    const value = e.target.value;
    setLocalValues(prev => ({ ...prev, [`${axis}Divisions`]: value }));
    if (value !== '') {
      const parsed = parseInt(value, 10);
      if (!isNaN(parsed) && parsed > 0) {
        onChange(`${axis}Divisions`, parsed);
      }
    }
  };

  const handleCustomDivisionBlur = () => {
    const key = `${axis}Divisions`;
    const value = localValues[key];
    if (value !== undefined) {
      if (value === '' || parseInt(value, 10) <= 0) {
        onChange(key, defaults[key]);
      }
      setLocalValues(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  return (
    <div className="g2d-panel">
      {/* Top row: Grid checkbox + axis toggle */}
      <div className="g2d-top-row">
        <label className="g2d-grid-toggle">
          <input
            type="checkbox"
            checked={options.showGrid !== undefined ? options.showGrid : defaults.showGrid}
            onChange={(e) => onChange('showGrid', e.target.checked)}
          />
          Grid
        </label>
        <div className="g2d-axis-toggle">
          <button
            type="button"
            className={activeAxis === 'x' ? 'active' : ''}
            onClick={() => setActiveAxis('x')}
          >
            X-Axis
          </button>
          <button
            type="button"
            className={activeAxis === 'y' ? 'active' : ''}
            onClick={() => setActiveAxis('y')}
          >
            Y-Axis
          </button>
        </div>
      </div>

      {/* Axis controls */}
      <div className="g2d-controls">
        {/* Scale type row - first */}
        <div className="g2d-row g2d-scale-row">
          <label>Scale</label>
          <div className="g2d-scale-toggle">
            <button
              type="button"
              className={scaleType === 'linear' ? 'active' : ''}
              onClick={() => onChange(`${axis}ScaleType`, 'linear')}
            >
              Linear
            </button>
            <button
              type="button"
              className={scaleType === 'pi' ? 'active' : ''}
              onClick={() => onChange(`${axis}ScaleType`, 'pi')}
            >
              π
            </button>
            <button
              type="button"
              className={scaleType === 'log' ? 'active' : ''}
              onClick={() => {
                onChange(`${axis}ScaleType`, 'log');
                // Auto-adjust range to positive values if current range includes non-positive
                const min = getDisplayValue(`${axis}Min`);
                const max = getDisplayValue(`${axis}Max`);
                if (min <= 0 || max <= 0) {
                  onChange(`${axis}Min`, 0.1);
                  onChange(`${axis}Max`, 100);
                }
              }}
            >
              Log
            </button>
          </div>
        </div>

        {/* Range presets row */}
        <div className="g2d-row g2d-range-row">
          <label>Range</label>
          <div className={`g2d-presets ${scaleType === 'log' ? 'g2d-presets-wrap' : ''}`}>
            {rangePresets.map(([min, max, label]) => (
              <button
                key={`${min},${max}`}
                type="button"
                className={`g2d-preset-btn ${activeRangePreset === `${min},${max}` ? 'active' : ''}`}
                onClick={() => handleRangePreset(min, max)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {/* Custom range inputs row */}
        <div className="g2d-row g2d-custom-range-row">
          <label>Custom</label>
          <input
            type="text"
            className={`g2d-range-input ${!activeRangePreset ? 'active' : ''}`}
            value={localValues[`${axis}Min`] !== undefined ? localValues[`${axis}Min`] : currentMin}
            onChange={(e) => handleInputChange(`${axis}Min`, e.target.value)}
            onBlur={() => handleInputBlur(`${axis}Min`)}
          />
          <span className="g2d-to">to</span>
          <input
            type="text"
            className={`g2d-range-input ${!activeRangePreset ? 'active' : ''}`}
            value={localValues[`${axis}Max`] !== undefined ? localValues[`${axis}Max`] : currentMax}
            onChange={(e) => handleInputChange(`${axis}Max`, e.target.value)}
            onBlur={() => handleInputBlur(`${axis}Max`)}
          />
        </div>

        {scaleType === 'linear' && (
          <div className="g2d-row g2d-divisions-row">
            <label>Divisions</label>
            <div className="g2d-presets">
              {DIVISION_PRESETS.map(val => (
                <button
                  key={val}
                  type="button"
                  className={`g2d-preset-btn ${currentDivisions === val ? 'active' : ''}`}
                  onClick={() => handleDivisionPreset(val)}
                >
                  {val}
                </button>
              ))}
              <input
                ref={customDivInputRef}
                type="text"
                className={`g2d-custom-input ${isCustomDivision ? 'active' : ''}`}
                placeholder="#"
                value={isCustomDivision ? (localValues[`${axis}Divisions`] !== undefined ? localValues[`${axis}Divisions`] : currentDivisions) : ''}
                onChange={handleCustomDivisionChange}
                onBlur={handleCustomDivisionBlur}
                onFocus={() => {
                  if (!isCustomDivision) {
                    setLocalValues(prev => ({ ...prev, [`${axis}Divisions`]: '' }));
                  }
                }}
              />
            </div>
          </div>
        )}

        {scaleType === 'pi' && (
          <div className="g2d-row g2d-pi-row">
            <label>Interval</label>
            <div className="g2d-presets">
              {PI_PRESETS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`g2d-preset-btn ${(options[`${axis}PiMultiplier`] || defaults[`${axis}PiMultiplier`]) === value ? 'active' : ''}`}
                  onClick={() => onChange(`${axis}PiMultiplier`, value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {scaleType === 'log' && (
          <div className="g2d-row g2d-log-row">
            <label>Base</label>
            <div className="g2d-presets">
              {LOG_PRESETS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`g2d-preset-btn ${(options[`${axis}LogBase`] || defaults[`${axis}LogBase`]) === value ? 'active' : ''}`}
                  onClick={() => onChange(`${axis}LogBase`, value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default G2DOptionsPanel;
