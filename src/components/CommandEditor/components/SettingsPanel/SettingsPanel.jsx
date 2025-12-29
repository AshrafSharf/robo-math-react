import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import SettingsTabs from './SettingsTabs';
import ExpressionOptionsTab from './tabs/ExpressionOptionsTab';
import AnimationTab from './tabs/AnimationTab';
import RefTab from './tabs/RefTab';
import { detectExpressionType, hasOptionsPanel, hasRefTab, detectRefInnerType } from '../../utils/expressionTypeDetector';
import { getAllowedTabs } from '../../utils/expressionOptionsSchema';
import { ExpressionOptionsRegistry } from '../../../../engine/expression-parser/core/ExpressionOptionsRegistry';
import { extractVariables } from '../../auto_complete';

/**
 * Tabbed Settings Panel for command properties
 * - Expression Options (dynamic based on expression type)
 * - Ref (for ref expressions)
 * - Animation (speed)
 *
 * Note: Style options (color, strokeWidth, fontSize) are set via expression syntax:
 *   c(green), s(2), f(24)
 */
const SettingsPanel = ({ command, commands, onUpdate, onRedrawSingle, onClose, anchorElement, onApplySpeedToAll }) => {
  const panelRef = useRef(null);
  const [position, setPosition] = useState(null); // null until calculated
  const [arrowPosition, setArrowPosition] = useState(50);
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

  // Check allowed tabs from schema
  const allowedTabs = getAllowedTabs(expressionType);

  // Default tab: expression options
  const [activeTab, setActiveTab] = useState('expression');

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
    // If current tab is not allowed, switch to first allowed tab
    if (allowedTabs && !allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0] || 'expression');
      return;
    }
    // For types without options panel, default to animation tab
    if (activeTab === 'expression' && !hasOptionsPanel(effectiveStyleType)) {
      setActiveTab('animation');
    }
  }, [effectiveStyleType, activeTab, allowedTabs]);

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
            {activeTab === 'expression' && hasOptionsPanel(effectiveStyleType) && (
              <ExpressionOptionsTab
                expressionType={effectiveStyleType}
                options={currentExpressionOptions}
                onChange={handleExpressionOptionChange}
                onRedraw={onRedrawSingle}
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
