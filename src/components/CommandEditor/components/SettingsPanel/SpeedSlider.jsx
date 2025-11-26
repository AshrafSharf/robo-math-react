import React, { useRef, useState, useEffect } from 'react';

/**
 * Speed slider component (pure React, no jQuery UI)
 */
const SpeedSlider = ({ value, onChange, min = 1, max = 10, step = 0.05 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newValue = min + percentage * (max - min);
    const roundedValue = Math.round(newValue / step) * step;
    onChange(roundedValue);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSliderClick = (e) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newValue = min + percentage * (max - min);
    const roundedValue = Math.round(newValue / step) * step;
    onChange(roundedValue);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="play-speed">
      <div className="label-title">Speed:</div>
      <div className="speed-title">
        <div
          ref={sliderRef}
          className="slider"
          onClick={handleSliderClick}
        >
          <div
            className="ui-slider-range"
            style={{ width: `${percentage}%` }}
          />
          <div
            className="ui-slider-handle"
            style={{ left: `${percentage}%` }}
            onMouseDown={handleMouseDown}
          />
        </div>
        <div className="slider-value">{value.toFixed(2)} secs</div>
      </div>
    </div>
  );
};

export default SpeedSlider;
