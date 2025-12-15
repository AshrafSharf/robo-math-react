import React from 'react';
import ColorPicker from '../ColorPicker';

/**
 * Style Tab - Compact layout with stroke/fill colors and properties
 */
const StyleTab = ({ command, onUpdate, onColorChange, onFillColorChange }) => {
  const strokeColor = command.color || '#DC3912';
  const fillColor = command.fillColor || 'none';
  const strokeWidth = command.strokeWidth ?? 2;
  const strokeOpacity = command.strokeOpacity ?? 1;
  const fillOpacity = command.fillOpacity ?? 0.3;
  const hasFill = fillColor && fillColor !== 'none' && fillColor !== 'transparent';

  return (
    <div className="style-tab compact">
      {/* Stroke Color */}
      <ColorPicker
        selectedColor={strokeColor}
        onChange={onColorChange || ((color) => onUpdate({ color }))}
        label="Stroke:"
      />

      {/* Fill Color */}
      <ColorPicker
        selectedColor={fillColor}
        onChange={onFillColorChange || ((fillColor) => onUpdate({ fillColor }))}
        label="Fill:"
        allowNone={true}
      />

      {/* Compact row: Stroke Width + Stroke Opacity + Fill Opacity */}
      <div className="compact-controls-row">
        <div className="compact-control">
          <label>Stroke W</label>
          <input
            type="number"
            min="1"
            max="10"
            value={strokeWidth}
            onChange={(e) => onUpdate({ strokeWidth: Number(e.target.value) })}
          />
        </div>
        <div className="compact-control">
          <label>Stroke %</label>
          <input
            type="number"
            min="0"
            max="100"
            step="10"
            value={Math.round(strokeOpacity * 100)}
            onChange={(e) => onUpdate({ strokeOpacity: Number(e.target.value) / 100 })}
          />
        </div>
        <div className="compact-control">
          <label>Fill %</label>
          <input
            type="number"
            min="0"
            max="100"
            step="10"
            value={Math.round(fillOpacity * 100)}
            onChange={(e) => onUpdate({ fillOpacity: Number(e.target.value) / 100 })}
            disabled={!hasFill}
          />
        </div>
      </div>
    </div>
  );
};

export default StyleTab;
