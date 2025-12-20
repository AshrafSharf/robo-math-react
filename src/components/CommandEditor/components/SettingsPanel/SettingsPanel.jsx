import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import SettingsTabs from './SettingsTabs';
import StyleTab from './tabs/StyleTab';
import ExpressionOptionsTab from './tabs/ExpressionOptionsTab';
import AnimationTab from './tabs/AnimationTab';
import RefTab from './tabs/RefTab';
import { detectExpressionType, hasOptionsPanel, hasRefTab, detectRefInnerType } from '../../utils/expressionTypeDetector';
import { ExpressionOptionsRegistry } from '../../../../engine/expression-parser/core/ExpressionOptionsRegistry';
import { extractVariables } from '../../auto_complete';

/**
 * Tabbed Settings Panel for command properties
 * Tab 1: Style (color, label, offset, comment)
 * Tab 2: Expression Options (dynamic based on expression type)
 * Tab 3: Animation (speed)
 */
const SettingsPanel = ({ command, commands, onUpdate, onRedrawSingle, onClose, anchorElement, onApplySpeedToAll }) => {
  const panelRef = useRef(null);
  const [position, setPosition] = useState(null); // null until calculated
  const [arrowPosition, setArrowPosition] = useState(50);
  const [activeTab, setActiveTab] = useState('style');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [wasDragged, setWasDragged] = useState(false); // Track if user dragged the panel
  const [optionsVersion, setOptionsVersion] = useState(0); // Force re-read from registry
  const [size, setSize] = useState({ width: 400, height: 300 });

  // Detect expression type
  const expressionType = useMemo(() => {
    const { type } = detectExpressionType(command?.expression);
    return type;
  }, [command?.expression]);

  // Check if this is a ref expression
  const isRefExpression = hasRefTab(expressionType);

  // Get ref content from command model
  const refContent = command?.expressionOptions?.ref?.content || '';

  // Detect inner expression type for dynamic Style tab styling
  const refInnerType = useMemo(() => {
    if (!isRefExpression) return null;
    return detectRefInnerType(refContent);
  }, [isRefExpression, refContent]);

  // Use inner type for styling if available, otherwise use expression type
  const effectiveStyleType = refInnerType || expressionType;

  // Calculate command index for autocomplete
  const currentLineIndex = useMemo(() => {
    if (!commands || !command) return 0;
    return commands.findIndex(c => c.id === command.id);
  }, [commands, command]);

  // Create variable provider for autocomplete
  const variableProvider = useCallback((lineIndex) => {
    if (!commands) return [];
    return extractVariables(commands, lineIndex);
  }, [commands]);

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

  // Handle expression option changes - save to registry and command model
  const handleExpressionOptionChange = (optionKey, value) => {
    if (!expressionType || !command?.id) {
      return;
    }

    // Update the registry
    ExpressionOptionsRegistry.setExpressionOptions(command.id, expressionType, {
      [optionKey]: value
    });

    // Update command model for persistence (store in expressionOptions)
    const updatedExpressionOptions = {
      ...command.expressionOptions,
      [expressionType]: {
        ...(command.expressionOptions?.[expressionType] || {}),
        [optionKey]: value
      }
    };
    onUpdate({ expressionOptions: updatedExpressionOptions });

    // Force re-read from registry
    setOptionsVersion(v => v + 1);
  };

  // Handle stroke color change - save to registry, command model, and redraw
  const handleColorChange = (color) => {
    if (!command?.id) return;

    // Update the registry with the new color
    ExpressionOptionsRegistry.setById(command.id, { color });

    // Update command model for persistence
    onUpdate({ color });

    // Redraw just this command with new color (no full canvas redraw)
    if (onRedrawSingle) {
      onRedrawSingle({ color });
    }
  };

  // Handle fill color change - save to registry, command model, and redraw
  const handleFillColorChange = (fillColor) => {
    if (!command?.id) return;

    // Update the registry with the new fill color
    ExpressionOptionsRegistry.setById(command.id, { fillColor });

    // Update command model for persistence
    onUpdate({ fillColor });

    // Redraw just this command with new fill (no full canvas redraw)
    if (onRedrawSingle) {
      onRedrawSingle({ fill: fillColor });
    }
  };

  // Handle stroke width change - save to registry, command model, and redraw
  const handleStrokeWidthChange = (strokeWidth) => {
    if (!command?.id) return;

    // Update the registry with the new stroke width
    ExpressionOptionsRegistry.setById(command.id, { strokeWidth });

    // Update command model for persistence
    onUpdate({ strokeWidth });

    // Redraw just this command with new stroke width (no full canvas redraw)
    if (onRedrawSingle) {
      onRedrawSingle({ strokeWidth });
    }
  };

  // Handle stroke opacity change - save to registry, command model, and redraw
  const handleStrokeOpacityChange = (strokeOpacity) => {
    if (!command?.id) return;

    // Update the registry with the new stroke opacity
    ExpressionOptionsRegistry.setById(command.id, { strokeOpacity });

    // Update command model for persistence
    onUpdate({ strokeOpacity });

    // Redraw just this command with new stroke opacity (no full canvas redraw)
    if (onRedrawSingle) {
      onRedrawSingle({ strokeOpacity });
    }
  };

  // Handle fill opacity change - save to registry, command model, and redraw
  const handleFillOpacityChange = (fillOpacity) => {
    if (!command?.id) return;

    // Update the registry with the new fill opacity
    ExpressionOptionsRegistry.setById(command.id, { fillOpacity });

    // Update command model for persistence
    onUpdate({ fillOpacity });

    // Redraw just this command with new fill opacity (no full canvas redraw)
    if (onRedrawSingle) {
      onRedrawSingle({ fillOpacity });
    }
  };

  // Handle font size change - save to registry, command model, and redraw
  const handleFontSizeChange = (fontSize) => {
    if (!command?.id || !expressionType) return;

    // Update the registry with the new font size (expression-specific option)
    ExpressionOptionsRegistry.setExpressionOptions(command.id, expressionType, { fontSize });

    // Update command model for persistence (store in expressionOptions)
    const updatedExpressionOptions = {
      ...command.expressionOptions,
      [expressionType]: {
        ...(command.expressionOptions?.[expressionType] || {}),
        fontSize
      }
    };
    onUpdate({ expressionOptions: updatedExpressionOptions });

    // Force re-read from registry
    setOptionsVersion(v => v + 1);

    // Redraw the command with new font size (clears and re-inits)
    if (onRedrawSingle) {
      onRedrawSingle({ fontSize });
    }
  };

  // Handle ref content change - save to registry and trigger redraw
  const handleRefContentChange = (content) => {
    if (!command?.id) return;

    // Update the registry with the new content
    ExpressionOptionsRegistry.setExpressionOptions(command.id, 'ref', { content });

    // Update command model for persistence
    const updatedExpressionOptions = {
      ...command.expressionOptions,
      ref: { ...(command.expressionOptions?.ref || {}), content }
    };
    onUpdate({ expressionOptions: updatedExpressionOptions });

    // Force re-read from registry
    setOptionsVersion(v => v + 1);
  };

  // Switch to a valid tab if current tab becomes disabled
  useEffect(() => {
    if (activeTab === 'expression' && !hasOptionsPanel(effectiveStyleType)) {
      setActiveTab('style');
    }
  }, [effectiveStyleType, activeTab]);

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

      <ResizableBox
        width={size.width}
        height={size.height}
        minConstraints={[400, 300]}
        onResize={(e, { size: newSize }) => setSize(newSize)}
        resizeHandles={['se']}
      >
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
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
            innerExpressionType={refInnerType}
          />

          {/* Tab content */}
          <div className="popover-content tab-content" style={{ flex: 1, overflow: 'auto' }}>
            {activeTab === 'style' && (
              <StyleTab
                command={command}
                expressionType={effectiveStyleType}
                expressionOptions={currentExpressionOptions}
                onUpdate={onUpdate}
                onColorChange={handleColorChange}
                onFillColorChange={handleFillColorChange}
                onStrokeWidthChange={handleStrokeWidthChange}
                onStrokeOpacityChange={handleStrokeOpacityChange}
                onFillOpacityChange={handleFillOpacityChange}
                onFontSizeChange={handleFontSizeChange}
              />
            )}

            {activeTab === 'expression' && hasOptionsPanel(effectiveStyleType) && (
              <ExpressionOptionsTab
                expressionType={effectiveStyleType}
                options={currentExpressionOptions}
                onChange={handleExpressionOptionChange}
              />
            )}

            {activeTab === 'ref' && isRefExpression && (
              <RefTab
                content={refContent}
                onChange={handleRefContentChange}
                variableProvider={variableProvider}
                currentLineIndex={currentLineIndex}
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
        </div>
      </ResizableBox>
    </div>,
    document.body
  );
};

export default SettingsPanel;
