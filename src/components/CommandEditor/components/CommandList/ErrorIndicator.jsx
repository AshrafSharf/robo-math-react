import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Error indicator with styled popup display using portal
 */
const ErrorIndicator = ({ error }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef(null);
  const errorMessage = error?.message || (error ? String(error) : '');

  useEffect(() => {
    if (showPopup && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPopupPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8
      });
    }
  }, [showPopup]);

  return (
    <div
      className="error-indicator"
      onMouseEnter={() => setShowPopup(true)}
      onMouseLeave={() => setShowPopup(false)}
      ref={iconRef}
    >
      <span className="error-indicator-icon">!</span>

      {showPopup && createPortal(
        <div
          className="error-popup"
          style={{
            position: 'fixed',
            top: popupPosition.top,
            left: popupPosition.left,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="error-popup-message">{errorMessage}</div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ErrorIndicator;
