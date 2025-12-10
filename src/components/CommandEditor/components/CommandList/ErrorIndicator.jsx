import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Error indicator with styled popup display using portal
 * Click to copy error message to clipboard
 */
const ErrorIndicator = ({ error }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [copied, setCopied] = useState(false);
  const iconRef = useRef(null);
  const errorMessage = error?.message || (error ? String(error) : '');

  const handleClick = async () => {
    if (errorMessage) {
      await navigator.clipboard.writeText(errorMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

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
      onClick={handleClick}
      ref={iconRef}
      style={{ cursor: 'pointer' }}
      title="Click to copy error"
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
          <div className="error-popup-message">
            {copied ? 'Copied!' : errorMessage}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ErrorIndicator;
