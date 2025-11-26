import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ColorPicker from './ColorPicker';
import SpeedSlider from './SpeedSlider';
import OffsetControls from './OffsetControls';

/**
 * Settings panel for command properties (color, speed, label, offset)
 */
const SettingsPanel = ({ command, onUpdate, onClose, anchorElement }) => {
  const panelRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState(50);

  // Calculate position based on anchor element
  useEffect(() => {
    if (!anchorElement || !panelRef.current) return;

    const updatePosition = () => {
      const anchorRect = anchorElement.getBoundingClientRect();
      const panelHeight = panelRef.current.offsetHeight;
      const panelWidth = panelRef.current.offsetWidth;

      let top = anchorRect.top - 80;
      const totalHeight = top + panelHeight;

      // Adjust if off screen
      if (totalHeight + 20 > window.innerHeight) {
        const offset = totalHeight - window.innerHeight;
        top = top - offset - 50;
      }

      // Calculate arrow position
      const arrowTop = ((anchorRect.top - top) / panelHeight) * 100;
      setArrowPosition(Math.max(14, Math.min(86, arrowTop)));

      setPosition({
        top,
        left: anchorRect.right
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [anchorElement]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!command) return null;

  return createPortal(
    <div
      ref={panelRef}
      className="cmd-setting popover right"
      style={{
        display: 'block',
        top: `${position.top}px`,
        left: `${position.left}px`,
        position: 'fixed'
      }}
    >
      <div className="arrow" style={{ top: `${arrowPosition}%` }} />
      <div className="popover-title">
        Settings
        <i
          className="glyphicon glyphicon-remove pull-right setting-close"
          onClick={onClose}
          style={{ cursor: 'pointer' }}
        />
      </div>
      <div className="popover-content">
        <ColorPicker
          selectedColor={command.color}
          onChange={(color) => onUpdate({ color })}
        />

        <SpeedSlider
          value={command.speed}
          onChange={(speed) => onUpdate({ speed })}
        />

        <div className="show-label-div">
          <label>
            <input
              type="checkbox"
              className="labeled-checkbox"
              checked={command.label}
              onChange={(e) => onUpdate({ label: e.target.checked })}
            />
            <span style={{ marginLeft: '5px' }}>Show Label</span>
          </label>
        </div>

        <OffsetControls
          offsetX={command.offsetX}
          offsetY={command.offsetY}
          onChangeX={(offsetX) => onUpdate({ offsetX })}
          onChangeY={(offsetY) => onUpdate({ offsetY })}
        />

        <div className="style-text">
          <input
            type="text"
            placeholder="Comment"
            value={command.text || ''}
            onChange={(e) => onUpdate({ text: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SettingsPanel;
