import React, { useRef, useEffect } from 'react';

/**
 * Annotation layer overlay for RoboCanvas
 * Transparent SVG layer for diagram annotations that scrolls with canvas
 */
export function AnnotationLayer({ onLayerReady }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && onLayerReady) {
      onLayerReady(svgRef.current);
    }
  }, [onLayerReady]);

  return (
    <svg
      ref={svgRef}
      id="annotation-layer"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 50
      }}
    />
  );
}

export default AnnotationLayer;
