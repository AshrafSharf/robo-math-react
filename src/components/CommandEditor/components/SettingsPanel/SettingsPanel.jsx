import React, { useRef, useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import SettingsTabs from './SettingsTabs';
import StyleTab from './tabs/StyleTab';
import ExpressionOptionsTab from './tabs/ExpressionOptionsTab';
import AnimationTab from './tabs/AnimationTab';
import { detectExpressionType, hasOptionsPanel } from '../../utils/expressionTypeDetector';
import { ExpressionOptionsRegistry } from '../../../../engine/expression-parser/core/ExpressionOptionsRegistry';

/**
 * Tabbed Settings Panel for command properties
 * Tab 1: Style (color, label, offset, comment)
 * Tab 2: Expression Options (dynamic based on expression type)
 * Tab 3: Animation (speed)
 */
const SettingsPanel = ({ command, onUpdate, onRedrawSingle, onClose, anchorElement, onApplySpeedToAll }) => {
  const panelRef = useRef(null);
  const [position, setPosition] = useState(null); // null until calculated
  const [arrowPosition, setArrowPosition] = useState(50);
  const [activeTab, setActiveTab] = useState('style');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [wasDragged, setWasDragged] = useState(false); // Track if user dragged the panel
  const [optionsVersion, setOptionsVersion] = useState(0); // Force re-read from registry

  // Detect expression type
  const expressionType = useMemo(() => {
    const { type } = detectExpressionType(command?.expression);
    return type;
  }, [command?.expression]);

  // Calculate position based on anchor element (only on initial render or if not dragged)
  useEffect(() => {
    if (!anchorElement || !panelRef.current) return;
    if (wasDragged) return; // Don't reposition if user dragged it

    const updatePosition = () => {
      if (wasDragged) return;

      const anchorRect = anchorElement.getBoundingClientRect();
      const panelHeight = panelRef.current.offsetHeight;

      let top = anchorRect.top - 80;
      const totalHeight = top + panelHeight;

      // Adjust if off screen
      if (totalHeight + 20 > window.innerHeight) {
        const offset = totalHeight - window.innerHeight;
        top = top - offset - 50;
      }

      // Ensure top is not negative
      if (top < 10) {
        top = 10;
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
  }, [anchorElement, wasDragged]); // Remove activeTab dependency

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

  // Get current expression options from registry
  const currentExpressionOptions = useMemo(() => {
    if (!command?.id || !expressionType) return {};
    const rawOptions = ExpressionOptionsRegistry.getRawById(command.id);
    return rawOptions.expressionOptions?.[expressionType] || {};
  }, [command?.id, expressionType, optionsVersion]);

  // Handle expression option changes - save to registry
  const handleExpressionOptionChange = (optionKey, value) => {
    console.log('📝 handleExpressionOptionChange:', optionKey, '=', value, 'expressionType:', expressionType, 'commandId:', command?.id);
    if (!expressionType || !command?.id) {
      console.log('❌ Missing expressionType or command.id');
      return;
    }

    // Update the registry
    ExpressionOptionsRegistry.setExpressionOptions(command.id, expressionType, {
      [optionKey]: value
    });
    console.log('📝 Registry updated, calling onUpdate');

    // Force re-read from registry
    setOptionsVersion(v => v + 1);

    // Trigger re-render by updating command (this will cause pipeline to re-fetch from registry)
    onUpdate({});
  };

  // Handle stroke color change - save to registry and redraw single command
  const handleColorChange = (color) => {
    if (!command?.id) return;

    // Update the registry with the new color
    ExpressionOptionsRegistry.setById(command.id, { color });

    // Redraw just this command with new color (no full canvas redraw)
    if (onRedrawSingle) {
      onRedrawSingle({ color });
    }
  };

  // Handle fill color change - save to registry and redraw single command
  const handleFillColorChange = (fillColor) => {
    if (!command?.id) return;

    // Update the registry with the new fill color
    ExpressionOptionsRegistry.setById(command.id, { fillColor });

    // Redraw just this command with new fill (no full canvas redraw)
    if (onRedrawSingle) {
      onRedrawSingle({ fill: fillColor });
    }
  };

  // Handle stroke width change - save to registry and redraw single command
  const handleStrokeWidthChange = (strokeWidth) => {
    if (!command?.id) return;

    // Update the registry with the new stroke width
    ExpressionOptionsRegistry.setById(command.id, { strokeWidth });

    // Redraw just this command with new stroke width (no full canvas redraw)
    if (onRedrawSingle) {
      onRedrawSingle({ strokeWidth });
    }
  };

  // Handle stroke opacity change - save to registry and redraw single command
  const handleStrokeOpacityChange = (strokeOpacity) => {
    if (!command?.id) return;

    // Update the registry with the new stroke opacity
    ExpressionOptionsRegistry.setById(command.id, { strokeOpacity });

    // Redraw just this command with new stroke opacity (no full canvas redraw)
    if (onRedrawSingle) {
      onRedrawSingle({ strokeOpacity });
    }
  };

  // Switch to a valid tab if current tab becomes disabled
  useEffect(() => {
    if (activeTab === 'expression' && !hasOptionsPanel(expressionType)) {
      setActiveTab('style');
    }
  }, [expressionType, activeTab]);

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.settings-close-btn')) return; // Don't drag when clicking close
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - (position?.left || 0),
      y: e.clientY - (position?.top || 0)
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      setPosition({
        left: e.clientX - dragOffset.x,
        top: e.clientY - dragOffset.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setWasDragged(true); // Remember that user positioned the panel
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!command) return null;

  return createPortal(
    <div
      ref={panelRef}
      className="cmd-setting popover right tabbed-settings"
      style={{
        display: 'block',
        top: position ? `${position.top}px` : '-9999px',
        left: position ? `${position.left}px` : '-9999px',
        position: 'fixed',
        visibility: position ? 'visible' : 'hidden'
      }}
    >
      <div className="arrow" style={{ top: `${arrowPosition}%` }} />

      {/* Header with tabs - draggable */}
      <div
        className="popover-title tabbed-header"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <span className="settings-title">Settings</span>
        <i
          className="glyphicon glyphicon-remove settings-close-btn"
          onClick={onClose}
        />
      </div>

      {/* Tab navigation */}
      <SettingsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        expressionType={expressionType}
      />

      {/* Tab content */}
      <div className="popover-content tab-content">
        {activeTab === 'style' && (
          <StyleTab
            command={command}
            expressionType={expressionType}
            onUpdate={onUpdate}
            onColorChange={handleColorChange}
            onFillColorChange={handleFillColorChange}
            onStrokeWidthChange={handleStrokeWidthChange}
            onStrokeOpacityChange={handleStrokeOpacityChange}
          />
        )}

        {activeTab === 'expression' && hasOptionsPanel(expressionType) && (
          <ExpressionOptionsTab
            expressionType={expressionType}
            options={currentExpressionOptions}
            onChange={handleExpressionOptionChange}
          />
        )}

        {activeTab === 'animation' && (
          <AnimationTab
            speed={command.speed}
            onSpeedChange={(speed) => onUpdate({ speed })}
            onApplyToAllChange={onApplySpeedToAll}
          />
        )}
      </div>
    </div>,
    document.body
  );
};

export default SettingsPanel;
