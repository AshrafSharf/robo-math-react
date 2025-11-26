import { useEffect, useRef, useState } from 'react';

/**
 * Hook to automatically resize input width based on text content
 * @param {string} text - Text content to measure
 * @returns {Object} { width, measureRef } - Calculated width and ref for hidden span
 */
const useAutoResize = (text) => {
  const [width, setWidth] = useState(100);
  const measureRef = useRef(null);

  useEffect(() => {
    if (measureRef.current) {
      const measured = measureRef.current.offsetWidth;
      setWidth(measured + 20); // Add padding
    }
  }, [text]);

  return { width, measureRef };
};

export default useAutoResize;
