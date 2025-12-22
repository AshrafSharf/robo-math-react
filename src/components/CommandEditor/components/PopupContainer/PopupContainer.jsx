import React, { useRef, useState, useEffect, cloneElement, Children } from 'react';
import { createPortal } from 'react-dom';

/**
 * PopupContainer - A draggable, resizable popup container using React portal
 * Renders children in a floating window that can be moved and resized
 *
 * Focus/Blur behavior:
 * - On focus: overflow visible to show expanded command editor item
 * - On blur: overflow hidden with scrollbar visible
 */
const PopupContainer = ({
  children,
  onRestoreToSidebar,
  initialPosition = { top: 100, left: null, right: 20 },
  minWidth = 350,
  minHeight = 400
}) => {
  const containerRef = useRef(null);
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState({ width: 350, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Drag handlers
  const handleDragStart = (e) => {
    if (e.target.closest('.popup-restore-btn') || e.target.closest('.popup-resize-handle')) return;

    const rect = containerRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const newLeft = e.clientX - dragOffset.x;
      const newTop = e.clientY - dragOffset.y;

      // Keep within viewport bounds
      const maxLeft = window.innerWidth - size.width;
      const maxTop = window.innerHeight - 50;

      setPosition({
        left: Math.max(0, Math.min(newLeft, maxLeft)),
        top: Math.max(0, Math.min(newTop, maxTop)),
        right: null
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, size.width]);

  // Resize handlers
  const handleResizeStart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const deltaY = e.clientY - resizeStart.y;

      // Only vertical resize
      setSize(prev => ({
        ...prev,
        height: Math.max(minHeight, resizeStart.height + deltaY)
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStart, minHeight]);

  // Calculate position style
  const positionStyle = position.right !== null && position.left === null
    ? { top: position.top, right: position.right }
    : { top: position.top, left: position.left };

  // Handle focus/blur events for the popup content
  const handleInputFocus = () => setIsInputFocused(true);
  const handleInputBlur = () => {
    // Delay to check if focus moved to another input in the popup
    setTimeout(() => {
      const activeEl = document.activeElement;
      const isStillInPopup = activeEl?.closest('.robo-cmd-editor-popup');
      if (!isStillInPopup) {
        setIsInputFocused(false);
      }
    }, 100);
  };

  // Clone children to inject focus/blur handlers
  const childrenWithFocusHandlers = Children.map(children, child => {
    if (React.isValidElement(child)) {
      return cloneElement(child, {
        popupInputFocused: isInputFocused,
        onPopupInputFocus: handleInputFocus,
        onPopupInputBlur: handleInputBlur
      });
    }
    return child;
  });

  return createPortal(
    <div
      ref={containerRef}
      className={`robo-cmd-editor-popup ${isInputFocused ? 'input-focused' : ''}`}
      style={{
        ...positionStyle,
        width: size.width,
        minWidth: size.width,
        maxWidth: size.width,
        height: size.height,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* Popup Header */}
      <div
        className="popup-header"
        onMouseDown={handleDragStart}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <button
          className="popup-restore-btn"
          onClick={onRestoreToSidebar}
          title="Restore to sidebar"
        >
          <i className="glyphicon glyphicon-log-in" />
        </button>
        <span className="popup-title">Commands</span>
      </div>

      {/* Content wrapper - constrains CommandEditor, handles overflow */}
      <div className="popup-content-wrapper">
        {childrenWithFocusHandlers}
      </div>

      {/* Resize Handle */}
      <div
        className="popup-resize-handle"
        onMouseDown={handleResizeStart}
      />
    </div>,
    document.body
  );
};

export default PopupContainer;
