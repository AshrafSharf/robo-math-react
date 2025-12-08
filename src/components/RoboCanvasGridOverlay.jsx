import React from 'react';

/**
 * Grid overlay for RoboCanvas showing logical row/column coordinates
 * Helps visualize the coordinate system when placing elements
 */
export function RoboCanvasGridOverlay({
  pixelsPerUnit = 25,
  visible = false
}) {
  if (!visible) return null;

  // Use a large grid that covers typical viewport - lines extend full width/height
  const maxCols = 100;
  const maxRows = 400;
  const gridWidth = maxCols * pixelsPerUnit;
  const gridHeight = maxRows * pixelsPerUnit;

  // Generate vertical lines (columns)
  const verticalLines = [];
  for (let col = 0; col <= maxCols; col++) {
    const x = col * pixelsPerUnit;
    verticalLines.push(
      <line
        key={`v-${col}`}
        x1={x}
        y1={0}
        x2={x}
        y2={gridHeight}
        stroke="rgba(0, 100, 255, 0.2)"
        strokeWidth={col % 10 === 0 ? 1 : 0.5}
      />
    );
    // Column labels every 10 columns
    if (col % 10 === 0) {
      verticalLines.push(
        <text
          key={`vt-${col}`}
          x={x + 3}
          y={14}
          fontSize="11"
          fontWeight="bold"
          fill="rgba(0, 100, 255, 0.8)"
        >
          {col}
        </text>
      );
    }
  }

  // Generate horizontal lines (rows)
  const horizontalLines = [];
  for (let row = 0; row <= maxRows; row++) {
    const y = row * pixelsPerUnit;
    horizontalLines.push(
      <line
        key={`h-${row}`}
        x1={0}
        y1={y}
        x2={gridWidth}
        y2={y}
        stroke="rgba(0, 100, 255, 0.2)"
        strokeWidth={row % 10 === 0 ? 1 : 0.5}
      />
    );
    // Row labels every 10 rows
    if (row % 10 === 0 && row > 0) {
      horizontalLines.push(
        <text
          key={`ht-${row}`}
          x={3}
          y={y - 3}
          fontSize="11"
          fontWeight="bold"
          fill="rgba(0, 100, 255, 0.8)"
        >
          {row}
        </text>
      );
    }
  }

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        minWidth: gridWidth,
        minHeight: gridHeight,
        pointerEvents: 'none',
        zIndex: 1000
      }}
    >
      {verticalLines}
      {horizontalLines}
    </svg>
  );
}

export default RoboCanvasGridOverlay;
