import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * PopupContainer - A draggable, resizable popup container using React portal
 * Renders children in a floating window that can be moved and resized
 */
const PopupContainer = ({
  children,
  onRestoreToSidebar,
  initialPosition = { top: 100, left: null, right: 20 },
  minWidth = 300,
  minHeight = 400
}) => {
  const containerRef = useRef(null);
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState({ width: 350, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

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
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      setSize({
        width: Math.max(minWidth, resizeStart.width + deltaX),
        height: Math.max(minHeight, resizeStart.height + deltaY)
      });
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
  }, [isResizing, resizeStart, minWidth, minHeight]);

  // Calculate position style
  const positionStyle = position.right !== null && position.left === null
    ? { top: position.top, right: position.right }
    : { top: position.top, left: position.left };

  return createPortal(
    <div
      ref={containerRef}
      className="robo-cmd-editor-popup"
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

      {/* Content - no wrapper, let CommandEditor handle layout */}
      {children}

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
